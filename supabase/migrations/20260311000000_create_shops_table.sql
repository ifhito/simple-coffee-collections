-- =============================================================================
-- Create shops table for shop entity separation
-- =============================================================================
-- Separates shop data from coffee_evaluations.shop_name into its own table.
-- Uses normalized_name (generated column) for deduplication and uniqueness.
-- =============================================================================

-- =============================================================================
-- TABLE: shops
-- =============================================================================
CREATE TABLE IF NOT EXISTS shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Shop name (as entered by user)
    name TEXT NOT NULL,

    -- Normalized name for deduplication: lowercase, trimmed, collapsed whitespace
    normalized_name TEXT GENERATED ALWAYS AS (
        lower(regexp_replace(trim(name), '\s+', ' ', 'g'))
    ) STORED NOT NULL,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint on normalized name to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_shops_normalized_name
    ON shops(normalized_name);

-- GIN trigram index for partial/fuzzy search on name
CREATE INDEX IF NOT EXISTS idx_shops_name_gin
    ON shops USING gin(name gin_trgm_ops);

-- Comments
COMMENT ON TABLE shops IS 'Shop/cafe master data separated from coffee_evaluations';
COMMENT ON COLUMN shops.name IS 'Shop name as entered by user';
COMMENT ON COLUMN shops.normalized_name IS 'Normalized shop name for deduplication (auto-generated)';

-- Trigger for auto-updating updated_at (reuses existing function)
DROP TRIGGER IF EXISTS trigger_shops_updated_at ON shops;
CREATE TRIGGER trigger_shops_updated_at
    BEFORE UPDATE ON shops
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Policy 1: Authenticated users can read all shops
DROP POLICY IF EXISTS "shops_select_authenticated" ON shops;
CREATE POLICY "shops_select_authenticated" ON shops
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy 2: Authenticated users can insert shops
DROP POLICY IF EXISTS "shops_insert_authenticated" ON shops;
CREATE POLICY "shops_insert_authenticated" ON shops
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
