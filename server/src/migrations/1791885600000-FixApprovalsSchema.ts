import { MigrationInterface, QueryRunner } from "typeorm";

// Brings the approvals table up to date with approval.entity.ts without losing
// existing rows, and renames the categories foreign keys to TypeORM's names.
// Each step checks the current state first, so it's safe to re-run.
export class FixApprovalsSchema1791885600000 implements MigrationInterface {
  name = "FixApprovalsSchema1791885600000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const approvals = await queryRunner.getTable("approvals");
    if (approvals) {
      const has = (column: string) => approvals.findColumnByName(column) !== undefined;

      // A pending approval has no reviewer yet, so reviewer_id must be optional.
      await queryRunner.query(`ALTER TABLE "approvals" DROP CONSTRAINT IF EXISTS "FK_afa4e8401126002a3e6b0ce82d7"`);
      await queryRunner.query(`ALTER TABLE "approvals" ALTER COLUMN "reviewer_id" DROP NOT NULL`);
      await queryRunner.query(`ALTER TABLE "approvals" ALTER COLUMN "status" SET DEFAULT 'pending'`);

      // created_at -> submitted_at, keeping the existing timestamps.
      if (!has("submitted_at")) {
        await queryRunner.query(`ALTER TABLE "approvals" ADD "submitted_at" TIMESTAMP NOT NULL DEFAULT now()`);
        if (has("created_at")) {
          await queryRunner.query(`UPDATE "approvals" SET "submitted_at" = "created_at"`);
          await queryRunner.query(`ALTER TABLE "approvals" DROP COLUMN "created_at"`);
        }
      }

      // New required column: add it empty, fill it from the content's author, then require it.
      if (!has("submitted_by")) {
        await queryRunner.query(`ALTER TABLE "approvals" ADD "submitted_by" uuid`);
        await queryRunner.query(
          `UPDATE "approvals" a SET "submitted_by" = c."author_id" FROM "contents" c WHERE c."content_id" = a."content_id"`
        );
        await queryRunner.query(`ALTER TABLE "approvals" ALTER COLUMN "submitted_by" SET NOT NULL`);
      }

      await queryRunner.query(`ALTER TABLE "approvals" DROP CONSTRAINT IF EXISTS "FK_8b1c76a6df6ea28ce51cfacbebb"`);
      await queryRunner.query(
        `ALTER TABLE "approvals" ADD CONSTRAINT "FK_8b1c76a6df6ea28ce51cfacbebb" FOREIGN KEY ("submitted_by") REFERENCES "users"("user_id") ON DELETE CASCADE`
      );
      await queryRunner.query(
        `ALTER TABLE "approvals" ADD CONSTRAINT "FK_afa4e8401126002a3e6b0ce82d7" FOREIGN KEY ("reviewer_id") REFERENCES "users"("user_id") ON DELETE SET NULL`
      );
      await queryRunner.query(
        `CREATE INDEX IF NOT EXISTS "IDX_f0e12a6ca99fed836864cbf868" ON "approvals" ("content_id", "status")`
      );
    }

    // Cosmetic: the hand-written SQL named these constraints differently.
    const renames: [string, string, string][] = [
      ["categories", "categories_parent_id_fkey", "FK_88cea2dc9c31951d06437879b40"],
      ["content_categories", "content_categories_content_id_fkey", "FK_16a1907a253c40298b0a8d11a42"],
      ["content_categories", "content_categories_category_id_fkey", "FK_249f24bd45939191ca2dd7ef36a"],
    ];
    for (const [table, from, to] of renames) {
      const found = await queryRunner.query(`SELECT 1 FROM pg_constraint WHERE conname = $1`, [from]);
      if (found.length > 0) {
        await queryRunner.query(`ALTER TABLE "${table}" RENAME CONSTRAINT "${from}" TO "${to}"`);
      }
    }
  }

  public async down(): Promise<void> {
    // Not reversible: this upgrade moves data between columns.
  }
}