-- Run once against your database BEFORE starting the server with the
-- categories feature (synchronize is off, so TypeORM won't create these).
-- Safe to re-run: every statement is IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS categories (
  category_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        varchar(100) NOT NULL,
  slug        varchar(120) NOT NULL UNIQUE,
  parent_id   uuid NULL REFERENCES categories(category_id) ON DELETE RESTRICT,
  created_at  timestamp NOT NULL DEFAULT now()
);

-- No two categories with the same name (case-insensitive) under the same parent.
CREATE UNIQUE INDEX IF NOT EXISTS uq_categories_parent_name
  ON categories (COALESCE(parent_id, '00000000-0000-0000-0000-000000000000'::uuid), LOWER(name));

CREATE TABLE IF NOT EXISTS content_categories (
  content_id  uuid NOT NULL REFERENCES contents(content_id)     ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(category_id)  ON DELETE CASCADE,
  created_at  timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY (content_id, category_id)
);
