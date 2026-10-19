import { Router } from "express";
import { asyncHandler } from "../../shared/middleware/error.middleware.js";
import { authenticate } from "../../shared/middleware/auth.middleware.js";
import { getAllRoles } from "./roles.controller.js";

export const rolesRouter = Router();

rolesRouter.get(
  "/",
  authenticate,
  asyncHandler(getAllRoles)
);
