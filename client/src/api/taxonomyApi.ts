import { axiosClient } from "./axiosClient";
import type { ApiResponse } from "./types";

// Mirrors server/src/features/tags and /categories DTOs.
export interface ApiTag {
  tag_id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface ApiCategory {
  category_id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  created_at: string;
}

/** "Edge Compute Guide" -> "edge-compute-guide" (the API requires a slug). */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const LIST_PARAMS = { limit: 100, sortBy: "name", sortOrder: "asc" } as const;

export const tagApi = {
  list: () =>
    axiosClient.get<ApiResponse<ApiTag[]>>("/tags", { params: LIST_PARAMS }).then((res) => res.data),

  create: (name: string) =>
    axiosClient
      .post<ApiResponse<ApiTag>>("/tags", { name, slug: slugify(name) })
      .then((res) => res.data),

  forContent: (contentId: string) =>
    axiosClient
      .get<ApiResponse<ApiTag[]>>(`/tags/contents/${contentId}`)
      .then((res) => res.data),

  attach: (tagId: string, contentId: string) =>
    axiosClient
      .post<ApiResponse<boolean>>(`/tags/${tagId}/contents/${contentId}`)
      .then((res) => res.data),

  detach: (tagId: string, contentId: string) =>
    axiosClient
      .delete<ApiResponse<boolean>>(`/tags/${tagId}/contents/${contentId}`)
      .then((res) => res.data),
};

export const categoryApi = {
  list: () =>
    axiosClient
      .get<ApiResponse<ApiCategory[]>>("/categories", { params: LIST_PARAMS })
      .then((res) => res.data),

  // Admin/Manager only (enforced by the API).
  create: (name: string, slug: string, parentId: string | null) =>
    axiosClient
      .post<ApiResponse<ApiCategory>>("/categories", { name, slug, parent_id: parentId })
      .then((res) => res.data),

  forContent: (contentId: string) =>
    axiosClient
      .get<ApiResponse<ApiCategory[]>>(`/categories/contents/${contentId}`)
      .then((res) => res.data),

  attach: (categoryId: string, contentId: string) =>
    axiosClient
      .post<ApiResponse<boolean>>(`/categories/${categoryId}/contents/${contentId}`)
      .then((res) => res.data),

  detach: (categoryId: string, contentId: string) =>
    axiosClient
      .delete<ApiResponse<boolean>>(`/categories/${categoryId}/contents/${contentId}`)
      .then((res) => res.data),
};
