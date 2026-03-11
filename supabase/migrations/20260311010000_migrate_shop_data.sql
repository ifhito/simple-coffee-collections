-- =============================================================================
-- Migrate existing shop_name data to shops table
-- =============================================================================
-- 1. Populate shops from existing coffee_evaluations.shop_name
-- 2. Add shop_id FK column to coffee_evaluations
-- 3. Backfill shop_id from shops table
-- 4. Index shop_id for query performance
-- =============================================================================

-- Step 1: Insert distinct shop names into shops table
INSERT INTO shops (name)
SELECT DISTINCT trim(shop_name)
FROM coffee_evaluations
WHERE shop_name IS NOT NULL
  AND trim(shop_name) <> ''
ON CONFLICT (normalized_name) DO NOTHING;

-- Step 2: Add shop_id column to coffee_evaluations
ALTER TABLE coffee_evaluations
    ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES shops(id);

-- Step 3: Backfill shop_id from shops using normalized name matching
UPDATE coffee_evaluations ce
SET shop_id = s.id
FROM shops s
WHERE lower(regexp_replace(trim(ce.shop_name), '\s+', ' ', 'g')) = s.normalized_name
  AND ce.shop_name IS NOT NULL
  AND trim(ce.shop_name) <> '';

-- Step 4: Create index on shop_id for efficient joins
CREATE INDEX IF NOT EXISTS idx_coffee_evaluations_shop_id
    ON coffee_evaluations(shop_id);

-- Comment
COMMENT ON COLUMN coffee_evaluations.shop_id IS 'References shops(id) - linked shop entity (nullable during migration)';
