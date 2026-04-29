# 能動的 follow-up 提案 + ルール昇格 disposition の組み込み

## Context

ユーザー要望 (2026-04-30, 数回の course correction を経て確定):

> ただ言われたことをやるのでなく、この場面で他にやった方が良いことを自分で考えて『〜しますか?』と確認してほしい。聞いた上で OK と言われたものは、その場でルール化してほしい。例えば今回の PR 自動化はルール化して良い。

つまり Claude に組み込みたいのは、単発の「能動提案」ではなく **学習ループ** :

1. **Notice**: タスクの節目で「他にやった方が良い follow-up は?」を Claude 自身が自問
2. **Ask**: ルール化されていない案件は一行で確認 (`〜しますか?`)
3. **Promote**: ユーザーが OK したら、その場で実行する **だけでなく** メモリ/CLAUDE.md に新ルールとして書き足す → 次回以降は再確認なしで自動実行
4. **Apply**: 既にルール化済みのものは re-ask しない

過去経緯:
- 旧「Auto-PR ルール (常に PR 自動作成)」は 2026-04-29 にユーザー明示指示で確立済み → これは **昇格済みルールの実例** として残す
- 今回追加するのはその上位のメタ disposition: 「気付く → 聞く → 昇格させる」のループ自体

## 実装方針

メモリ + CLAUDE.md の二層に **メタ disposition** を embed する。Stop hook 経由の機械的 nudge は今回は入れない (能動的気付きは LLM 側で動かすのが筋。効かなければ次タスクで検討)。

### 1. メモリ追加 (旧ファイル温存)

`~/.claude/projects/-Users-hotake-Documents-coffee-app-simple-coffee-collections/memory/feedback_auto_pr.md` は **削除しない** — 過去にユーザー承認で昇格された「ルール化済み follow-up」の実例として価値がある。これを参照しながら新 disposition がメタルールとして上に立つ構造にする。

新規 `feedback_proactive_surfacing.md` を作成:

- **rule (1 行)**: タスクの節目では Claude 自身が「他にやった方が良い follow-up は?」を自問する。ルール化されていない案件は実行前に一行で確認し、ユーザー OK なら **その場でルール化** (新メモリファイル作成 + `MEMORY.md` 索引追加) してから実行する
- **Why**: 2026-04-30 ユーザー指示「ただ言われたことをやるでなく自分で考えて聞いてほしい / OK されたものはルール化してほしい」。能動性 + 学習ループの組み合わせで「同じ確認を 2 度させない」を実現
- **How to apply** (3 段階で記載):
  - **Step 1: 気付くべき節目**
    - 修正完了後 / 機能追加後 / 調査・分析後 / リファクタ後 / 完了報告時
  - **Step 2: 候補にする follow-up カテゴリ**
    - PR 作成 / E2E テスト実行 / docs 更新 / decision 記録 / progress.md 追記 / 隣接 cleanup / 同種問題の調査 / 次ステップの scheduling
    - 一行で `〜しますか?` 形式。複数候補なら 2-3 並べて選んでもらう
  - **Step 3: 昇格手順**
    - ユーザー OK → そのフォローアップ用の新メモリ `feedback_<topic>.md` を作成 (rule / Why / How to apply 構造)
    - `MEMORY.md` の `## Workflow` セクションに 1 行索引を追加
    - 完了 + 過去会話への直リンクとして「2026-MM-DD のユーザー指示で承認」を Why に記載
