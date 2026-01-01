-- =============================================================================
-- Add bean_name field to coffee_evaluations table
-- =============================================================================
-- This migration adds a bean_name field to separate product/blend name
-- from bean type classification.
--
-- Changes:
-- 1. Add bean_name column (nullable initially)
-- 2. Migrate existing data: bean_type → bean_name
-- 3. Set bean_name as NOT NULL
-- 4. Make bean_type nullable (optional field)
-- 5. Add indexes for search performance
-- =============================================================================

-- Step 1: Add bean_name column (nullable for now)
ALTER TABLE coffee_evaluations
ADD COLUMN IF NOT EXISTS bean_name TEXT;

-- Step 2: Migrate existing data
-- Copy bean_type values to bean_name for existing records
UPDATE coffee_evaluations
SET bean_name = bean_type
WHERE bean_name IS NULL;

-- Step 3: Make bean_name required
ALTER TABLE coffee_evaluations
ALTER COLUMN bean_name SET NOT NULL;

-- Step 4: bean_type remains optional (already nullable)
-- No action needed - bean_type is already TEXT (nullable)

-- Step 5: Add indexes for bean_name search
-- B-tree index for exact matches and sorting
CREATE INDEX IF NOT EXISTS idx_coffee_evaluations_bean_name
ON coffee_evaluations(bean_name);

-- GIN index for full-text search (Japanese support)
CREATE INDEX IF NOT EXISTS idx_coffee_evaluations_bean_name_gin
ON coffee_evaluations USING gin(bean_name gin_trgm_ops);

-- Add comment for documentation
COMMENT ON COLUMN coffee_evaluations.bean_name IS 'Coffee bean product/blend name (required)';
COMMENT ON COLUMN coffee_evaluations.bean_type IS 'Coffee bean type classification (optional, e.g., Arabica, Robusta, Blend)';

-- =============================================================================
-- End of Migration
-- =============================================================================
