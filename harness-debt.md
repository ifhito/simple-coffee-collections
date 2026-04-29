# Harness Debt — 2026-04-29

直近 30 日（2026-03-30 → 2026-04-29）の git log / progress.md / PR conversations から抽出した「エージェントが繰り返したミス」と対策候補。

各案は次の優先順で提示する:
1. **a. 決定論的 Sensor**（lint / test / type）
2. **b. Stop or PostToolUse hook で強制**
3. **c. AGENTS.md +1 行**（最後の手段、150〜200 指示制限を意識）

---

## D-01: テンプレ placeholder を実態と扱う

**Evidence**:
- `{{例：PR作成前のセルフレビュー}}` を SKILL として literal に実装 → 後で `release-notes` を `add-llm-provider` に差し替え
- `{{例：チャットボット応答／RAG／要約}}` で OCR でない AI 機能の eval を実装しかけた

**Frequency**: 2 回（同セッション内）／ **Impact**: 1 SKILL 削除＋作り直し、eval scope 1 回設計修正

**Mitigation**:
- a. 該当なし（文意理解が必要）
- b. `UserPromptSubmit` hook でユーザ入力に `{{` を含むものを検出して「placeholder の可能性あり、実態確認推奨」をエージェントに sysmsg 注入
- c. AGENTS.md Conventions に: `Treat {{...}} placeholders as cues to verify against repo reality, not as literal targets.`

**Recommended**: **b**（決定論的に検出できる、AGENTS.md を肥大化させない）

---

## D-02: 用語ぶれ（dictionary 違反）

**Evidence**:
- `notes` / `bean_impression` / 「メモ」/「感想」の揺れ（progress 2026-03-12 複数）
- `Review` vs `Evaluation`（dictionary に明記済みだが lint されていない）

**Frequency**: 直近で 4 件以上 ／ **Impact**: rename PR 複数

**Mitigation**:
- a. ESLint custom rule で「禁止用語」を error 化（`docs/UBIQUITOUS_LANGUAGE_DICTIONARY.md` から forbidden list を生成）
- b. Stop hook で `grep -E "CoffeeReview|レビュー\b"` をかけて警告
- c. 既に AGENTS.md に「用語は dictionary に従う」あり（増やさない）

**Recommended**: **b**（実装コスト最小、誤検出時にも warn で済む）

---

## D-03: Migration timestamp 衝突

**Evidence**:
- progress 2026-03-12: `20260312000000_add_notes` が `drop_shop_name_column` と version 重複し CI 停止
- リネームで対応 → 同種事故が再発し得る

**Frequency**: 1 回観測 ／ **Impact**: CI 停止 + rename commit

**Mitigation**:
- a. `lib/__tests__/architecture/migration-uniqueness.test.ts` で `supabase/migrations/` の timestamp prefix がユニークかをアサート（既存 arch test と同型）
- b. Stop hook で同様の check を 1 行追加
- c. `db-migration` SKILL に注記（既にある）

**Recommended**: **a**（テストとして残るので CI でも回り、再発時に即赤）

---

## D-04: SKILL/dataset 設定 drift

**Evidence**:
- `evals/dataset.jsonl` の `tags: ["atypical_term", "multi_hint"]` が `criteria.md` に未定義 → runtime で発覚
- `coffee-ocr-tool.ts` の `roast_level` enum と prompt 内の選択肢が drift し得る構造

**Frequency**: 1 回観測（今セッション）／ **Impact**: pass rate ノイズ

**Mitigation**:
- a. `evals/runners/run-evals.ts` 起動時に dataset.tags と criteria.md のヘッダーを突き合わせ、未定義タグなら即 throw
- b. Stop hook で `evals/**` 変更時に整合性チェック
- c. 該当なし

**Recommended**: **a**（コード 5〜10 行、決定論的、誤検出ゼロ）

---

## D-05: megaskill 化（1 SKILL 多ジョブ）

**Evidence**:
- 自分が初版 `release-notes` を「PR 集約 + 分類 + draft 作成」を 1 SKILL に詰めかけた
- `pre-pr-self-review` も「差分 + 規約 + センサー + 残骸 + progress」と肥大化中

**Frequency**: 観測されつつある ／ **Impact**: 適用判断曖昧化

**Mitigation**:
- a. arch test で `.agents/skills/*/SKILL.md` の Procedure ステップ数 ≤ 8 / 行数 ≤ 100 を assert
- b. Stop hook で SKILL 変更時に同等チェック
- c. 既に AGENTS.md / onboarding に記載

**Recommended**: **a**（lint/test と同列、機械的に検出）

---

## D-06: E2E のテキスト依存

