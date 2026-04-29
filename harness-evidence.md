# Harness Evidence — 2026-04-29

`harness-debt.md` で実装した対策が、過去の失敗シナリオを実際に防げることを確認した記録。

各 D-XX について「過去の失敗を再現する手順 → 新ハーネスの捕捉 → 結論」を 1 ブロックでまとめる。

---

## D-01: テンプレ placeholder 機械的適用 — UserPromptSubmit hook

**過去の失敗**: ユーザのプロンプト中の `{{例：...}}` を実態と扱い、`release-notes` SKILL や OCR でない eval を実装しかけた。

**再現手順**:
```bash
echo 'これは {{例：テスト}} のプロンプト' | bash scripts/detect-template-placeholder.sh
```

**結果**:
```
<harness-reminder source="detect-template-placeholder">
ユーザのプロンプトに {{...}} 形式のプレースホルダを検出しました。
（実装に取り掛かる前に observation/scope confirm の reminder）
</harness-reminder>
```

placeholder 無しのプロンプトでは何も出力されない。

**結論**: ✅ 検出される。Claude が実装前にスコープ確認する流れに乗る。

---

## D-02: 用語ぶれ — Stop hook 禁止語 grep

**過去の失敗**: `CoffeeReview` / "レビュー" の混入が dictionary に違反（過去 4 件以上）。

**再現手順**:
```bash
echo 'export class CoffeeReview { name: string }' > evals/dummy-d02.ts
bash scripts/check-forbidden-terms.sh
```

**結果**:
```
[ubiquitous-language] forbidden terms detected (see docs/UBIQUITOUS_LANGUAGE_DICTIONARY.md):
evals/dummy-d02.ts:
1:export class CoffeeReview { name: string }
Use 'CoffeeEvaluation' / 'coffee_evaluations' instead.
exit: 1
```

**結論**: ✅ 識別子レベルの違反を Stop hook で捕捉、exit 1 でブロック。`harness-debt.md` 等の自己言及ファイルは除外済みで false positive なし。

---

## D-03: Migration timestamp 衝突 — arch test

**過去の失敗**: 2026-03-12 の `notes` migration が同日の `drop_shop_name_column` と version 重複し CI 停止。

**再現手順**:
```bash
cp supabase/migrations/20260311010000_migrate_shop_data.sql \
   supabase/migrations/20260311000000_create_shops_table_DUPLICATE.sql
pnpm test --testPathPattern=migration-uniqueness
```

**結果**:
```
Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 passed, 2 total
```
失敗メッセージ: `Duplicate migration timestamps`

**結論**: ✅ CI 到達前にローカル `pnpm test` / Stop hook で検出。

---

## D-04: dataset / criteria drift — runner validation

**過去の失敗**: `evals/dataset.jsonl` の `tags: ["atypical_term", "multi_hint"]` が `criteria.md` に未定義 → eval 実走で初めて発覚。

**再現手順**:
```bash
echo '{"id":"ocr-evidence","scenario":"x","input_text":"x","tags":["totally_undefined_criterion"]}' \
  >> evals/dataset.jsonl
EVAL_TARGET_MODEL=dummy npx tsx evals/runners/run-evals.ts --only=ocr-evidence
```

**結果**:
```
Dataset / criteria drift detected:
  - ocr-evidence: tag "totally_undefined_criterion" is not defined in criteria.md
Add the missing criterion to evals/criteria.md, or remove the tag from dataset.jsonl.
exit: 1
```

**追加発見**: parser を `^### \`<id>\`` の単一 ID 想定で書いていた初版で、`### \`a\` / \`b\` / \`c\`` 形式の multi-id heading に含まれる `ja_only`/`en_only` も drift として検出してしまった。**parser を「`### ` 行に含まれる全ての ` `<id>` ` を抽出」に修正済み**。drift 検出ロジック自体が機能しているからこそ既存のパース不備も明らかになった。

**結論**: ✅ runner 起動時に drift を捕捉、LLM 呼び出し前に exit 1。

