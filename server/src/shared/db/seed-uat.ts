// Loads the data set from the UAT plan (sections 2.2 and 2.3) and doubles as
// the "reset between rounds" step (section 2.4): every run WIPES all data
// except the roles table, then re-creates the same starting state.
//
//   UAT_PASSWORD='choose-a-strong-one' npm run seed:uat -- --yes
//
// Optional env vars:
//   UAT_NEW_EMAIL   inbox that can receive mail, for the NEW account (AUTH-04
//                   sends a real reset email to it). Default new.user@example.com
//   FRONTEND_URL    used only to print the verification link (default http://localhost:3000)
//
// Because the app is exposed through a public tunnel, a password is REQUIRED
// (no built-in default). Do not run the old seed.ts afterwards on that
// environment: it resets admin@example.com back to Admin@123.
import "reflect-metadata";
import bcrypt from "bcryptjs";
import { AppDataSource } from "./data-source";
import { Role } from "../../entities/role.entity";
import { User } from "../../entities/user.entity";
import { Project } from "../../entities/project.entity";
import { ProjectMember } from "../../entities/project-member.entity";
import { Task } from "../../entities/task.entity";
import { Content } from "../../entities/content.entity";
import {
  Approval,
  ApprovalStatus,
  ContentStatus,
  PublishMode,
} from "../../entities/approval.entity";
import { generateVerificationToken, hashToken } from "../utils/jwt.util";

// Noon local time, so date-only columns never slip a day across time zones.
function daysFromNow(days: number): Date {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
}

function describeTarget(): string {
  try {
    const url = new URL(process.env.DATABASE_URL ?? "");
    return `${url.hostname}${url.pathname}`;
  } catch {
    return "(DATABASE_URL missing or not parseable)";
  }
}

async function ensureRole(name: string, description: string): Promise<Role> {
  const repo = AppDataSource.getRepository(Role);
  const existing = await repo.findOne({ where: { name } });
  if (existing) return existing;
  return repo.save(repo.create({ name, description }));
}

async function wipeAllExceptRoles(): Promise<void> {
  const rolesTable = AppDataSource.getMetadata(Role).tableName;
  const tables = AppDataSource.entityMetadatas
    .map((m) => m.tableName)
    .filter((t) => t !== rolesTable)
    .map((t) => `"${t}"`);
  await AppDataSource.query(
    `TRUNCATE TABLE ${tables.join(", ")} RESTART IDENTITY CASCADE`
  );
}

