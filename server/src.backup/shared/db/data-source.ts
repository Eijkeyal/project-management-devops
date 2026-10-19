import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { Role } from "../../entities/role.entity";
import { User } from "../../entities/user.entity";
import { RefreshToken } from "../../entities/refresh-token.entity";
import { Project } from "../../entities/project.entity";
import { ProjectMember } from "../../entities/project-member.entity";
import { Content } from "../../entities/content.entity";
import { Tag } from "../../entities/tag.entity";
import { ContentTag } from "../../entities/content-tag.entity";
import { Category } from "../../entities/category.entity";
import { ContentCategory } from "../../entities/content-category.entity";
import { Task } from "../../entities/task.entity";
import { TaskComment } from "../../entities/task-comment.entity";
import { TaskDependency } from "../../entities/task-dependency.entity";
import { File } from "../../entities/file.entity";
import { ProjectFile } from "../../entities/project-file.entity";
import { Notification } from "../../entities/notification.entity";
import { ActivityLog } from "../../entities/activity-log.entity";
import { Approval } from "../../entities/approval.entity";
import { TaskFile } from "../../entities/task-file.entity";
import { ContentFile } from "../../entities/content-file.entity";

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