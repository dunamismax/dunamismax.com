-- Rust-owned runtime state for dunamismax.com.
--
-- Editable site content stays in content/. PostgreSQL stores durable runtime
-- events that should not live in versioned content files.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS page_view (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    path        text        NOT NULL CHECK (char_length(path) > 0 AND char_length(path) <= 2048),
    referrer    text,
    user_agent  text,
    viewed_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS page_view_path_idx
    ON page_view (path);

CREATE INDEX IF NOT EXISTS page_view_viewed_at_idx
    ON page_view (viewed_at DESC);

CREATE INDEX IF NOT EXISTS page_view_path_trgm_idx
    ON page_view USING gin (path gin_trgm_ops);

DO $$
BEGIN
    IF to_regprocedure('uuidv7()') IS NOT NULL THEN
        EXECUTE 'ALTER TABLE page_view ALTER COLUMN id SET DEFAULT uuidv7()';
    ELSE
        EXECUTE 'ALTER TABLE page_view ALTER COLUMN id SET DEFAULT gen_random_uuid()';
    END IF;
END $$;
