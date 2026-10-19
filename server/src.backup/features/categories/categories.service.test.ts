import { describe, it, expect, vi, beforeEach } from "vitest";
import { CategoriesService } from "./categories.service";
import type { Category } from "../../entities/category.entity";
import type { ContentCategory } from "../../entities/content-category.entity";

// The duplicate-name check goes through a query builder, so it gets its own
// chainable mock: where()/andWhere() return the builder, getOne() is what each
// test controls.
const queryBuilder = {
  where: vi.fn(),
  andWhere: vi.fn(),
  getOne: vi.fn(),
};

const categoryRepo = {
  findOne: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
  merge: vi.fn(),
  delete: vi.fn(),
  count: vi.fn(),
  createQueryBuilder: vi.fn(),
};

const contentCategoryRepo = {
  findOne: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
  find: vi.fn(),
};

const contentRepo = {
  findOne: vi.fn(),
};

// getRepo is called with an entity class; route it to the right mock based
// on which one's asked for, same as the real repositories.ts would.
vi.mock("../../shared/db/repositories", () => ({
  getRepo: (entity: unknown) => {
    const name = (entity as { name?: string })?.name;
    if (name === "ContentCategory") return contentCategoryRepo;
    if (name === "Content") return contentRepo;
    return categoryRepo;
  },
}));

// Categories "in the database" for a test. findOne looks them up by id, so
// hierarchy tests can just register a few categories with parent_id links.
const store = new Map<string, Category>();

function makeCategory(overrides: Partial<Category> = {}): Category {
  return {
    category_id: "cat-1",
    name: "Security",
    slug: "security",
    parent_id: null,
    created_at: new Date(),
    ...overrides,
  } as Category;
}

function seed(...categories: Category[]) {
  categories.forEach((c) => store.set(c.category_id, c));
}

function makeLink(overrides: Partial<ContentCategory> = {}): ContentCategory {
  return {
    content_id: "content-1",
    category_id: "cat-1",
    created_at: new Date(),
    ...overrides,
  } as ContentCategory;
}

function resetMocks() {
  store.clear();

  for (const repo of [categoryRepo, contentCategoryRepo, contentRepo]) {
    for (const fn of Object.values(repo)) (fn as ReturnType<typeof vi.fn>).mockReset();
  }
  for (const fn of Object.values(queryBuilder)) fn.mockReset();

  queryBuilder.where.mockReturnValue(queryBuilder);
  queryBuilder.andWhere.mockReturnValue(queryBuilder);
  queryBuilder.getOne.mockResolvedValue(null); // no name collision by default
  categoryRepo.createQueryBuilder.mockReturnValue(queryBuilder);

  categoryRepo.findOne.mockImplementation(async ({ where }: any) => store.get(where.category_id) ?? null);
  categoryRepo.create.mockImplementation((data: any) => data);
  categoryRepo.save.mockImplementation(async (entity: any) => entity);
  categoryRepo.merge.mockImplementation((target: any, source: any) => Object.assign(target, source));

  contentCategoryRepo.create.mockImplementation((data: any) => data);
  contentCategoryRepo.save.mockImplementation(async (entity: any) => entity);
}

