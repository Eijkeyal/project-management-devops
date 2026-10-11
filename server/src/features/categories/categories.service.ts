import { BaseCRUDService } from "../../shared/services/base.service";
import { getRepo } from "../../shared/db/repositories";
import { Category } from "../../entities/category.entity";
import { ContentCategory } from "../../entities/content-category.entity";
import { Content } from "../../entities/content.entity";
import { HttpError } from "../../shared/middleware/error.middleware";
import type { CreateCategoryDto, UpdateCategoryDto } from "./categories.dto";

// Safety bound when walking up the parent chain, in case bad data ever
// contains a loop.
const MAX_DEPTH = 50;

export class CategoriesService extends BaseCRUDService<
  Category,
  CreateCategoryDto,
  UpdateCategoryDto
> {
  constructor() {
    super(Category, "category_id");
  }

  // SRS 5.7: no duplicate names "within the relevant scope". For categories
  // the scope is the parent: two top-level categories can't share a name
  // (case-insensitive), and neither can two children of the same parent, but
  // "Guides" under "Security" and under "Design" is fine.
  private async assertNameAvailable(
    name: string,
    parentId: string | null,
    excludeId?: string
  ): Promise<void> {
    const qb = this.repo()
      .createQueryBuilder("c")
      .where("LOWER(c.name) = LOWER(:name)", { name });
    if (parentId) {
      qb.andWhere("c.parent_id = :parentId", { parentId });
    } else {
      qb.andWhere("c.parent_id IS NULL");
    }
    const existing = await qb.getOne();
    if (existing && existing.category_id !== excludeId) {
      throw new HttpError(409, `A category named "${name}" already exists here`);
    }
  }

  // The parent must exist, and (when moving an existing category) must not be
  // the category itself or one of its own descendants — that would make a loop.
  private async assertParentValid(parentId: string, selfId?: string): Promise<void> {
    let cursor = await this.findOne(parentId);
    if (!cursor) throw new HttpError(404, "Parent category not found");

    if (!selfId) return;
    for (let depth = 0; cursor && depth < MAX_DEPTH; depth++) {
      if (cursor.category_id === selfId) {
        throw new HttpError(
          400,
          "A category can't be moved under itself or one of its subcategories"
        );
      }
      cursor = cursor.parent_id ? await this.findOne(cursor.parent_id) : null;
    }
  }

  override async create(payload: CreateCategoryDto): Promise<Category> {
    const name = payload.name.trim();
    const parentId = payload.parent_id ?? null;
    if (parentId) await this.assertParentValid(parentId);
    await this.assertNameAvailable(name, parentId);
    return super.create({ ...payload, name, parent_id: parentId });
  }

  override async update(id: string, payload: UpdateCategoryDto): Promise<Category | null> {
    const existing = await this.findOne(id);
    if (!existing) return null;

    const name = payload.name !== undefined ? payload.name.trim() : existing.name;
    const parentId =
      payload.parent_id !== undefined ? payload.parent_id : existing.parent_id;

    if (parentId !== existing.parent_id && parentId) {
      await this.assertParentValid(parentId, id);
    }
    if (name !== existing.name || parentId !== existing.parent_id) {
      await this.assertNameAvailable(name, parentId, id);
    }
    return super.update(id, { ...payload, name, parent_id: parentId });
  }

  // Deleting a parent would orphan its children, so make the caller sort
  // them out first instead of silently flattening the tree.
  override async remove(id: string): Promise<boolean> {
    const children = await this.repo().count({ where: { parent_id: id } });
    if (children > 0) {
      throw new HttpError(
        409,
        "This category has subcategories. Move or delete them first."
      );
    }
    return super.remove(id);
  }

  // Same shape as TagsService: ContentCategory has a composite key, so it's
  // handled directly rather than through the single-id base class.
  async attachToContent(categoryId: string, contentId: string): Promise<ContentCategory> {
    const category = await this.findOne(categoryId);
    if (!category) throw new HttpError(404, "Category not found");

    const content = await getRepo(Content).findOne({ where: { content_id: contentId } });
    if (!content) throw new HttpError(404, "Content not found");

    const ccRepo = getRepo(ContentCategory);
    const existing = await ccRepo.findOne({
      where: { category_id: categoryId, content_id: contentId },
    });
    if (existing) {
      throw new HttpError(409, "Category is already attached to this content");
    }

    return ccRepo.save(ccRepo.create({ category_id: categoryId, content_id: contentId }));
  }

  async detachFromContent(categoryId: string, contentId: string): Promise<boolean> {
    const result = await getRepo(ContentCategory).delete({
      category_id: categoryId,
      content_id: contentId,
    });
    return (result.affected ?? 0) > 0;
  }

  async listCategoriesForContent(contentId: string): Promise<Category[]> {
    const links = await getRepo(ContentCategory).find({
      where: { content_id: contentId },
      relations: { category: true },
    });
    return links.map((link) => link.category);
  }
}

export const categoriesService = new CategoriesService();
