-- Step 1: shop_name があるが shop_id がまだ null の行を shops テーブルへ移行
--   (20260311010000 で一度実行済みだが、その後に追加された行への安全策として再実行)

INSERT INTO shops (name)
SELECT DISTINCT trim(shop_name)
FROM coffee_evaluations
WHERE shop_id IS NULL
  AND shop_name IS NOT NULL
  AND trim(shop_name) <> ''
ON CONFLICT (normalized_name) DO NOTHING;

-- Step 2: shop_id を正規化名称で照合して埋める
UPDATE coffee_evaluations ce
SET shop_id = s.id
FROM shops s
WHERE ce.shop_id IS NULL
  AND ce.shop_name IS NOT NULL
  AND trim(ce.shop_name) <> ''
  AND s.normalized_name = lower(regexp_replace(trim(ce.shop_name), '\s+', ' ', 'g'));

-- Step 3: インデックスを削除してから列を DROP
DROP INDEX IF EXISTS idx_coffee_evaluations_shop_name;
DROP INDEX IF EXISTS idx_coffee_evaluations_shop_name_gin;

ALTER TABLE coffee_evaluations
  DROP COLUMN IF EXISTS shop_name;
