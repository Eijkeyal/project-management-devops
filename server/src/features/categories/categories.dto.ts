export interface CategoryResponse {
  category_id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  created_at: Date;
}

export interface CreateCategoryDto {
  name: string;
  slug: string;
  parent_id?: string | null;
}

export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  parent_id?: string | null;
}
