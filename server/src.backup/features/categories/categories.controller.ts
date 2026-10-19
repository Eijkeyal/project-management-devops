import type { Request, Response, NextFunction } from "express";
import type { ApiResponse } from "../../shared/types";
import type {
  CategoryResponse,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "./categories.dto";
import { categoriesService } from "./categories.service";
import { HttpError } from "../../shared/middleware/error.middleware";

export async function findAllCategories(
  req: Request,
  res: Response<ApiResponse<CategoryResponse[]>>,
  _next: NextFunction
) {
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const offset = req.query.offset ? Number(req.query.offset) : undefined;
  const sortBy = typeof req.query.sortBy === "string" ? req.query.sortBy : undefined;
  const sortOrder =
    req.query.sortOrder === "asc" || req.query.sortOrder === "desc"
      ? req.query.sortOrder
      : undefined;

  const page = await categoriesService.findAll({ limit, offset }, { sortBy, sortOrder });

  res.status(200).json({
    success: true,
    statusCode: 200,
    data: page.items as CategoryResponse[],
    meta: {
      total: page.total,
      limit: page.limit,
      offset: page.offset,
      count: page.count,
    },
  });
}

export async function findOneCategory(
  req: Request<{ id: string }>,
  res: Response<ApiResponse<CategoryResponse>>,
  next: NextFunction
) {
  const item = await categoriesService.findOne(req.params.id);
  if (!item) {
    next(new HttpError(404, "Category not found"));
    return;
  }
  res.status(200).json({ success: true, statusCode: 200, data: item as CategoryResponse });
}

export async function createCategory(
  req: Request<unknown, unknown, CreateCategoryDto>,
  res: Response<ApiResponse<CategoryResponse>>,
  next: NextFunction
) {
  const required = ["name", "slug"] as const;
  for (const field of required) {
    if (!req.body[field] || !String(req.body[field]).trim()) {
      next(new HttpError(400, `Field '${field}' is required`));
      return;
    }
  }
  try {
    const created = await categoriesService.create(req.body);
    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Category created",
      data: created as CategoryResponse,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(
  req: Request<{ id: string }, unknown, UpdateCategoryDto>,
  res: Response<ApiResponse<CategoryResponse>>,
  next: NextFunction
) {
  try {
    const updated = await categoriesService.update(req.params.id, req.body);
    if (!updated) {
      next(new HttpError(404, "Category not found"));
      return;
    }
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Category updated",
      data: updated as CategoryResponse,
    });
  } catch (err) {
    next(err);
  }
}

export async function removeCategory(
  req: Request<{ id: string }>,
  res: Response<ApiResponse<boolean>>,
  next: NextFunction
) {
  try {
    const deleted = await categoriesService.remove(req.params.id);
    if (!deleted) {
      next(new HttpError(404, "Category not found"));
      return;
    }
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Category deleted",
      data: true,
    });
  } catch (err) {
    next(err);
  }
}

export async function attachCategoryToContent(
  req: Request<{ categoryId: string; contentId: string }>,
  res: Response<ApiResponse<boolean>>,
  next: NextFunction
) {
  try {
    await categoriesService.attachToContent(req.params.categoryId, req.params.contentId);
    res
      .status(201)
      .json({ success: true, statusCode: 201, message: "Category attached", data: true });
  } catch (err) {
    next(err);
  }
}

export async function detachCategoryFromContent(
  req: Request<{ categoryId: string; contentId: string }>,
  res: Response<ApiResponse<boolean>>,
  next: NextFunction
) {
  const detached = await categoriesService.detachFromContent(
    req.params.categoryId,
    req.params.contentId
  );
  if (!detached) {
    next(new HttpError(404, "Category was not attached to this content"));
    return;
  }
  res
    .status(200)
    .json({ success: true, statusCode: 200, message: "Category detached", data: true });
}

export async function listCategoriesForContent(
  req: Request<{ contentId: string }>,
  res: Response<ApiResponse<CategoryResponse[]>>,
  _next: NextFunction
) {
  const items = await categoriesService.listCategoriesForContent(req.params.contentId);
  res.status(200).json({ success: true, statusCode: 200, data: items as CategoryResponse[] });
}
