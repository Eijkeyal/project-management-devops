import { Router } from "express";
import { authenticate } from "../../shared/middleware/auth.middleware.js";
import { uploadSingle } from "../../shared/middleware/upload.middleware.js";
import {
  uploadFile,
  uploadAvatar,
  listProjectFiles,
  listTaskFiles,
  listContentFiles,
  softDeleteFile,
  streamFile,
} from "./files.controller.js";

const router = Router();

router.use(authenticate);

router.post("/upload", uploadSingle("file"), uploadFile);
router.post("/avatar", uploadSingle("file"), uploadAvatar);

router.get("/project/:projectId", listProjectFiles);
router.get("/task/:taskId", listTaskFiles);
router.get("/content/:contentId", listContentFiles);

router.get("/:id/raw", streamFile);
router.delete("/:id", softDeleteFile);

export default router;