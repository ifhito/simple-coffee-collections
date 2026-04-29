# CLAUDE.md

## WHY: Project Purpose

A personal coffee journal to record cafe visits and coffee experiences.
Helps enthusiasts track their coffee journey, discover patterns, and explore new tastes.

**Audience**: Coffee enthusiasts (personal use & community sharing)
**Language**: Japanese (UI/content), English (docs)

---

## WHAT: Architecture & Components

### Architecture: Clean Architecture + DDD

- **Domain**: Entities, Value Objects (`lib/domain/`)
- **Application**: Use Cases, DTOs (`lib/application/`)
- **Infrastructure**: Supabase, Repository (`lib/infrastructure/`)
- **Presentation**: Next.js, Server Actions (`app/`, `lib/actions/`)

**Skills**: claude-md-creator, nextjs-best-practices, e2e-testing (`.claude/skills/`)

---

## HOW: Development Guidelines

### Feature Development Workflow

1. Branch: `git checkout -b feature/name`
2. spec-workflow MCP: Requirements → Design → Tasks → Implementation
3. TDD: Test → Fail → Implement → Pass → Refactor (80%+ coverage)
4. **Proactive Surfacing**: 節目 (修正/機能追加/調査/リファクタ/完了報告後) で「他にやった方が良い follow-up は?」を自問する
   - 既存ルール (Auto-PR 等) のスコープなら自動実行
   - 未ルール化の案件は一行で確認 (`〜しますか?`)。1 ターン 1 提案
   - ユーザー OK → 実行 **+ その場でルール化** (`feedback_<topic>.md` 作成 + `MEMORY.md` 索引追加 + Why に承認日記載)
   - 候補カテゴリ: PR / E2E / docs / decision / progress.md / 隣接 cleanup / 同種問題調査 / 次ステップ scheduling
5. **Auto-PR (昇格済みルール — 2026-04-29 承認)**: タスク完了後は明示指示なしで新規ブランチ作成 → commit → push → `gh pr create` まで自動実行。PR 本文に Summary / Test plan を含める。destructive 操作・force push・main への直接 push のみ事前確認

### Ubiquitous Language (MANDATORY)

**Before coding**: Check `docs/UBIQUITOUS_LANGUAGE_DICTIONARY.md`
**Usage**: `CoffeeEvaluation` ✓ / `CoffeeReview` ✗ (Code), "評価" ✓ / "レビュー" ✗ (UI)

### Next.js & Testing

- Server Components first, Container/Presentational, Composition over drilling
- Unit: Jest + Testing Library | Integration: API, DB | E2E: Playwright (`e2e/README.md`)

### Key Resources

- `docs/UBIQUITOUS_LANGUAGE_DICTIONARY.md` - Term reference (推奨)
- `.claude/skills/` - claude-md-creator, nextjs-best-practices

---

### Continuous Recording (継続記録ルール)

小さな修正も意味単位として扱い、作業のたびに記録を残す。

**記録先の使い分け**

| 種別 | 記録先 |
|------|--------|
| 日常の実装・修正・リファクタ | `memory-bank/progress.md` に追記 |
| 将来も迷い直す可能性がある設計判断 | `docs/decisions/` に個別ファイルを作成 |

**progress.md エントリー形式**

```
### YYYY-MM-DD - 変更の要点（一行）
- What: 何を変えたか
- Why: なぜ変えたか
- Rejected: 却下した案（なければ省略）
- Next: 次に確認・改善すべき点
- Decision: docs/decisions/... があれば記載
```

**Claude の振る舞いルール**

- 実装・修正・リファクタを完了したら `memory-bank/progress.md` に追記する
- 1タスク = 1エントリー（複数ファイルにまたがっても1つにまとめてよい）
- エントリーは短く。長い説明が必要な場合は `docs/decisions/` に移す
- `docs/decisions/` への移動判断基準: 「同じ迷いを将来もしそうか？」→ Yes なら移す

---

**Last Updated**: 2026-04-30 | **Version**: 1.4.0
