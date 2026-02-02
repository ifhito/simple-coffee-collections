-- Migration: Add shop location fields to coffee_evaluations
-- Purpose: Store shop address and coordinates for map display and distance calculation
-- Date: 2026-02-02
-- Backward compatible: All new columns are nullable

-- Add shop_address column (TEXT, nullable)
ALTER TABLE coffee_evaluations
ADD COLUMN IF NOT EXISTS shop_address TEXT;

-- Add shop_latitude column (NUMERIC(10,7), nullable)
-- Precision: 7 decimal places = ~1.1cm accuracy
ALTER TABLE coffee_evaluations
ADD COLUMN IF NOT EXISTS shop_latitude NUMERIC(10, 7);

-- Add shop_longitude column (NUMERIC(10,7), nullable)
ALTER TABLE coffee_evaluations
ADD COLUMN IF NOT EXISTS shop_longitude NUMERIC(10, 7);

-- Add comments for documentation
COMMENT ON COLUMN coffee_evaluations.shop_address IS 'Shop address (from Nominatim API or manual input)';
COMMENT ON COLUMN coffee_evaluations.shop_latitude IS 'Shop latitude (-90 to 90)';
COMMENT ON COLUMN coffee_evaluations.shop_longitude IS 'Shop longitude (-180 to 180)';

-- Add constraints for valid coordinate ranges
-- Using DO block to handle "constraint already exists" error
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_shop_latitude_range'
  ) THEN
    ALTER TABLE coffee_evaluations
    ADD CONSTRAINT check_shop_latitude_range
      CHECK (shop_latitude IS NULL OR (shop_latitude >= -90 AND shop_latitude <= 90));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_shop_longitude_range'
  ) THEN
    ALTER TABLE coffee_evaluations
    ADD CONSTRAINT check_shop_longitude_range
      CHECK (shop_longitude IS NULL OR (shop_longitude >= -180 AND shop_longitude <= 180));
  END IF;
END
$$;

-- Add partial index for geospatial queries (only rows with location data)
-- This index will be useful for future features like "nearby shops"
CREATE INDEX IF NOT EXISTS idx_coffee_evaluations_location
  ON coffee_evaluations(shop_latitude, shop_longitude)
  WHERE shop_latitude IS NOT NULL AND shop_longitude IS NOT NULL;

-- Note: Existing RLS policies automatically apply to new columns
-- No additional RLS configuration needed
