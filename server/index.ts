import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { instanceToPlain } from "class-transformer";
import { AppDataSource } from "./src/shared/db/data-source.js";
import { errorHandler, notFoundHandler } from "./src/shared/middleware/error.middleware.js";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./src/shared/swagger/swagger.setup.js";

import { authRouter } from "./src/features/authentication/auth.routes.js";
import { contentsRouter } from "./src/features/contents/content.routes.js";
import { usersRouter } from "./src/features/users/users.routes.js";
import { projectRouter } from "./src/features/projects/project.routes.js";
import { tagsRouter } from "./src/features/tags/tags.routes.js";
import { categoriesRouter } from "./src/features/categories/categories.routes.js";
import { tasksRouter } from "./src/features/tasks/tasks.routes.js";
import { taskCommentsRouter } from "./src/features/task-comments/task-comments.routes.js";
import { taskDependenciesRouter } from "./src/features/task-dependencies/task-dependencies.routes.js";
import { notificationsRouter } from "./src/features/notifications/notifications.routes.js";
import { rolesRouter } from "./src/features/roles/roles.routes.js";
import { adminRouter } from "./src/features/admin/admin.routes.js";
import filesRoutes from "./src/features/files/files.routes.js";
import { approvalsRouter } from "./src/features/approvals/approvals.routes.js";
import { auditLogsRouter } from "./src/features/audit-logs/audit.routes.js";
import { startPublishScheduler } from "./src/shared/jobs/publish-scheduled.jobs.js";

dotenv.config();

export const app = express();
const PORT = Number(process.env.PORT) || 5000;
const API_PREFIX = "/api/v1";

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (body: any) => originalJson(instanceToPlain(body));
  next();
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "PMS API Docs",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: "none",
      filter: true,
      tryItOutEnabled: true,
    },
  }),
);

app.get("/api-docs.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.get("/", (_req, res) => {
  res.send("Base API is running");
});

app.use(`${API_PREFIX}/auth`, authRouter);
app.use(`${API_PREFIX}/admin`, adminRouter);
app.use(`${API_PREFIX}/users`, usersRouter);
app.use(`${API_PREFIX}/projects`, projectRouter);
app.use(`${API_PREFIX}/contents`, contentsRouter);
app.use(`${API_PREFIX}/tags`, tagsRouter);
app.use(`${API_PREFIX}/categories`, categoriesRouter);
app.use(`${API_PREFIX}/tasks`, tasksRouter);
app.use(`${API_PREFIX}/task-comments`, taskCommentsRouter);
app.use(`${API_PREFIX}/task-dependencies`, taskDependenciesRouter);
app.use(`${API_PREFIX}/files`, filesRoutes);
app.use(`${API_PREFIX}/notifications`, notificationsRouter);
app.use(`${API_PREFIX}/approvals`, approvalsRouter);
app.use(`${API_PREFIX}/audit-logs`, auditLogsRouter);
app.use(`${API_PREFIX}/roles`, rolesRouter);

app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
  try {
    await AppDataSource.initialize();
    console.log("Database connected successfully.");

    startPublishScheduler();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`API routes available under ${API_PREFIX}`);
      console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`); 
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

if (!process.env.VITEST) {
  startServer();
}