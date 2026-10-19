import { Router } from "express";
import { AuditLogsController } from "./audit-logs.controller.js";
import { authenticate, authorize } from "../../shared/middleware/auth.middleware.js";
import { validateQuery } from "../../shared/middleware/validate.middleware.js";
import { listAuditLogsQuerySchema } from "./audit-logs.dto.js";

const router = Router();
const ctrl = new AuditLogsController();

router.get(
  "/",
  authenticate,
  authorize("Admin"),
  validateQuery(listAuditLogsQuerySchema),
  ctrl.list.bind(ctrl),
);

router.get(
  "/:id",
  authenticate,
  authorize("Admin"),
  ctrl.detail.bind(ctrl),
);

router.get(
  "/project/:projectId/feed",
  authenticate,
  ctrl.projectFeed.bind(ctrl),
);

export const auditLogsRouter = router;