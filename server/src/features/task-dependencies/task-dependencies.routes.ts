import { Router } from "express";
import { asyncHandler } from "../../shared/middleware/error.middleware.js";
import { authenticate } from "../../shared/middleware/auth.middleware.js";
import {
  findDependenciesForTask,
  createTaskDependency,
  removeTaskDependency,
} from "./task-dependencies.controller.js";

export const taskDependenciesRouter = Router();

taskDependenciesRouter.use(authenticate);

taskDependenciesRouter.get("/task/:taskId", asyncHandler(findDependenciesForTask as any));
taskDependenciesRouter.post("/", asyncHandler(createTaskDependency));
taskDependenciesRouter.delete(
  "/:taskId/:dependsOnTaskId",
  asyncHandler(removeTaskDependency as any)
);
