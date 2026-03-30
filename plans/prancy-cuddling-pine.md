# Cloudflare 移行計画

## Context

現在 Vercel にデプロイしているが、Cloudflare Pages/Workers への移行を検討。
目的はコスト・パフォーマンス・ベンダー依存排除の可能性評価。

---

## 難易度評価: **中〜高**

### 良いニュース
- Vercel 固有パッケージ（`@vercel/`）は **一切未使用**
- Supabase は外部サービスなので変更不要
- AI SDK（`@ai-sdk/*`）は HTTP ベースで移植性あり
- `next.config.ts` はほぼ空で制約なし

### 問題点（3つ）

#### 🔴 問題1: ネイティブモジュール（最大の障壁）

Cloudflare Pages/Workers は **V8 isolate 上で動作**（Node.js ランタイムではない）。
以下のネイティブモジュールが **動作しない**:

- `sharp` (画像リサイズ) → OCR ルートで使用
- `heic-convert` (HEIC変換) → OCR ルートで使用

| パッケージ | 問題 | 解決策 |
|---|---|---|
| `sharp` | ネイティブアドオン | Cloudflare Images API / 削除 |
| `heic-convert` | Node.js Buffer 依存 | WebAssembly 版に置換 |

#### 🔴 問題2: OCR ルートの 60秒タイムアウト

`app/api/agent/ocr/route.ts` に `export const maxDuration = 60` が設定されている。
Cloudflare Workers のデフォルト CPU 制限は **10ms**（壁時計時間ではなくCPU時間）。
I/O待ちは除外されるが、重い処理は別途対応が必要。

#### 🟡 問題3: Mastra フレームワーク互換性

`@mastra/core` は Node.js 専用 API を使用している可能性がある。
Edge Runtime での動作保証がない。

---

## 移行アプローチ（2択）

### Option A: Cloudflare Pages（推奨・難易度高）

`@cloudflare/next-on-pages` アダプターを使用。全ルートが Edge Runtime で動作。

**必要な作業:**
1. `npm install -D @cloudflare/next-on-pages` を追加
2. `wrangler.toml` を作成
3. OCR ルートから `sharp` / `heic-convert` を削除 or WebAssembly 版に置換
4. `runtime = 'nodejs'` を削除（Edge Runtime に変更）
5. OCR 処理を非同期ジョブ化（Supabase Realtime or 外部キューに移行）
6. Mastra の互換性テストと必要に応じた置換
7. 環境変数を Cloudflare Dashboard で再設定

**変更が必要なファイル:**
- `app/api/agent/ocr/route.ts` — runtime 宣言・ネイティブモジュール除去
- `next.config.ts` — `@cloudflare/next-on-pages` の設定追加
- `package.json` — wrangler 追加
- `middleware.ts` — Edge Runtime 互換性確認

**推定工数: 3〜5日**

---

### Option B: ハイブリッド構成（難易度低、推奨度低）

メインアプリは Vercel のまま、静的アセットのみ Cloudflare CDN を使う。
または Cloudflare Tunnel + Workers Proxy で前段に置く。

**必要な作業:** 最小限（Cloudflare の設定のみ）
**デメリット:** Vercel 依存は残る。コスト削減効果は限定的。

---

## 推奨事項

**まずは Cloudflare Pages での動作検証** を実施。

1. `app/api/agent/ocr/` を一時的に無効化 or スタブ化
2. 残りのルート（認証、コーヒー記録 CRUD）が Edge Runtime で動くか確認
3. OCR 機能は別途 Cloudflare Workers + Queues で非同期化を設計

OCR（画像処理 + LLM）は長時間処理のため、**Edge Runtime に向かない機能**。
Supabase Edge Functions か外部サービスに切り出す設計変更が現実的。

---

## 変更不要なもの

- Supabase 接続設定（環境変数は再設定が必要だが、コードは変更不要）
- 認証フロー（`lib/actions/auth.ts`）
- コーヒー記録 CRUD（`lib/actions/coffee.ts`）
- UI コンポーネント全般
- AI SDK プロバイダー設定（HTTP ベース）

---

## 検証方法

```bash
# ローカルで Cloudflare Pages の動作確認
npx @cloudflare/next-on-pages
npx wrangler pages dev .vercel/output/static

# OCR なしでの基本フロー確認
# → ログイン → カフェ検索 → コーヒー記録作成
```
