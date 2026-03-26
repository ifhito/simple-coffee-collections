-- shops テーブルは店舗名（公開情報）を格納するため、未認証ユーザーでも読み取りを許可する
-- コミュニティページ（公開評価の閲覧）で shop_name が LEFT JOIN できない問題を修正

CREATE POLICY "shops_select_public" ON shops
    FOR SELECT
    TO anon
    USING (true);
