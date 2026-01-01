-- =============================================================================
-- Coffee Bean Evaluation App - Initial Schema Migration
-- =============================================================================
-- This migration creates the core tables for the coffee journal application:
-- - profiles: User profile extension for auth.users
-- - bean_types: Master table for coffee bean types
-- - roast_levels: Master table for roast levels
-- - coffee_records: Main table for coffee evaluation records
-- =============================================================================

-- =============================================================================
-- Enable pg_trgm extension for Japanese text search
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- -----------------------------------------------------------------------------
-- Helper Function: Auto-update updated_at timestamp
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TABLE: profiles
-- User profile extension linked to Supabase auth.users
-- =============================================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT '',
    bio TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_name ON profiles(name);

-- Trigger for auto-updating updated_at
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
-- Anyone can read profiles
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT
    USING (true);

-- Only the owner can insert their own profile
CREATE POLICY "profiles_insert_policy" ON profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Only the owner can update their own profile
CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Only the owner can delete their own profile
CREATE POLICY "profiles_delete_policy" ON profiles
    FOR DELETE
    USING (auth.uid() = id);

-- =============================================================================
-- TABLE: roast_levels
-- Master table for coffee roast levels (system-managed)
-- =============================================================================
CREATE TABLE IF NOT EXISTS roast_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    level INTEGER NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for sorting by level
CREATE INDEX IF NOT EXISTS idx_roast_levels_level ON roast_levels(level);

-- Trigger for auto-updating updated_at
CREATE TRIGGER trigger_roast_levels_updated_at
    BEFORE UPDATE ON roast_levels
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE roast_levels ENABLE ROW LEVEL SECURITY;

-- RLS Policies for roast_levels
-- Anyone can read roast levels
CREATE POLICY "roast_levels_select_policy" ON roast_levels
    FOR SELECT
    USING (true);

-- No insert/update/delete policies for regular users
-- Only service_role or direct database access can modify

-- =============================================================================
-- TABLE: bean_types
-- Master table for coffee bean types (system defaults + user custom)
-- =============================================================================
CREATE TABLE IF NOT EXISTS bean_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraint: Default types must not have a user_id
    CONSTRAINT bean_types_default_no_user
        CHECK ((is_default = true AND user_id IS NULL) OR (is_default = false)),

    -- Constraint: Custom types must have a user_id
    CONSTRAINT bean_types_custom_has_user
        CHECK ((is_default = false AND user_id IS NOT NULL) OR (is_default = true)),

    -- Unique constraint: name must be unique per user (or globally for defaults)
    CONSTRAINT bean_types_unique_name
        UNIQUE NULLS NOT DISTINCT (name, user_id)
);

-- Index for filtering by user
CREATE INDEX IF NOT EXISTS idx_bean_types_user_id ON bean_types(user_id);

-- Index for filtering defaults
CREATE INDEX IF NOT EXISTS idx_bean_types_is_default ON bean_types(is_default);

-- Trigger for auto-updating updated_at
CREATE TRIGGER trigger_bean_types_updated_at
    BEFORE UPDATE ON bean_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE bean_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bean_types
-- Anyone can read all bean types (defaults + own custom types)
CREATE POLICY "bean_types_select_policy" ON bean_types
    FOR SELECT
    USING (is_default = true OR user_id = auth.uid());

-- Users can only insert their own custom bean types (not defaults)
CREATE POLICY "bean_types_insert_policy" ON bean_types
    FOR INSERT
    WITH CHECK (
        is_default = false
        AND user_id = auth.uid()
    );

-- Users can only update their own custom bean types (not defaults)
CREATE POLICY "bean_types_update_policy" ON bean_types
    FOR UPDATE
    USING (is_default = false AND user_id = auth.uid())
    WITH CHECK (is_default = false AND user_id = auth.uid());

-- Users can only delete their own custom bean types (not defaults)
CREATE POLICY "bean_types_delete_policy" ON bean_types
    FOR DELETE
    USING (is_default = false AND user_id = auth.uid());

