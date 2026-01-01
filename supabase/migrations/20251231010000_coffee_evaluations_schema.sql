-- =============================================================================
-- Coffee Evaluation App - Schema Migration
-- =============================================================================
-- This migration creates the schema based on requirements.md specifications:
-- - user_profiles: User profile information
-- - coffee_evaluations: Coffee evaluation records
-- =============================================================================

-- =============================================================================
-- Enable Required Extensions
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =============================================================================
-- Helper Function: Auto-update updated_at timestamp
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TABLE: user_profiles
-- User profile extension linked to Supabase auth.users
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    -- Primary key references auth.users for 1:1 relationship
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Profile information
    display_name TEXT,           -- User's display name (nullable)
    bio TEXT,                    -- Self-introduction (nullable)

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comment on table and columns
COMMENT ON TABLE user_profiles IS 'User profile information extending auth.users';
COMMENT ON COLUMN user_profiles.id IS 'References auth.users(id)';
COMMENT ON COLUMN user_profiles.display_name IS 'User display name (nullable)';
COMMENT ON COLUMN user_profiles.bio IS 'User self-introduction (nullable)';

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS trigger_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER trigger_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
-- Policy 1: Anyone can read profiles (public information)
DROP POLICY IF EXISTS "user_profiles_select_all" ON user_profiles;
CREATE POLICY "user_profiles_select_all" ON user_profiles
    FOR SELECT
    USING (true);

-- Policy 2: Users can insert their own profile
DROP POLICY IF EXISTS "user_profiles_insert_own" ON user_profiles;
CREATE POLICY "user_profiles_insert_own" ON user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy 3: Users can update only their own profile
DROP POLICY IF EXISTS "user_profiles_update_own" ON user_profiles;
CREATE POLICY "user_profiles_update_own" ON user_profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy 4: Users can delete only their own profile
DROP POLICY IF EXISTS "user_profiles_delete_own" ON user_profiles;
CREATE POLICY "user_profiles_delete_own" ON user_profiles
    FOR DELETE
    USING (auth.uid() = id);