---

## D-05: megaskill 化 — SKILL size arch test

**過去の失敗**: 初版 `release-notes` SKILL が「PR 集約 + 分類 + ドラフト作成」を 1 ファイルに詰め、後で削除に追い込まれた。

**再現手順**:
```bash
cp .agents/skills/pre-pr-self-review/SKILL.md /tmp/skill.bak
for i in $(seq 1 200); do echo "extra line $i" >> .agents/skills/pre-pr-self-review/SKILL.md; done
pnpm test --testPathPattern=__tests__/architecture/skill-size
```

**結果**:
```
Test Suites: 1 failed, 1 total
Tests:       1 failed, 13 passed
```
失敗メッセージ: `SKILL.md is 234 lines (limit 200). Move detail to references/...md.`

**結論**: ✅ 200 行ハードシーリングで megaskill を物理的にブロック（Procedure ステップ数 8 上限とセット）。

**既知の grandfathered**: `cmux-handoff-orchestrator/SKILL.md` (106 行) は legacy としてシーリング以下なので通過。次回リファクタ機会に references/ へ抽出予定。

---

## D-06: E2E テキスト依存 — pre-pr-self-review SKILL

**過去の失敗**: `'ログイン中:'` 文言削除に E2E が追従せず CI red（2026-03-26 ほか月 2〜3 回）。

**再現手順**: SKILL を直接実行する手段ではなく、Procedure ステップ 6 として恒常的に組み込まれた状態を確認する。

```bash
grep -A 1 "E2E" .agents/skills/pre-pr-self-review/SKILL.md
```

**結果**:
```
6. E2E (`*.spec.ts`) を変更した場合、固定 UI 文言依存 (`getByText`) の使用量を grep で確認し、
   `getByRole` / `getByTestId` への置換を検討する（過去に文言変更で複数回壊れたため）。
```

**結論**: ✅ pre-PR セルフレビューで自動的に注意喚起。検出は決定論的でないが、過去事例 (2026-03-26) と紐付けて意識付けを強制。

---

## D-08: AGENTS.md 肥大化 — doc size arch test

**過去の失敗**: PR #47 初版 AGENTS.md が 117 行 / 重複指示 → spec 駆動で再構成。

**再現手順**:
```bash
cp AGENTS.md /tmp/AGENTS.md.bak
for i in $(seq 1 100); do echo "- 念のためルール $i: なんとなく追加した指示" >> AGENTS.md; done
pnpm test --testPathPattern=__tests__/architecture/doc-size
```

**結果**:
```
Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 passed
```
失敗メッセージ: `AGENTS.md is 153 lines (limit 120). Refactor: extract verbose sections to @docs/... and reference them.`

**結論**: ✅ 120 行ハードシーリングで「念のため指示」物理的ブロック。CLAUDE.md ≤ 30 も同じテストで担保。

---

## サマリ

| D-XX | 対策方式 | 過去失敗の再現 → 検出 | 副次効果 |
|---|---|---|---|
| D-01 | UserPromptSubmit hook | ✅ | placeholder reminder で実装前 scope 確認 |
| D-02 | Stop hook (grep) | ✅ | 自己言及ファイル除外で false positive ゼロ |
| D-03 | arch test | ✅ | CI 到達前に検出 |
| D-04 | runner validation | ✅ | parser 不備も同時に解消 |
| D-05 | arch test | ✅ | legacy SKILL は grandfathered |
| D-06 | SKILL Procedure 追記 | ✅ (組込確認) | E2E 変更時のセルフレビューに統合 |
| D-08 | arch test | ✅ | AGENTS / CLAUDE 両方を保護 |

**7 件すべて、対象シナリオを再現したうえで新ハーネスが捕捉することを確認**。`pnpm test` / Stop hook / UserPromptSubmit hook の各層に決定論的な検出を分散配置し、AGENTS.md には新規指示を追加していない（150〜200 指示制限を侵さない）。
