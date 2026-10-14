import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../index';
import { AppDataSource } from '../src/shared/db/data-source';
import { Role } from '../src/entities/role.entity';
import { User } from '../src/entities/user.entity';

// Needs the categories tables: run server/sql/categories.sql on the test DB first.

const API = '/api/v1';
const RUN_ID = Date.now().toString(36).slice(-6).toLowerCase();

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'Admin@123';
// The Employee is created for this run (see beforeAll), so the spec doesn't
// depend on any particular account already existing in the database.
const EMPLOYEE_EMAIL = `cat-e2e-${RUN_ID}@test.local`;
const EMPLOYEE_PASSWORD = 'Test@12345';

const GHOST_ID = '00000000-0000-4000-8000-000000000000';

describe('Categories E2E', () => {
  let adminToken: string;
  let employeeToken: string;
  let employeeUserId: string | undefined;

  // Every category created by a test, so afterAll can remove them
  // (children first, otherwise the parent delete is refused).
  const createdIds: string[] = [];

  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

  async function createCategory(body: Record<string, unknown>, token = adminToken) {
    const res = await request(app).post(`${API}/categories`).set(auth(token)).send(body);
    if (res.status === 201) createdIds.push(res.body.data.category_id);
    return res;
  }

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const adminLogin = await request(app)
      .post(`${API}/auth/login`)
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    adminToken = adminLogin.body.data?.accessToken;
    expect(
      adminToken,
      `Admin login failed: ${adminLogin.status} ${JSON.stringify(adminLogin.body)} (run "npm run seed" first)`
    ).toBeDefined();

    // Throwaway Employee for the role-guard tests. The API creates users with
    // an unverified email, so mark it verified directly in the database.
    const employeeRole = await AppDataSource.getRepository(Role).findOne({
      where: { name: 'Employee' },
    });
    expect(employeeRole, 'Employee role not found — run "npm run seed" first').toBeTruthy();

    const created = await request(app)
      .post(`${API}/users`)
      .set(auth(adminToken))
      .send({
        role_id: employeeRole!.role_id,
        first_name: 'Category',
        last_name: 'Tester',
        email: EMPLOYEE_EMAIL,
        password: EMPLOYEE_PASSWORD,
      });
    employeeUserId = created.body.data?.user_id;
    expect(
      employeeUserId,
      `Creating the test employee failed: ${created.status} ${JSON.stringify(created.body)}`
    ).toBeDefined();

    await AppDataSource.getRepository(User).update(
      { user_id: employeeUserId! },
      { email_verified: true }
    );

    const empLogin = await request(app)
      .post(`${API}/auth/login`)
      .send({ email: EMPLOYEE_EMAIL, password: EMPLOYEE_PASSWORD });
    employeeToken = empLogin.body.data?.accessToken;
    expect(
      employeeToken,
      `Employee login failed: ${empLogin.status} ${JSON.stringify(empLogin.body)}`
    ).toBeDefined();
  });

  afterAll(async () => {
    for (const id of [...createdIds].reverse()) {
      try {
        await request(app).delete(`${API}/categories/${id}`).set(auth(adminToken));
      } catch {}
    }
    if (employeeUserId) {
      try {
        await request(app).delete(`${API}/users/${employeeUserId}`).set(auth(adminToken));
      } catch {}
    }
  });

  describe('Auth guard', () => {
    it('GET /categories without token → 401', async () => {
      const res = await request(app).get(`${API}/categories`);
      expect(res.status).toBe(401);
    });

    it('POST /categories without token → 401', async () => {
      const res = await request(app)
        .post(`${API}/categories`)
        .send({ name: 'Hack', slug: 'hack' });
      expect(res.status).toBe(401);
    });

    it('PATCH /categories/:id without token → 401', async () => {
      const res = await request(app).patch(`${API}/categories/${GHOST_ID}`).send({ name: 'Hack' });
      expect(res.status).toBe(401);
    });

    it('DELETE /categories/:id without token → 401', async () => {
      const res = await request(app).delete(`${API}/categories/${GHOST_ID}`);
      expect(res.status).toBe(401);
    });

    it('GET /categories/contents/:contentId without token → 401', async () => {
      const res = await request(app).get(`${API}/categories/contents/${GHOST_ID}`);
      expect(res.status).toBe(401);
    });
  });

  describe('Role guard — only Admin/Manager change the category tree', () => {
    it('Employee can list categories → 200', async () => {
      const res = await request(app).get(`${API}/categories`).set(auth(employeeToken));
      expect(res.status).toBe(200);
    });

    it('Employee cannot create a category → 403', async () => {
      const res = await createCategory(
        { name: `Employee Cat ${RUN_ID}`, slug: `employee-cat-${RUN_ID}` },
        employeeToken
      );
      expect(res.status).toBe(403);
    });

    it('Employee cannot update a category → 403', async () => {
      const res = await request(app)
        .patch(`${API}/categories/${GHOST_ID}`)
        .set(auth(employeeToken))
        .send({ name: 'Nope' });
      expect(res.status).toBe(403);
    });

    it('Employee cannot delete a category → 403', async () => {
      const res = await request(app).delete(`${API}/categories/${GHOST_ID}`).set(auth(employeeToken));
      expect(res.status).toBe(403);
    });
  });

  describe('POST /categories — Create', () => {
    const parentName = `E2E Parent ${RUN_ID}`;
    const parentSlug = `e2e-parent-${RUN_ID}`;
    let parentId: string;

    it('creates a top-level category', async () => {
      const res = await createCategory({ name: parentName, slug: parentSlug });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.category_id).toBeDefined();
      expect(res.body.data.name).toBe(parentName);
      expect(res.body.data.slug).toBe(parentSlug);
      expect(res.body.data.parent_id).toBeNull();

      parentId = res.body.data.category_id;
    });

    it('creates a child under an existing category', async () => {
      const res = await createCategory({
        name: `E2E Child ${RUN_ID}`,
        slug: `e2e-child-${RUN_ID}`,
        parent_id: parentId,
      });

      expect(res.status).toBe(201);
      expect(res.body.data.parent_id).toBe(parentId);
    });

    it('rejects a duplicate top-level name (case-insensitive) → 409', async () => {
      const res = await createCategory({
        name: parentName.toUpperCase(),
        slug: `another-slug-${RUN_ID}`,
      });

      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/already exists/i);
    });

    it('rejects a duplicate name under the same parent → 409', async () => {
      const res = await createCategory({
        name: `e2e child ${RUN_ID}`,
        slug: `e2e-child-dup-${RUN_ID}`,
        parent_id: parentId,
      });

      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/already exists/i);
    });

    it('allows the same name under a different parent → 201', async () => {
      const otherParent = await createCategory({
        name: `E2E Other Parent ${RUN_ID}`,
        slug: `e2e-other-parent-${RUN_ID}`,
      });
      expect(otherParent.status).toBe(201);

      const res = await createCategory({
        name: `E2E Child ${RUN_ID}`, // same name as the child under the first parent
        slug: `e2e-child-other-${RUN_ID}`,
        parent_id: otherParent.body.data.category_id,
      });

      expect(res.status).toBe(201);
    });

    it('rejects a duplicate slug → 409', async () => {
      const res = await createCategory({
        name: `Unique Name ${RUN_ID}`,
        slug: parentSlug,
      });

      expect(res.status).toBe(409);
    });

    it('rejects an unknown parent → 404', async () => {
      const res = await createCategory({
        name: `Orphan ${RUN_ID}`,
        slug: `orphan-${RUN_ID}`,
        parent_id: GHOST_ID,
      });

      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/parent category not found/i);
    });

    it('rejects a malformed parent id → 400', async () => {
      const res = await createCategory({
        name: `Bad Parent ${RUN_ID}`,
        slug: `bad-parent-${RUN_ID}`,
        parent_id: 'not-a-uuid',
      });

      expect(res.status).toBe(400);
    });

    it('rejects a missing name → 400', async () => {
      const res = await createCategory({ slug: `no-name-${RUN_ID}` });
      expect(res.status).toBe(400);
    });

    it('rejects a missing slug → 400', async () => {
      const res = await createCategory({ name: `No Slug ${RUN_ID}` });
      expect(res.status).toBe(400);
    });

    it('rejects a blank name → 400', async () => {
      const res = await createCategory({ name: '   ', slug: `blank-name-${RUN_ID}` });
      expect(res.status).toBe(400);
    });

    it('resists SQL injection in name', async () => {
      const res = await createCategory({
        name: "'; DROP TABLE categories; --",
        slug: `sqli-${RUN_ID}`,
      });

      expect([201, 400, 409]).toContain(res.status);
      expect(res.status).not.toBe(500);

      const check = await request(app).get(`${API}/categories`).set(auth(adminToken));
      expect(check.status).toBe(200);
    });
  });

  describe('GET /categories — List and fetch', () => {
    let categoryId: string;

    beforeAll(async () => {
      const res = await createCategory({
        name: `E2E List ${RUN_ID}`,
        slug: `e2e-list-${RUN_ID}`,
      });
      categoryId = res.body.data.category_id;
    });

    it('returns paginated categories', async () => {
      const res = await request(app).get(`${API}/categories`).set(auth(adminToken));

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.total).toBeGreaterThan(0);
    });

    it('respects the limit query param', async () => {
      const res = await request(app).get(`${API}/categories?limit=1`).set(auth(adminToken));

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(1);
    });

    it('returns a category by id', async () => {
      const res = await request(app).get(`${API}/categories/${categoryId}`).set(auth(adminToken));

      expect(res.status).toBe(200);
      expect(res.body.data.category_id).toBe(categoryId);
    });

    it('non-existent category → 404', async () => {
      const res = await request(app).get(`${API}/categories/${GHOST_ID}`).set(auth(adminToken));
      expect(res.status).toBe(404);
    });

    it('malformed id → 400', async () => {
      const res = await request(app).get(`${API}/categories/not-a-uuid`).set(auth(adminToken));
      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /categories/:id — Update and hierarchy rules', () => {
    let rootId: string;
    let childId: string;
    let grandchildId: string;
    let siblingName: string;

    beforeAll(async () => {
      const root = await createCategory({
        name: `E2E Root ${RUN_ID}`,
        slug: `e2e-root-${RUN_ID}`,
      });
      rootId = root.body.data.category_id;

      const child = await createCategory({
        name: `E2E Mid ${RUN_ID}`,
        slug: `e2e-mid-${RUN_ID}`,
        parent_id: rootId,
      });
      childId = child.body.data.category_id;

      const grandchild = await createCategory({
        name: `E2E Leaf ${RUN_ID}`,
        slug: `e2e-leaf-${RUN_ID}`,
        parent_id: childId,
      });
      grandchildId = grandchild.body.data.category_id;

      siblingName = `E2E Sibling ${RUN_ID}`;
      await createCategory({
        name: siblingName,
        slug: `e2e-sibling-${RUN_ID}`,
        parent_id: rootId,
      });
    });

    it('renames a category', async () => {
      const res = await request(app)
        .patch(`${API}/categories/${childId}`)
        .set(auth(adminToken))
        .send({ name: `E2E Mid ${RUN_ID} v2` });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe(`E2E Mid ${RUN_ID} v2`);
    });

    it('allows changing only the capitalisation of its own name', async () => {
      const res = await request(app)
        .patch(`${API}/categories/${childId}`)
        .set(auth(adminToken))
        .send({ name: `E2E MID ${RUN_ID} V2` });

      expect(res.status).toBe(200);
    });

    it('rejects renaming to a sibling’s name → 409', async () => {
      const res = await request(app)
        .patch(`${API}/categories/${childId}`)
        .set(auth(adminToken))
        .send({ name: siblingName });

      expect(res.status).toBe(409);
    });

    it('non-existent category → 404', async () => {
      const res = await request(app)
        .patch(`${API}/categories/${GHOST_ID}`)
        .set(auth(adminToken))
        .send({ name: 'Ghost' });

      expect(res.status).toBe(404);
    });

    it('rejects moving a category under itself → 400', async () => {
      const res = await request(app)
        .patch(`${API}/categories/${rootId}`)
        .set(auth(adminToken))
        .send({ parent_id: rootId });

      expect(res.status).toBe(400);
    });

    it('rejects moving a category under its own descendant → 400', async () => {
      const res = await request(app)
        .patch(`${API}/categories/${rootId}`)
        .set(auth(adminToken))
        .send({ parent_id: grandchildId });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/subcategories/i);
    });

    it('rejects moving under a non-existent parent → 404', async () => {
      const res = await request(app)
        .patch(`${API}/categories/${childId}`)
        .set(auth(adminToken))
        .send({ parent_id: GHOST_ID });

      expect(res.status).toBe(404);
    });

    it('moves a subcategory to the top level', async () => {
      const res = await request(app)
        .patch(`${API}/categories/${grandchildId}`)
        .set(auth(adminToken))
        .send({ parent_id: null });

      expect(res.status).toBe(200);
      expect(res.body.data.parent_id).toBeNull();
    });
  });

  describe('DELETE /categories/:id', () => {
    it('refuses to delete a category that still has subcategories → 409', async () => {
      const parent = await createCategory({
        name: `E2E Del Parent ${RUN_ID}`,
        slug: `e2e-del-parent-${RUN_ID}`,
      });
      const parentId = parent.body.data.category_id;
      await createCategory({
        name: `E2E Del Child ${RUN_ID}`,
        slug: `e2e-del-child-${RUN_ID}`,
        parent_id: parentId,
      });

      const res = await request(app).delete(`${API}/categories/${parentId}`).set(auth(adminToken));

      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/subcategories/i);

      // ...and it's still there
      const still = await request(app).get(`${API}/categories/${parentId}`).set(auth(adminToken));
      expect(still.status).toBe(200);
    });

    it('deletes a category without subcategories', async () => {
      const created = await createCategory({
        name: `Delete Me ${RUN_ID}`,
        slug: `delete-me-${RUN_ID}`,
      });
      const id = created.body.data.category_id;

      const res = await request(app).delete(`${API}/categories/${id}`).set(auth(adminToken));
      expect(res.status).toBe(200);

      const after = await request(app).get(`${API}/categories/${id}`).set(auth(adminToken));
      expect(after.status).toBe(404);
    });

    it('deleting a non-existent category → 404', async () => {
      const res = await request(app).delete(`${API}/categories/${GHOST_ID}`).set(auth(adminToken));
      expect(res.status).toBe(404);
    });
  });

  describe('Category ↔ Content relationship', () => {
    let projectId: string;
    let contentId: string;
    let categoryId: string;

    beforeAll(async () => {
      const proj = await request(app)
        .post(`${API}/projects`)
        .set(auth(adminToken))
        .send({
          name: `Category Test Project ${RUN_ID}`,
          key_code: `CAT_${RUN_ID.toUpperCase()}`,
          status: 'Active',
        });
      projectId = proj.body.data?.project_id;
      expect(projectId).toBeDefined();

      const content = await request(app)
        .post(`${API}/contents`)
        .set(auth(adminToken))
        .send({
          project_id: projectId,
          title: 'Category E2E Content',
          slug: `category-e2e-${RUN_ID}`,
          body: 'Content used to test category attachment',
        });
      contentId = content.body.data?.content_id;
      expect(contentId).toBeDefined();

      const category = await createCategory({
        name: `E2E Attach ${RUN_ID}`,
        slug: `e2e-attach-${RUN_ID}`,
      });
      categoryId = category.body.data.category_id;
    });

    afterAll(async () => {
      try {
        await request(app).delete(`${API}/contents/${contentId}`).set(auth(adminToken));
      } catch {}
      try {
        await request(app).patch(`${API}/projects/${projectId}/archive`).set(auth(adminToken));
      } catch {}
    });

    it('lists no categories for fresh content', async () => {
      const res = await request(app)
        .get(`${API}/categories/contents/${contentId}`)
        .set(auth(adminToken));

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it('attaches a category to content', async () => {
      const res = await request(app)
        .post(`${API}/categories/${categoryId}/contents/${contentId}`)
        .set(auth(adminToken));

      expect(res.status).toBe(201);
    });

    it('rejects attaching the same category twice → 409', async () => {
      const res = await request(app)
        .post(`${API}/categories/${categoryId}/contents/${contentId}`)
        .set(auth(adminToken));

      expect(res.status).toBe(409);
    });

    it('lists the attached category for the content', async () => {
      const res = await request(app)
        .get(`${API}/categories/contents/${contentId}`)
        .set(auth(adminToken));

      expect(res.status).toBe(200);
      expect(res.body.data.map((c: { category_id: string }) => c.category_id)).toContain(categoryId);
    });

    it('any signed-in user can attach and detach (Employee) — detach → 200', async () => {
      const res = await request(app)
        .delete(`${API}/categories/${categoryId}/contents/${contentId}`)
        .set(auth(employeeToken));

      expect(res.status).toBe(200);
    });

    it('detaching a category that is not attached → 404', async () => {
      const res = await request(app)
        .delete(`${API}/categories/${categoryId}/contents/${contentId}`)
        .set(auth(adminToken));

      expect(res.status).toBe(404);
    });

    it('attaching to non-existent content → 404', async () => {
      const res = await request(app)
        .post(`${API}/categories/${categoryId}/contents/${GHOST_ID}`)
        .set(auth(adminToken));

      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/content not found/i);
    });

    it('attaching a non-existent category → 404', async () => {
      const res = await request(app)
        .post(`${API}/categories/${GHOST_ID}/contents/${contentId}`)
        .set(auth(adminToken));

      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/category not found/i);
    });

    it('deleting a category also removes its content links', async () => {
      const temp = await createCategory({
        name: `E2E Cascade ${RUN_ID}`,
        slug: `e2e-cascade-${RUN_ID}`,
      });
      const tempId = temp.body.data.category_id;

      const attach = await request(app)
        .post(`${API}/categories/${tempId}/contents/${contentId}`)
        .set(auth(adminToken));
      expect(attach.status).toBe(201);

      const del = await request(app).delete(`${API}/categories/${tempId}`).set(auth(adminToken));
      expect(del.status).toBe(200);

      const list = await request(app)
        .get(`${API}/categories/contents/${contentId}`)
        .set(auth(adminToken));
      expect(list.status).toBe(200);
      expect(list.body.data.map((c: { category_id: string }) => c.category_id)).not.toContain(tempId);
    });
  });

  describe('HTTP protocol', () => {
    it('unknown category route → 404', async () => {
      const res = await request(app)
        .get(`${API}/categories/${GHOST_ID}/nonexistent`)
        .set(auth(adminToken));
      expect(res.status).toBe(404);
    });

    it('malformed JSON → 400', async () => {
      const res = await request(app)
        .post(`${API}/categories`)
        .set(auth(adminToken))
        .set('Content-Type', 'application/json')
        .send('{ bad json');
      expect(res.status).toBe(400);
    });
  });
});