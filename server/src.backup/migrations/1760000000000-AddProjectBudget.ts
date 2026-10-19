import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProjectBudget1760000000000 implements MigrationInterface {
  name = "AddProjectBudget1760000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "budget" numeric(12,2)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "budget"`);
  }
}
