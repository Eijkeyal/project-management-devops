import { Router } from "express";
import { asyncHandler } from "../../shared/middleware/error.middleware.js";
import { authenticate, authorize } from "../../shared/middleware/auth.middleware.js";
import { getAdminDashboardStats } from "./admin.controller.js";

export const adminRouter = Router();

adminRouter.get(
  "/dashboard/stats",
  authenticate,
  authorize("Admin"),
  asyncHandler(getAdminDashboardStats)
);
