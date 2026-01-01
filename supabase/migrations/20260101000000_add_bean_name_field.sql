-- Add bean_name column to coffee_evaluations table
-- This column stores the specific coffee bean product name/blend name
-- (e.g., "エチオピア イルガチェフェ G1", "グアテマラ アンティグア")

ALTER TABLE coffee_evaluations
ADD COLUMN bean_name VARCHAR(255) NULL;

COMMENT ON COLUMN coffee_evaluations.bean_name IS 'Coffee bean product/blend name (optional, max 255 characters)';