**Evidence**:
- progress 2026-03-26: `'ログイン中:'` 削除に E2E が追従しない
- progress 2026-03-11: 「詳細遷移 helper」を click 依存から `href` 取得方式へ書き直し
- E2E が UI 文言変更で頻繁に壊れる

**Frequency**: 月 2〜3 回ペース ／ **Impact**: PR 都度の test 修正

**Mitigation**:
- a. ESLint rule で `e2e/**/*.spec.ts` 内の `getByText(/...固定文字列.../)` を warn（`getByRole` / `getByTestId` 推奨）
- b. 該当なし
- c. `pre-pr-self-review` SKILL に「E2E 変更時 getByText 比率を確認」を追記

**Recommended**: **c**（lint で文字列正規表現の判定は誤検出が多い、SKILL の方が現実的）

---

## D-07: null / all-or-nothing 制約の漏れ

**Evidence**:
- progress 2026-03-11 連続: `EvaluationRatings` の null 表現で 3 PR にわたり修正
- entity refactor 後にテストの `.value` 直アクセスが残り 6 errors（PR #48）

**Frequency**: 観測 6 件以上 ／ **Impact**: 型 refactor 後の連鎖エラー

**Mitigation**:
- a. TypeScript strict null check（既に有効）／ Domain layer に invariant assertion を強制するテスト
- b. 該当なし
- c. AGENTS.md Conventions に: `Domain entities expose nullable getters; tests must use ?. or guard, never !.`

**Recommended**: **既に解消済み** — 型強制で十分。新ルール追加は過剰。**バックログ送り**

---

## D-08: 「念のため」の冗長指示混入

**Evidence**:
- 旧 AGENTS.md (PR #47 初版) が 117 行 / 重複指示で user spec で再構成（PR #50）
- 旧 CLAUDE.md が 78 行で AGENTS.md と重複

**Frequency**: 構造的（一度発生した負債を継続防止）／ **Impact**: 1 PR 分の再構成

**Mitigation**:
- a. arch test で `AGENTS.md ≤ 120 行` / `CLAUDE.md ≤ 30 行` を assert
- b. 該当なし
- c. 既に onboarding doc にアンチパターン記載

**Recommended**: **a**（容量制約を機械化することで「念のため追加」を物理的にブロック）

---

## D-09: CI で silent disable する設計

**Evidence**:
- 私が evals.yml に書いた `if: ${{ secrets.ANTHROPIC_API_KEY != '' }}` で secret 未設定時に skip → ユーザ「実は CI で動いてないよね？」で発覚
- 結果として workflow ごと削除に至った

**Frequency**: 1 回 ／ **Impact**: 設計巻き戻し

**Mitigation**:
- a. CI workflow yaml に `if: ${{ secrets... }}` を含む job を arch test で warn
- b. 該当なし
- c. 既に onboarding doc に「silent disable」アンチパターンとして記載

**Recommended**: **c で十分**（再発リスク低、既に文書化済み）→ **バックログ送り**

---

## D-10: bash hook が untracked file を見落とす

**Evidence**:
- `scripts/eval-on-ai-change.sh` 初版が `git diff --name-only HEAD` のみで、Claude が新規作成したファイルを検出できず
- ユーザに指摘されて `git status --porcelain` ベースに修正

**Frequency**: 1 回 ／ **Impact**: hook が無音で no-op

**Mitigation**:
- a. 該当なし
- b. 該当なし
- c. AGENTS.md の Conventions に: `Hook scripts that inspect changed files must use \`git status --porcelain\` (covers untracked).`

**Recommended**: **既に修正済み**。 構造的に残すなら **c**（1 行）。**バックログ送り検討**

---

## サマリ表

| ID | タイトル | 推奨対策 | コスト | 効果 |
|---|---|---|---|---|
| D-01 | テンプレ placeholder 機械的適用 | **b** UserPromptSubmit hook | 中 | 中 |
| D-02 | 用語ぶれ | **b** Stop hook で grep | 小 | 中 |
| D-03 | Migration timestamp 衝突 | **a** arch test | 小 | 高 |
| D-04 | dataset/config drift | **a** runner validation | 小 | 高 |
| D-05 | megaskill 化 | **a** arch test (行数/ステップ) | 小 | 中 |
| D-06 | E2E テキスト依存 | **c** SKILL 追記 | 極小 | 中 |
| D-07 | null 整合性 | 解消済み | — | — |
| D-08 | 「念のため」指示 | **a** arch test (行数上限) | 小 | 高 |
| D-09 | CI silent disable | 文書化済み | — | — |
| D-10 | hook untracked 漏れ | 解消済み | — | — |

実装候補: **D-01, D-02, D-03, D-04, D-05, D-06, D-08** の 7 件。
バックログ候補: **D-07, D-09, D-10**（解消済み or 文書化済み）。