-- =============================================================================
-- TABLE: coffee_evaluations
-- Main table for user coffee evaluation records
-- =============================================================================
CREATE TABLE IF NOT EXISTS coffee_evaluations (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- User reference
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Coffee information
    shop_name TEXT NOT NULL,             -- Shop/cafe name (required)
    bean_type TEXT NOT NULL,             -- Coffee bean type (required)
    roast_level TEXT,                    -- Roast level (optional)

    -- Ratings (1-10 scale)
    acidity INTEGER NOT NULL
        CHECK (acidity >= 1 AND acidity <= 10),         -- Acidity rating
    bitterness INTEGER NOT NULL
        CHECK (bitterness >= 1 AND bitterness <= 10),   -- Bitterness rating
    aroma INTEGER NOT NULL
        CHECK (aroma >= 1 AND aroma <= 10),             -- Aroma rating
    overall_rating INTEGER NOT NULL
        CHECK (overall_rating >= 1 AND overall_rating <= 10),  -- Overall rating

    -- Visibility
    is_public BOOLEAN NOT NULL DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comments on table and columns
COMMENT ON TABLE coffee_evaluations IS 'User coffee evaluation records';
COMMENT ON COLUMN coffee_evaluations.id IS 'Unique identifier (UUID)';
COMMENT ON COLUMN coffee_evaluations.user_id IS 'References auth.users(id) - evaluation creator';
COMMENT ON COLUMN coffee_evaluations.shop_name IS 'Shop/cafe name where coffee was purchased';
COMMENT ON COLUMN coffee_evaluations.bean_type IS 'Type of coffee bean';
COMMENT ON COLUMN coffee_evaluations.roast_level IS 'Roast level (optional)';
COMMENT ON COLUMN coffee_evaluations.acidity IS 'Acidity rating (1-10)';
COMMENT ON COLUMN coffee_evaluations.bitterness IS 'Bitterness rating (1-10)';
COMMENT ON COLUMN coffee_evaluations.aroma IS 'Aroma rating (1-10)';
COMMENT ON COLUMN coffee_evaluations.overall_rating IS 'Overall rating (1-10)';
COMMENT ON COLUMN coffee_evaluations.is_public IS 'Whether the evaluation is publicly visible';

-- =============================================================================
-- Indexes for coffee_evaluations
-- =============================================================================

-- Index 1: user_id - For fetching user's evaluations
CREATE INDEX IF NOT EXISTS idx_coffee_evaluations_user_id
    ON coffee_evaluations(user_id);

-- Index 2: shop_name - For search by shop name (with trigram for partial match)
CREATE INDEX IF NOT EXISTS idx_coffee_evaluations_shop_name
    ON coffee_evaluations(shop_name);
CREATE INDEX IF NOT EXISTS idx_coffee_evaluations_shop_name_gin
    ON coffee_evaluations USING gin(shop_name gin_trgm_ops);

-- Index 3: overall_rating - For sorting by rating
CREATE INDEX IF NOT EXISTS idx_coffee_evaluations_overall_rating
    ON coffee_evaluations(overall_rating DESC);

-- Index 4: created_at - For sorting by date
CREATE INDEX IF NOT EXISTS idx_coffee_evaluations_created_at
    ON coffee_evaluations(created_at DESC);

-- Index 5: Composite index for user's evaluations sorted by date
CREATE INDEX IF NOT EXISTS idx_coffee_evaluations_user_created
    ON coffee_evaluations(user_id, created_at DESC);

-- Index 6: Public evaluations for community feed
CREATE INDEX IF NOT EXISTS idx_coffee_evaluations_public
    ON coffee_evaluations(is_public, created_at DESC)
    WHERE is_public = true;

-- Index 7: bean_type for filtering
CREATE INDEX IF NOT EXISTS idx_coffee_evaluations_bean_type
    ON coffee_evaluations(bean_type);
CREATE INDEX IF NOT EXISTS idx_coffee_evaluations_bean_type_gin
    ON coffee_evaluations USING gin(bean_type gin_trgm_ops);

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS trigger_coffee_evaluations_updated_at ON coffee_evaluations;
CREATE TRIGGER trigger_coffee_evaluations_updated_at
    BEFORE UPDATE ON coffee_evaluations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE coffee_evaluations ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS Policies for coffee_evaluations
-- =============================================================================

-- Policy 1: Users can read their own evaluations
DROP POLICY IF EXISTS "coffee_evaluations_select_own" ON coffee_evaluations;
CREATE POLICY "coffee_evaluations_select_own" ON coffee_evaluations
    FOR SELECT
    USING (user_id = auth.uid());

-- Policy 2: All users can read public evaluations (is_public = true)
DROP POLICY IF EXISTS "coffee_evaluations_select_public" ON coffee_evaluations;
CREATE POLICY "coffee_evaluations_select_public" ON coffee_evaluations
    FOR SELECT
    USING (is_public = true);

-- Policy 3: Users can only create their own evaluations
DROP POLICY IF EXISTS "coffee_evaluations_insert_own" ON coffee_evaluations;
CREATE POLICY "coffee_evaluations_insert_own" ON coffee_evaluations
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Policy 4: Users can only update their own evaluations
DROP POLICY IF EXISTS "coffee_evaluations_update_own" ON coffee_evaluations;
CREATE POLICY "coffee_evaluations_update_own" ON coffee_evaluations
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Policy 5: Users can only delete their own evaluations
DROP POLICY IF EXISTS "coffee_evaluations_delete_own" ON coffee_evaluations;
CREATE POLICY "coffee_evaluations_delete_own" ON coffee_evaluations
    FOR DELETE
    USING (user_id = auth.uid());

-- =============================================================================
-- Function: Auto-create user_profile on user signup
-- =============================================================================
CREATE OR REPLACE FUNCTION handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name', NULL)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user_profile();

-- =============================================================================
-- End of Migration
-- =============================================================================
