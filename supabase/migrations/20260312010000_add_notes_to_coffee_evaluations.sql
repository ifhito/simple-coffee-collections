ALTER TABLE coffee_evaluations
ADD COLUMN IF NOT EXISTS notes TEXT;

COMMENT ON COLUMN coffee_evaluations.notes IS 'Optional impression notes for a coffee evaluation';