-- =============================================================================
-- TABLE: coffee_records
-- Main table for coffee bean evaluation records
-- =============================================================================
CREATE TABLE IF NOT EXISTS coffee_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Bean information
    bean_name TEXT NOT NULL,
    bean_type_id UUID NOT NULL REFERENCES bean_types(id) ON DELETE RESTRICT,
    roast_level_id UUID NOT NULL REFERENCES roast_levels(id) ON DELETE RESTRICT,
    shop_name TEXT NOT NULL DEFAULT '',

    -- Tasting information
    tasting_date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Ratings (1-5 scale)
    acidity INTEGER NOT NULL CHECK (acidity >= 1 AND acidity <= 5),
    bitterness INTEGER NOT NULL CHECK (bitterness >= 1 AND bitterness <= 5),
    aroma INTEGER NOT NULL CHECK (aroma >= 1 AND aroma <= 5),
    overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),

    -- Notes
    tasting_notes TEXT,

    -- Visibility
    is_public BOOLEAN NOT NULL DEFAULT false,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Soft delete
    deleted_at TIMESTAMPTZ
);

-- Indexes for coffee_records
-- Index for user's records (most common query)
CREATE INDEX IF NOT EXISTS idx_coffee_records_user_id
    ON coffee_records(user_id)
    WHERE deleted_at IS NULL;

-- Index for public records
CREATE INDEX IF NOT EXISTS idx_coffee_records_public
    ON coffee_records(is_public, created_at DESC)
    WHERE deleted_at IS NULL AND is_public = true;

-- Index for filtering by bean type
CREATE INDEX IF NOT EXISTS idx_coffee_records_bean_type_id
    ON coffee_records(bean_type_id)
    WHERE deleted_at IS NULL;

-- Index for filtering by roast level
CREATE INDEX IF NOT EXISTS idx_coffee_records_roast_level_id
    ON coffee_records(roast_level_id)
    WHERE deleted_at IS NULL;

-- Index for sorting by tasting date
CREATE INDEX IF NOT EXISTS idx_coffee_records_tasting_date
    ON coffee_records(tasting_date DESC)
    WHERE deleted_at IS NULL;

-- Index for sorting by overall rating
CREATE INDEX IF NOT EXISTS idx_coffee_records_overall_rating
    ON coffee_records(overall_rating DESC)
    WHERE deleted_at IS NULL;

-- Composite index for user's records sorted by date
CREATE INDEX IF NOT EXISTS idx_coffee_records_user_date
    ON coffee_records(user_id, tasting_date DESC)
    WHERE deleted_at IS NULL;

-- Full-text search index for bean name and tasting notes (Japanese support)
CREATE INDEX IF NOT EXISTS idx_coffee_records_bean_name_gin
    ON coffee_records USING gin(bean_name gin_trgm_ops);

-- Trigger for auto-updating updated_at
CREATE TRIGGER trigger_coffee_records_updated_at
    BEFORE UPDATE ON coffee_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE coffee_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coffee_records
-- Users can see: their own records (public or private) + other users' public records
CREATE POLICY "coffee_records_select_policy" ON coffee_records
    FOR SELECT
    USING (
        deleted_at IS NULL
        AND (
            user_id = auth.uid()
            OR is_public = true
        )
    );

-- Users can only insert their own records
CREATE POLICY "coffee_records_insert_policy" ON coffee_records
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Users can only update their own records
CREATE POLICY "coffee_records_update_policy" ON coffee_records
    FOR UPDATE
    USING (user_id = auth.uid() AND deleted_at IS NULL)
    WITH CHECK (user_id = auth.uid());

-- Users can only delete (soft delete) their own records
CREATE POLICY "coffee_records_delete_policy" ON coffee_records
    FOR DELETE
    USING (user_id = auth.uid());

-- =============================================================================
-- Function: Auto-create profile on user signup
-- =============================================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when a new user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- =============================================================================
-- End of Migration
-- =============================================================================
