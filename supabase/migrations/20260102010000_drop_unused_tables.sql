-- Drop unused legacy tables and related objects
-- Tables were not referenced by application code/tests:
--   - bean_types
--   - roast_levels
--   - coffee_records

-- Note: CASCADE will remove dependent indexes, triggers, and policies.

DROP TABLE IF EXISTS public.coffee_records CASCADE;
DROP TABLE IF EXISTS public.bean_types CASCADE;
DROP TABLE IF EXISTS public.roast_levels CASCADE;

COMMENT ON DATABASE current_database() IS 'Removed unused legacy tables (bean_types, roast_levels, coffee_records)';
