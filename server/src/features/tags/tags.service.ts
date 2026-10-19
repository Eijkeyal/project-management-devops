import { ILike } from "typeorm";
import { BaseCRUDService } from "../../shared/services/base.service.js";
import { getRepo } from "../../shared/db/repositories.js";
import { Tag } from "../../entities/tag.entity.js";
import { ContentTag } from "../../entities/content-tag.entity.js";
import { HttpError } from "../../shared/middleware/error.middleware.js";
import type { CreateTagDto, UpdateTagDto } from "./tags.dto.js";

export class TagsService extends BaseCRUDService<
  Tag,
  CreateTagDto,
  UpdateTagDto
> {
  constructor() {
    super(Tag, "tag_id");
  }

  private async assertNameAvailable(
    name: string,
    excludeId?: string
  ): Promise<void> {
    const existing = await this.repo().findOne({
      where: { name: ILike(name) },
    });

    if (existing && existing.tag_id !== excludeId) {
      throw new HttpError(
        409,
        `A tag named "${name}" already exists`
      );
    }
  }

  override async create(payload: CreateTagDto): Promise<Tag> {
    await this.assertNameAvailable(payload.name);
    return super.create(payload);
  }

  override async update(
    id: string,
    payload: UpdateTagDto
  ): Promise<Tag | null> {
    if (payload.name !== undefined) {
      await this.assertNameAvailable(payload.name, id);
    }

    return super.update(id, payload);
  }

  async attachToContent(
    tagId: string,
    contentId: string
  ): Promise<ContentTag> {
    const tag = await this.findOne(tagId);

    if (!tag) {
      throw new HttpError(404, "Tag not found");
    }

    const ctRepo = getRepo(ContentTag);

    const existing = await ctRepo.findOne({
      where: {
        tag_id: tagId,
        content_id: contentId,
      },
    });

    if (existing) {
      throw new HttpError(
        409,
        "Tag is already attached to this content"
      );
    }

    const contentTag = ctRepo.create({
      tag_id: tagId,
      content_id: contentId,
    });

    return ctRepo.save(contentTag);
  }

  async detachFromContent(
    tagId: string,
    contentId: string
  ): Promise<boolean> {
    const ctRepo = getRepo(ContentTag);

    const result = await ctRepo.delete({
      tag_id: tagId,
      content_id: contentId,
    });

    return (result.affected ?? 0) > 0;
  }

  async listTagsForContent(contentId: string): Promise<Tag[]> {
    const ctRepo = getRepo(ContentTag);

    const links = await ctRepo.find({
      where: { content_id: contentId },
      relations: { tag: true },
    });

    return links.map((link) => link.tag);
  }
}

export const tagsService = new TagsService();