- **例外条件**:
  - ユーザーが「終わり」「とりあえずここまで」「もういい」と closure を示している時は提案しない
  - 直前ターンで似た offer を出している時は重ねない (system prompt の don't-stack-offers を継承)
  - 1 ターン 1 提案上限 (3 候補並列の選択肢提示は 1 提案として扱う)
  - 既存ルール (例: Auto-PR) のスコープに収まる案件は再確認せず自動実行

`~/.claude/projects/.../memory/MEMORY.md` の `## Workflow` セクションを以下に書き換え:

```
## Workflow
- [節目で能動的に follow-up を提案 → OK されたらルール化](feedback_proactive_surfacing.md) — メタ disposition (気付く → 聞く → 昇格)
- [タスク完了後は自動で PR まで作成する](feedback_auto_pr.md) — 昇格済みルール実例 (2026-04-29 承認)
```

### 2. CLAUDE.md 書き換え

`CLAUDE.md` の Feature Development Workflow を以下に変更:

```
1. Branch: `git checkout -b feature/name`
2. spec-workflow MCP: Requirements → Design → Tasks → Implementation
3. TDD: Test → Fail → Implement → Pass → Refactor (80%+ coverage)
4. **Proactive Surfacing**: 節目で「他にやった方が良い follow-up は?」を自問。
   - 既存ルール (Auto-PR 等) のスコープなら自動実行
   - 未ルール化の案件は一行で確認 (`〜しますか?`)
   - ユーザー OK なら実行 **+ その場でルール化** (メモリ追加 + `MEMORY.md` 索引追記)
5. **Auto-PR (昇格済みルール)**: タスク完了後は明示指示なしで commit → push → `gh pr create` まで自動実行。destructive 操作のみ事前確認
```

`Last Updated`: 2026-04-30 / `Version`: 1.4.0

### 3. progress.md 追記

CLAUDE.md の継続記録ルールに従い 1 エントリ:
- What: メタ disposition (気付き → 確認 → 昇格) を memory + CLAUDE.md に embed
- Why: 旧 Auto-PR ルールは具体例として正しかったが、ユーザー本意は「PR 限定の自動化ではなく、follow-up 全般を能動提案 → OK ならルール化する disposition」
- Rejected: Stop hook での機械的 nudge (judgement 系は LLM で動かす方針)、旧 `feedback_auto_pr.md` の削除 (昇格済みルールの実例として温存)
- Next: 効果が観察できなければ Stop hook で薄い self-prompt nudge を追加検討

## 変更ファイル

| ファイル | 変更 |
|---------|------|
| `~/.claude/projects/.../memory/feedback_proactive_surfacing.md` | **新規** — メタ disposition 本体 (Notice / Ask / Promote / Apply の 4 段階 + 例外) |
| `~/.claude/projects/.../memory/feedback_auto_pr.md` | **そのまま温存** (昇格済みルール実例) |
| `~/.claude/projects/.../memory/MEMORY.md` | `## Workflow` を 2 行構成 (メタ + 実例) に書き換え |
| `CLAUDE.md` | Feature Development Workflow に step 4 (Proactive Surfacing) と step 5 (Auto-PR) を追加。Last Updated/Version 更新 |
| `memory-bank/progress.md` | 1 エントリ追記 |

## 既存 reuse

- system prompt の「end your reply with a one-line offer to /schedule」パターン — /schedule 限定から汎用 follow-up + 学習ループへ拡張
- 旧 `feedback_auto_pr.md` (CLAUDE.md からも参照) — 昇格済みルールの形式テンプレートとして再利用
- `memory-bank/progress.md` 既存フォーマット (`What / Why / Rejected / Next / Decision`)

## 検証

LLM disposition なので構造テストはない。dogfooding ベース:

1. **文言レビュー**: 新メモリと CLAUDE.md を読み直し、「Notice → Ask → Promote → Apply」の 4 段階が一目で読み取れるか
2. **メタテスト (本変更自体で実演)**: 本変更の実装完了後、Proactive Surfacing 原則に従い「PR 出しますか?」と一行確認 (= Auto-PR ルールに従い実際は自動実行する案件だが、ルールが昇格済みであることをユーザーに思い出してもらう意味で確認しても良い)。今回は **Auto-PR ルール適用で確認なし自動 PR** が正しい挙動
3. **次タスク以降の observable behavior**: Claude が他のジャンルの follow-up (例: docs 更新, E2E 実行) を能動提案するか、OK されたら新ルールが追加されるか、を観察
4. 効果薄なら `progress.md` Next: に「Stop hook で Edit/Write 直後限定の self-prompt nudge を追加」を残す

## スコープ外

- Stop hook での機械的 nudge — まずは disposition rule で運用
- グローバルメモリ複製 — 本プロジェクト限定で開始
- ルール昇格時の自動 git commit — メモリは user の auto-memory なのでリポジトリ commit は不要
- 既存 Stop hook (`tsc --noEmit`, `lint --quiet`) には触らない
