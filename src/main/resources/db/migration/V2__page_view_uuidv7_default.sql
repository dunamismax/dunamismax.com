-- PostgreSQL 18 provides uuidv7(). Keep V1 immutable for existing Flyway
-- installations, while allowing PostgreSQL 17 production databases to keep the
-- existing pgcrypto UUID default.
DO $$
BEGIN
    IF to_regprocedure('uuidv7()') IS NOT NULL THEN
        EXECUTE 'ALTER TABLE page_view ALTER COLUMN id SET DEFAULT uuidv7()';
    ELSE
        EXECUTE 'ALTER TABLE page_view ALTER COLUMN id SET DEFAULT gen_random_uuid()';
    END IF;
END $$;
