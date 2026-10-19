import { EntityTarget, ObjectLiteral, Repository } from "typeorm";
import { AppDataSource } from "../db/data-source.js";

export function getRepo<Entity extends ObjectLiteral>(
  entity: EntityTarget<Entity>
): Repository<Entity> {
  if (!AppDataSource.isInitialized) {
    throw new Error("Database not initialized yet");
  }
  return AppDataSource.getRepository(entity);
}
