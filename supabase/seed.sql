-- =============================================================================
-- Coffee Bean Evaluation App - Seed Data
-- =============================================================================
-- This file contains the initial master data for:
-- - bean_types: Default coffee bean types
-- - roast_levels: Standard roast levels
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Seed: roast_levels (焙煎度マスターデータ)
-- -----------------------------------------------------------------------------
INSERT INTO roast_levels (name, level)
VALUES
    ('浅煎り', 1),
    ('中浅煎り', 2),
    ('中煎り', 3),
    ('中深煎り', 4),
    ('深煎り', 5),
    ('極深煎り', 6)
ON CONFLICT (name) DO UPDATE SET
    level = EXCLUDED.level,
    updated_at = NOW();

-- -----------------------------------------------------------------------------
-- Seed: bean_types (豆の種類マスターデータ - デフォルトタイプ)
-- -----------------------------------------------------------------------------
INSERT INTO bean_types (name, is_default, user_id)
VALUES
    ('アラビカ', true, NULL),
    ('ロブスタ', true, NULL),
    ('ブレンド', true, NULL)
ON CONFLICT ON CONSTRAINT bean_types_unique_name DO UPDATE SET
    is_default = EXCLUDED.is_default,
    updated_at = NOW();

-- =============================================================================
-- End of Seed Data
-- =============================================================================