describe("CategoriesService", () => {
  let service: CategoriesService;

  beforeEach(() => {
    resetMocks();
    service = new CategoriesService();
  });

  describe("create", () => {
    it("creates a top-level category when the name is free", async () => {
      const result = await service.create({ name: "Security", slug: "security" });
      expect(result).toMatchObject({ name: "Security", slug: "security", parent_id: null });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith("c.parent_id IS NULL");
    });

    it("trims the name before saving and before checking for duplicates", async () => {
      const result = await service.create({ name: "  Security  ", slug: "security" });
      expect(result.name).toBe("Security");
      expect(queryBuilder.where).toHaveBeenCalledWith("LOWER(c.name) = LOWER(:name)", {
        name: "Security",
      });
    });

    it("throws 409 when a top-level category with the same name already exists", async () => {
      queryBuilder.getOne.mockResolvedValue(makeCategory({ category_id: "other" }));
      await expect(
        service.create({ name: "security", slug: "security-2" })
      ).rejects.toMatchObject({ statusCode: 409 });
      expect(categoryRepo.save).not.toHaveBeenCalled();
    });

    it("throws 404 when the parent category doesn't exist", async () => {
      await expect(
        service.create({ name: "Guides", slug: "guides", parent_id: "missing" })
      ).rejects.toMatchObject({ statusCode: 404 });
      expect(categoryRepo.save).not.toHaveBeenCalled();
    });

    it("creates a child and scopes the duplicate check to its parent", async () => {
      seed(makeCategory({ category_id: "cat-1" }));
      const result = await service.create({
        name: "Guides",
        slug: "security-guides",
        parent_id: "cat-1",
      });
      expect(result).toMatchObject({ name: "Guides", parent_id: "cat-1" });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith("c.parent_id = :parentId", {
        parentId: "cat-1",
      });
    });

    it("throws 409 when a sibling under the same parent already has the name", async () => {
      seed(makeCategory({ category_id: "cat-1" }));
      queryBuilder.getOne.mockResolvedValue(
        makeCategory({ category_id: "cat-9", name: "Guides", parent_id: "cat-1" })
      );
      await expect(
        service.create({ name: "Guides", slug: "security-guides-2", parent_id: "cat-1" })
      ).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  describe("update", () => {
    it("returns null when the category doesn't exist", async () => {
      const result = await service.update("missing", { name: "Anything" });
      expect(result).toBeNull();
      expect(categoryRepo.save).not.toHaveBeenCalled();
    });

    it("allows changing only the capitalisation of its own name (excludes itself from the check)", async () => {
      const self = makeCategory({ category_id: "cat-1", name: "Security" });
      seed(self);
      queryBuilder.getOne.mockResolvedValue(self);
      const result = await service.update("cat-1", { name: "SECURITY" });
      expect(result).not.toBeNull();
      expect(result?.name).toBe("SECURITY");
    });

    it("throws 409 when renaming to a name a sibling already uses", async () => {
      seed(makeCategory({ category_id: "cat-1", name: "Security" }));
      queryBuilder.getOne.mockResolvedValue(makeCategory({ category_id: "cat-2", name: "Design" }));
      await expect(service.update("cat-1", { name: "Design" })).rejects.toMatchObject({
        statusCode: 409,
      });
    });

    it("skips the duplicate check when neither name nor parent changes", async () => {
      seed(makeCategory({ category_id: "cat-1" }));
      const result = await service.update("cat-1", { slug: "new-slug" });
      expect(result?.slug).toBe("new-slug");
      expect(categoryRepo.createQueryBuilder).not.toHaveBeenCalled();
    });

    it("throws 400 when a category is moved under itself", async () => {
      seed(makeCategory({ category_id: "cat-1" }));
      await expect(service.update("cat-1", { parent_id: "cat-1" })).rejects.toMatchObject({
        statusCode: 400,
      });
      expect(categoryRepo.save).not.toHaveBeenCalled();
    });

    it("throws 400 when a category is moved under one of its own descendants", async () => {
      seed(
        makeCategory({ category_id: "cat-1", name: "Security", parent_id: null }),
        makeCategory({ category_id: "cat-2", name: "Guides", parent_id: "cat-1" }),
        makeCategory({ category_id: "cat-3", name: "Advanced", parent_id: "cat-2" })
      );
      // cat-3 is a grandchild of cat-1: moving cat-1 under it would form a loop.
      await expect(service.update("cat-1", { parent_id: "cat-3" })).rejects.toMatchObject({
        statusCode: 400,
      });
      expect(categoryRepo.save).not.toHaveBeenCalled();
    });

    it("throws 404 when the new parent doesn't exist", async () => {
      seed(makeCategory({ category_id: "cat-1" }));
      await expect(service.update("cat-1", { parent_id: "missing" })).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it("allows moving under an unrelated category", async () => {
      seed(
        makeCategory({ category_id: "cat-1", name: "Security" }),
        makeCategory({ category_id: "cat-3", name: "Design" })
      );
      const result = await service.update("cat-1", { parent_id: "cat-3" });
      expect(result?.parent_id).toBe("cat-3");
      // moving changes the scope, so the name is re-checked under the new parent
      expect(queryBuilder.andWhere).toHaveBeenCalledWith("c.parent_id = :parentId", {
        parentId: "cat-3",
      });
    });

    it("allows moving a subcategory up to the top level", async () => {
      seed(
        makeCategory({ category_id: "cat-1", name: "Security" }),
        makeCategory({ category_id: "cat-2", name: "Guides", parent_id: "cat-1" })
      );
      const result = await service.update("cat-2", { parent_id: null });
      expect(result?.parent_id).toBeNull();
      expect(queryBuilder.andWhere).toHaveBeenCalledWith("c.parent_id IS NULL");
    });
  });

  describe("remove", () => {
    it("throws 409 when the category still has subcategories", async () => {
      categoryRepo.count.mockResolvedValue(2);
      await expect(service.remove("cat-1")).rejects.toMatchObject({ statusCode: 409 });
      expect(categoryRepo.delete).not.toHaveBeenCalled();
    });

    it("deletes a category that has no subcategories", async () => {
      categoryRepo.count.mockResolvedValue(0);
      categoryRepo.delete.mockResolvedValue({ affected: 1 });
      const result = await service.remove("cat-1");
      expect(result).toBe(true);
      expect(categoryRepo.count).toHaveBeenCalledWith({ where: { parent_id: "cat-1" } });
    });

    it("returns false when nothing was deleted", async () => {
      categoryRepo.count.mockResolvedValue(0);
      categoryRepo.delete.mockResolvedValue({ affected: 0 });
      const result = await service.remove("missing");
      expect(result).toBe(false);
    });
  });

  describe("attachToContent", () => {
    it("throws 404 if the category doesn't exist", async () => {
      await expect(
        service.attachToContent("missing-cat", "content-1")
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("throws 404 if the content doesn't exist", async () => {
      seed(makeCategory());
      contentRepo.findOne.mockResolvedValue(null);
      await expect(
        service.attachToContent("cat-1", "missing-content")
      ).rejects.toMatchObject({ statusCode: 404 });
      expect(contentCategoryRepo.save).not.toHaveBeenCalled();
    });

    it("throws 409 if already attached", async () => {
      seed(makeCategory());
      contentRepo.findOne.mockResolvedValue({ content_id: "content-1" });
      contentCategoryRepo.findOne.mockResolvedValue(makeLink());
      await expect(
        service.attachToContent("cat-1", "content-1")
      ).rejects.toMatchObject({ statusCode: 409 });
      expect(contentCategoryRepo.save).not.toHaveBeenCalled();
    });

    it("attaches the category when not already linked", async () => {
      seed(makeCategory());
      contentRepo.findOne.mockResolvedValue({ content_id: "content-1" });
      contentCategoryRepo.findOne.mockResolvedValue(null);
      const result = await service.attachToContent("cat-1", "content-1");
      expect(result.category_id).toBe("cat-1");
      expect(result.content_id).toBe("content-1");
      expect(contentCategoryRepo.create).toHaveBeenCalledWith({
        category_id: "cat-1",
        content_id: "content-1",
      });
    });
  });

  describe("detachFromContent", () => {
    it("returns false if nothing was deleted", async () => {
      contentCategoryRepo.delete.mockResolvedValue({ affected: 0 });
      expect(await service.detachFromContent("cat-1", "content-1")).toBe(false);
    });

    it("returns true when the link is removed", async () => {
      contentCategoryRepo.delete.mockResolvedValue({ affected: 1 });
      expect(await service.detachFromContent("cat-1", "content-1")).toBe(true);
    });
  });

  describe("listCategoriesForContent", () => {
    it("returns the categories attached to a content item", async () => {
      contentCategoryRepo.find.mockResolvedValue([
        { ...makeLink(), category: makeCategory({ category_id: "cat-1", name: "Security" }) },
        {
          ...makeLink({ category_id: "cat-2" }),
          category: makeCategory({ category_id: "cat-2", name: "Design" }),
        },
      ]);
      const result = await service.listCategoriesForContent("content-1");
      expect(result.map((c) => c.name)).toEqual(["Security", "Design"]);
    });

    it("returns an empty list when nothing is attached", async () => {
      contentCategoryRepo.find.mockResolvedValue([]);
      expect(await service.listCategoriesForContent("content-1")).toEqual([]);
    });
  });
});
