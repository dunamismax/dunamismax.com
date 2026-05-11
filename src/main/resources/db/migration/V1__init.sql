-- Initial schema for dunamismax.com.
--
-- Content (projects, posts, about copy) lives on disk under content/ and
-- is loaded into memory at app boot. The database exists for runtime-only
-- state that does not belong in a diff-able file: visit counts, future
-- contact-form submissions, future link-check results, future RSS
-- subscriber lists, and so on.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

CREATE TABLE page_view (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    path        text        NOT NULL,
    referrer    text,
    user_agent  text,
    viewed_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX page_view_path_idx       ON page_view (path);
CREATE INDEX page_view_viewed_at_idx  ON page_view (viewed_at DESC);
CREATE INDEX page_view_path_trgm_idx  ON page_view USING gin (path gin_trgm_ops);
