# Pre-PR Self Review — 詳細手順

## 1. 差分の規模・範囲

```bash
git diff --stat main...HEAD
git log main..HEAD --oneline
```

判断基準:
- 500 行超または 10 ファイル超 → PR 分割を検討
- 単一意図に収まっているか（命名、責務）

## 2. Conventions チェック

| 項目 | コマンド / 観点 |
|---|---|
| 用語 | `docs/UBIQUITOUS_LANGUAGE_DICTIONARY.md` と差分の命名を照合 |
| 型 | `interface ` を grep（lint で検出されるが二重チェック） |
| 層境界 | `lib/domain/**` から `lib/infrastructure/` を import していないか |
| UI 文言 | 英語混入していないか（差分の `*.tsx` 視覚チェック） |

## 3. プログラム的チェック

```bash
pnpm typecheck
pnpm lint --quiet
pnpm test --testPathPattern=__tests__/architecture
```

振る舞い変更があれば追加で:

```bash
pnpm test
```

## 4. 残骸検出

```bash
grep -rEn "console\.(log|warn|error|debug)|\\.only\\(|xit\\(|debugger;" \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules --exclude-dir=.next \
  app components lib
```

意図的なログ（エラーハンドリング等）は除外可。`debugger` と `.only(` は常に削除。

## 5. progress.md 確認

```bash
grep -A 5 "$(date +%Y-%m-%d)" memory-bank/progress.md
```

当日エントリが無い → `progress-logger` SKILL を呼んで追記してから PR 作成。

## 出力フォーマット

```
## ✅ 通過
- typecheck: 0 errors
- lint: 0 violations
- arch test: 41 pass
- progress.md: 当日エントリあり

## ⚠️ 要修正
- (high) lib/foo.ts:42 — console.log 残骸
- (medium) app/(app)/bar.tsx:15 — UI 文言が英語のまま「Submit」

## 判定
NO-GO（high が 1 件あるため、修正後に再実行を推奨）
```