async function main(): Promise<void> {
  const password = process.env.UAT_PASSWORD ?? "";
  if (password.length < 8) {
    console.error(
      "UAT_PASSWORD is required (at least 8 characters). The app is reachable through a public tunnel, so there is no default."
    );
    process.exit(1);
  }

  console.log(`Target database: ${describeTarget()}`);
  if (!process.argv.includes("--yes")) {
    console.log(
      "\nThis DELETES all data (everything except the roles table) and re-creates the UAT data set.\n" +
        "Re-run with --yes to proceed:\n  npm run seed:uat -- --yes"
    );
    process.exit(0);
  }

  await AppDataSource.initialize();
  console.log("Connected.");

  // ---------------------------------------------------------------- reset
  await wipeAllExceptRoles();
  console.log("Wiped existing data (roles kept).");

  // ---------------------------------------------------------------- roles
  const adminRole = await ensureRole(
    "Admin",
    "Full system access; users, roles, content and settings"
  );
  const managerRole = await ensureRole(
    "Manager",
    "Manage/review assigned content and users according to permissions"
  );
  const employeeRole = await ensureRole(
    "Employee",
    "Create/update assigned content, upload files and submit for review"
  );

  // ---------------------------------------------------------------- users
  const userRepo = AppDataSource.getRepository(User);
  const passwordHash = await bcrypt.hash(password, 10);
  const newEmail = (process.env.UAT_NEW_EMAIL ?? "new.user@example.com").toLowerCase();

  async function createUser(
    roleId: string,
    first: string,
    last: string,
    email: string
  ): Promise<User> {
    return userRepo.save(
      userRepo.create({
        role_id: roleId,
        first_name: first,
        last_name: last,
        email,
        password_hash: passwordHash,
        status: "active",
        email_verified: true,
        failed_login_count: 0,
      })
    );
  }

  const adm = await createUser(adminRole.role_id, "Ada", "Admin", "admin@example.com");
  const mgr = await createUser(managerRole.role_id, "Morgan", "Manager", "manager@example.com");
  const emp = await createUser(employeeRole.role_id, "Eli", "Employee", "employee@example.com");
  const lock = await createUser(employeeRole.role_id, "Leo", "Lockout", "lock.test@example.com");

  // NEW: registered but not yet verified, exactly as register() leaves a user.
  const verificationToken = generateVerificationToken();
  await userRepo.save(
    userRepo.create({
      role_id: employeeRole.role_id,
      first_name: "Nora",
      last_name: "Newhire",
      email: newEmail,
      password_hash: passwordHash,
      status: "pending",
      email_verified: false,
      verification_token: hashToken(verificationToken),
      verification_token_expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      failed_login_count: 0,
    })
  );
  console.log("Users created.");

  // ------------------------------------------------------------- projects
  const projectRepo = AppDataSource.getRepository(Project);
  const memberRepo = AppDataSource.getRepository(ProjectMember);

  async function createProject(
    key: string,
    name: string,
    description: string,
    status: string,
    priority: string,
    members: { user: User; role: string }[]
  ): Promise<Project> {
    const project = await projectRepo.save(
      projectRepo.create({
        key_code: key,
        name,
        description,
        owner_id: mgr.user_id,
        status,
        priority,
        start_date: daysFromNow(-14),
        due_date: daysFromNow(90),
      })
    );
    for (const m of members) {
      await memberRepo.save(
        memberRepo.create({
          project_id: project.project_id,
          user_id: m.user.user_id,
          role: m.role,
        })
      );
    }
    return project;
  }

  // The owner is added as a "manager" member, as createProject() does.
  const projectA = await createProject(
    "WEB",
    "Website Redesign",
    "Refresh of the public website. EMP is a member.",
    "Active",
    "High",
    [
      { user: mgr, role: "manager" },
      { user: emp, role: "member" },
    ]
  );
  await createProject(
    "AUD",
    "Internal Audit",
    "Quarterly audit. EMP is NOT a member (visibility test).",
    "Active",
    "Medium",
    [{ user: mgr, role: "manager" }]
  );
  await createProject(
    "MOB",
    "Mobile App",
    "Planned work, used for search and filter tests.",
    "Planned",
    "Low",
    [{ user: mgr, role: "manager" }]
  );
  await createProject(
    "MIG",
    "Data Migration",
    "Paused work, used for search and filter tests.",
    "On Hold",
    "Critical",
    [{ user: mgr, role: "manager" }]
  );
  console.log("Projects created.");

  // ---------------------------------------------------------------- tasks
  const taskRepo = AppDataSource.getRepository(Task);
  const inA = { project_id: projectA.project_id, created_by: mgr.user_id };

  await taskRepo.save(
    taskRepo.create({
      ...inA,
      title: "Draft requirements",
      description: "Write the first draft of the requirements.",
      status: "todo",
      priority: "medium",
      assignee_id: emp.user_id,
      due_date: daysFromNow(30),
      labels: ["planning"],
    })
  );
  await taskRepo.save(
    taskRepo.create({
      ...inA,
      title: "Review wireframes",
      description: "Overdue on purpose (TSK-06).",
      status: "in_progress",
      priority: "high",
      assignee_id: emp.user_id,
      due_date: daysFromNow(-3),
      labels: ["design"],
    })
  );
  await taskRepo.save(
    taskRepo.create({
      ...inA,
      title: "Set up hosting",
      description: "Assigned to MGR, so EMP must not be able to change it (TSK-04).",
      status: "todo",
      priority: "medium",
      assignee_id: mgr.user_id,
      due_date: daysFromNow(45),
      labels: ["infrastructure"],
    })
  );
  await taskRepo.save(
    taskRepo.create({
      ...inA,
      title: "Write user guide",
      description: "Unassigned on purpose (TSK-02, NTF-01).",
      status: "todo",
      priority: "low",
      due_date: daysFromNow(60),
      labels: ["docs"],
    })
  );
  console.log("Tasks created.");

  // -------------------------------------------------------------- content
  const contentRepo = AppDataSource.getRepository(Content);
  const approvalRepo = AppDataSource.getRepository(Approval);

  async function createContent(
    title: string,
    slugPart: string,
    status: ContentStatus,
    body: string
  ): Promise<Content> {
    return contentRepo.save(
      contentRepo.create({
        project_id: projectA.project_id,
        author_id: mgr.user_id,
        title,
        slug: `/web/${slugPart}`,
        body,
        status,
        ...(status === ContentStatus.PUBLISHED ? { published_at: daysFromNow(-7) } : {}),
      })
    );
  }

  await createContent(
    "Draft Handbook",
    "draft-handbook",
    ContentStatus.DRAFT,
    "### Draft Handbook\nWork in progress."
  );
  await createContent(
    "Kickoff Meeting Notes",
    "kickoff-meeting-notes",
    ContentStatus.DRAFT,
    "### Kickoff\nNotes from the project kickoff."
  );

  // Pending items need an Approval row too, as the approvals module creates.
  for (const [title, slug] of [
    ["Security Policy v2", "security-policy-v2"],
    ["Onboarding Guide", "onboarding-guide"],
  ] as const) {
    const pending = await createContent(
      title,
      slug,
      ContentStatus.PENDING_APPROVAL,
      `### ${title}\nSubmitted for review.`
    );
    await approvalRepo.save(
      approvalRepo.create({
        content_id: pending.content_id,
        submitted_by: mgr.user_id,
        status: ApprovalStatus.PENDING,
      })
    );
  }

  // One already-published item with its approval history, for realism.
  const published = await createContent(
    "Brand Guidelines",
    "brand-guidelines",
    ContentStatus.PUBLISHED,
    "### Brand Guidelines\nLogo, colours and tone of voice."
  );
  await approvalRepo.save(
    approvalRepo.create({
      content_id: published.content_id,
      submitted_by: mgr.user_id,
      reviewer_id: adm.user_id,
      status: ApprovalStatus.APPROVED,
      decided_at: daysFromNow(-7),
      publish_mode: PublishMode.IMMEDIATE,
      published_at: daysFromNow(-7),
    })
  );
  console.log("Content created.");

  // -------------------------------------------------------------- summary
  const frontend = process.env.FRONTEND_URL ?? "http://localhost:3000";
  console.log("\n=== UAT accounts (password = the UAT_PASSWORD you set) ===");
  console.log(`ADM   Admin      admin@example.com`);
  console.log(`MGR   Manager    manager@example.com`);
  console.log(`EMP   Employee   employee@example.com   (member of Project A only)`);
  console.log(`NEW   Employee   ${newEmail}   (email NOT verified)`);
  console.log(`LOCK  Employee   lock.test@example.com  (for AUTH-07)`);
  console.log("\nNEW verification link (valid 24h; send it to the tester for AUTH-03):");
  console.log(`  ${frontend}/verify-email?token=${verificationToken}`);
  if (newEmail.endsWith("@example.com")) {
    console.log(
      "\nNOTE: NEW uses an @example.com address, so AUTH-04 (password reset email) cannot be received.\n" +
        "Set UAT_NEW_EMAIL to a real inbox and re-run."
    );
  }
  console.log(
    "\nReminder: also clear server/uploads/ if earlier rounds uploaded files (the database rows are gone, the files are not)."
  );
  console.log(`(LOCK id ${lock.user_id}; unlock without a reset: set failed_login_count = 0 and locked_until = NULL.)`);

  await AppDataSource.destroy();
  console.log("\nUAT seeding complete.");
}

main().catch((error) => {
  console.error("UAT seeding error:", error);
  process.exit(1);
});
