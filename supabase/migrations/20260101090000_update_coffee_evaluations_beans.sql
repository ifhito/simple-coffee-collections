-- Make bean_name required; make bean_type and shop_name optional

-- Backfill existing NULL bean_name to empty string to satisfy NOT NULL
UPDATE coffee_evaluations
SET bean_name = ''
WHERE bean_name IS NULL;

-- Remove NOT NULL constraint from shop_name and bean_type
ALTER TABLE coffee_evaluations
    ALTER COLUMN shop_name DROP NOT NULL,
    ALTER COLUMN bean_type DROP NOT NULL;

-- Set default and enforce NOT NULL on bean_name
ALTER TABLE coffee_evaluations
    ALTER COLUMN bean_name SET DEFAULT '',
    ALTER COLUMN bean_name SET NOT NULL;

COMMENT ON COLUMN coffee_evaluations.bean_name IS 'Coffee bean product/blend name (required, max 255 characters)';
