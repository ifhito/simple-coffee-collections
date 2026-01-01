-- Drop unused legacy tables and related objects
-- Tables were not referenced by application code/tests:
--   - bean_types
--   - roast_levels
--   - coffee_records

-- Note: CASCADE will remove dependent indexes, triggers, and policies.

DROP TABLE IF EXISTS public.coffee_records CASCADE;
DROP TABLE IF EXISTS public.bean_types CASCADE;
DROP TABLE IF EXISTS public.roast_levels CASCADE;

-- Postgres does not allow calling current_database() directly in COMMENT ON DATABASE,
-- so use a DO block to comment on whichever database this migration runs against.
DO $$
DECLARE
    db_name text := current_database();
    db_comment text := 'Removed unused legacy tables (bean_types, roast_levels, coffee_records)';
BEGIN
    EXECUTE format('COMMENT ON DATABASE %I IS %L', db_name, db_comment);
END $$;
