import { Router } from "express";

import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  archiveProject,
  addProjectMember,
  removeProjectMember,
  getProjectDashboard,
} from "./project.controller.js";

import { authenticate } from "../../shared/middleware/auth.middleware.js";

const projectRouter = Router();

projectRouter.use(authenticate);
projectRouter.post("/", createProject);
projectRouter.get("/", getProjects);
projectRouter.get("/:projectId", getProject);
projectRouter.patch("/:projectId", updateProject);
projectRouter.patch(
  "/:projectId/archive",
  archiveProject
);
projectRouter.post(
  "/:projectId/members",
  addProjectMember
);
projectRouter.delete(
  "/:projectId/members/:userId",
  removeProjectMember
);
projectRouter.get(
  "/:projectId/dashboard",
  getProjectDashboard
);

export { projectRouter };