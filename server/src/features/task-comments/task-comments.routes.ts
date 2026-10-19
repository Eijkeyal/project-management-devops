import { Router } from "express";
import { asyncHandler } from "../../shared/middleware/error.middleware.js";
import { authenticate } from "../../shared/middleware/auth.middleware.js";
import {
  findCommentsForTask,
  createTaskComment,
  updateTaskComment,
  removeTaskComment,
} from "./task-comments.controller.js";

export const taskCommentsRouter = Router();

taskCommentsRouter.use(authenticate);

taskCommentsRouter.get("/task/:taskId", asyncHandler(findCommentsForTask as any));
taskCommentsRouter.post("/", asyncHandler(createTaskComment));
taskCommentsRouter.patch("/:id", asyncHandler(updateTaskComment as any));
taskCommentsRouter.delete("/:id", asyncHandler(removeTaskComment as any));
