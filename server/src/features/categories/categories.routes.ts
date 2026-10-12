import { Router } from "express";
import { asyncHandler } from "../../shared/middleware/error.middleware";
import { authenticate, authorize } from "../../shared/middleware/auth.middleware";
import {
  findAllCategories,
  findOneCategory,
  createCategory,
  updateCategory,
  removeCategory,
  attachCategoryToContent,
  detachCategoryFromContent,
  listCategoriesForContent,
} from "./categories.controller";

export const categoriesRouter = Router();

categoriesRouter.use(authenticate);

categoriesRouter.get("/", asyncHandler(findAllCategories));

// Must be registered before GET "/:id" (same reason as in tags.routes.ts).
categoriesRouter.get("/contents/:contentId", asyncHandler(listCategoriesForContent as any));

categoriesRouter.get("/:id", asyncHandler(findOneCategory as any));

// The category tree is shared by everyone, so only Admin/Manager change it.
// Attaching one to a piece of content is open to any signed-in user, like tags.
categoriesRouter.post("/", authorize("Admin", "Manager"), asyncHandler(createCategory));
categoriesRouter.patch("/:id", authorize("Admin", "Manager"), asyncHandler(updateCategory as any));
categoriesRouter.delete("/:id", authorize("Admin", "Manager"), asyncHandler(removeCategory as any));

categoriesRouter.post(
  "/:categoryId/contents/:contentId",
  asyncHandler(attachCategoryToContent as any)
);
categoriesRouter.delete(
  "/:categoryId/contents/:contentId",
  asyncHandler(detachCategoryFromContent as any)
);
