import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { Role } from "../../entities/role.entity.js";
import { User } from "../../entities/user.entity.js";
import { RefreshToken } from "../../entities/refresh-token.entity.js";
import { Project } from "../../entities/project.entity.js";
import { ProjectMember } from "../../entities/project-member.entity.js";
import { Content } from "../../entities/content.entity.js";
import { Tag } from "../../entities/tag.entity.js";
import { ContentTag } from "../../entities/content-tag.entity.js";
import { Category } from "../../entities/category.entity.js";
import { ContentCategory } from "../../entities/content-category.entity.js";
import { Task } from "../../entities/task.entity.js";
import { TaskComment } from "../../entities/task-comment.entity.js";
import { TaskDependency } from "../../entities/task-dependency.entity.js";
import { File } from "../../entities/file.entity.js";
import { ProjectFile } from "../../entities/project-file.entity.js";
import { Notification } from "../../entities/notification.entity.js";
import { ActivityLog } from "../../entities/activity-log.entity.js";
import { Approval } from "../../entities/approval.entity.js";
import { TaskFile } from "../../entities/task-file.entity.js";
import { ContentFile } from "../../entities/content-file.entity.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const isCompiled = __dirname.includes("dist");
const migrations = isCompiled
  ? ["dist/src/migrations/*.js"]
  : ["src/migrations/*.ts"];

export const AppDataSource = new DataSource({
  type: "postgres",
  url: databaseUrl,
  ssl: { rejectUnauthorized: false },
  entities: [
    Role, User, RefreshToken, Project, ProjectMember,
    Content, Tag, ContentTag, Category, ContentCategory,
    Task, TaskComment, TaskDependency, File, ProjectFile,
    Notification, ActivityLog, Approval, TaskFile, ContentFile,
  ],
  migrations,
  migrationsTableName: "typeorm_migrations",
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
});