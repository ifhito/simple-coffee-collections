-- Make rating columns nullable to support "bean-only" registration
-- (register bean info first, add evaluation later)

ALTER TABLE coffee_evaluations ALTER COLUMN acidity DROP NOT NULL;
ALTER TABLE coffee_evaluations ALTER COLUMN bitterness DROP NOT NULL;
ALTER TABLE coffee_evaluations ALTER COLUMN aroma DROP NOT NULL;
ALTER TABLE coffee_evaluations ALTER COLUMN overall_rating DROP NOT NULL;

-- Ensure ratings are either all present or all null (all-or-nothing)
ALTER TABLE coffee_evaluations ADD CONSTRAINT ratings_all_or_nothing
  CHECK (
    (acidity IS NULL AND bitterness IS NULL AND aroma IS NULL AND overall_rating IS NULL) OR
    (acidity IS NOT NULL AND bitterness IS NOT NULL AND aroma IS NOT NULL AND overall_rating IS NOT NULL)
  );
