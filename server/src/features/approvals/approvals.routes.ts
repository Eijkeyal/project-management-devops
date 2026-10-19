import { Router } from "express";
import { asyncHandler } from "../../shared/middleware/error.middleware.js";
import { authenticate, authorize } from "../../shared/middleware/auth.middleware.js";
import {
  submitForApproval,
  approve,
  reject,
  cancel,
  listPending,
  listForContent,
} from "./approvals.controller.js";

export const approvalsRouter = Router();

approvalsRouter.use(authenticate);

approvalsRouter.post(
  "/content/:contentId/submit",
  asyncHandler(submitForApproval as any)
);

approvalsRouter.get(
  "/pending",
  authorize("Admin", "Manager"),
  asyncHandler(listPending as any)
);

approvalsRouter.get(
  "/content/:contentId",
  asyncHandler(listForContent as any)
);

approvalsRouter.post(
  "/:id/approve",
  authorize("Admin", "Manager"),
  asyncHandler(approve as any)
);

approvalsRouter.post(
  "/:id/reject",
  authorize("Admin", "Manager"),
  asyncHandler(reject as any)
);

approvalsRouter.post(
  "/:id/cancel",
  asyncHandler(cancel as any)
);