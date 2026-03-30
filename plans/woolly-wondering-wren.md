# Plan: Close済みPRのリモートブランチ削除

## Context

`git ls-remote --heads origin` と `gh pr list --state closed` を照合し、
Close済みPRに紐づいているにもかかわらずリモートブランチが残っているものを特定した。

## 削除しないブランチ（保護対象）

| ブランチ | 理由 |
|---|---|
| `main` | デフォルトブランチ |
| `claude/implement-issue-42-ZOBtK` | 現在の作業ブランチ（PR #43 オープン中） |
| `feature/make-sellect-shop-by-webapi` | PRなし（状態不明） |
| `feature/shop-google-places-integration` | PRなし（状態不明） |

## 削除対象（20ブランチ）

| ブランチ | 関連PR |
|---|---|
| `chore/claude-updates` | #12 |
| `chore/shop-search-integration` | #13 |
| `claude/fix-e2e-ci-tests-uyjm4` | #8 |
| `claude/fix-issues-32-33-35-8SIhB` | #36 |
| `claude/implement-spec-workflow-tasks-FSAG4` | #15 |
| `docs/update-workflow-guide` | #9 |
| `feature/add-coffee-notes` | #27 |
| `feature/ci-tests` | #7 |
| `feature/clean-architecture-implementation` | #4 |
| `feature/custom-email-templates` | #41 |
| `feature/e2e-testing-setup` | #5 |
| `feature/e2e-tests-comprehensive` | #10 |
| `feature/extract-shops-and-search-plan` | #26 |
| `feature/fix-signup` | #1 |
| `feature/mastra-ocr-agent-main` | #18, #21 |
| `feature/organize-claude-setting` | #14 |
| `feature/separate-bean-registration-and-evaluation` | #23 |
| `feature/swagger-storybook` | #11 |
| `followup/pr-26-remaining-items` | #28 |
| `refactor/ocr-main-base` | #19 |

## 実行コマンド

```bash
git push origin --delete \
  chore/claude-updates \
  chore/shop-search-integration \
  claude/fix-e2e-ci-tests-uyjm4 \
  claude/fix-issues-32-33-35-8SIhB \
  claude/implement-spec-workflow-tasks-FSAG4 \
  docs/update-workflow-guide \
  feature/add-coffee-notes \
  feature/ci-tests \
  feature/clean-architecture-implementation \
  feature/custom-email-templates \
  feature/e2e-testing-setup \
  feature/e2e-tests-comprehensive \
  feature/extract-shops-and-search-plan \
  feature/fix-signup \
  feature/mastra-ocr-agent-main \
  feature/organize-claude-setting \
  feature/separate-bean-registration-and-evaluation \
  feature/swagger-storybook \
  followup/pr-26-remaining-items \
  refactor/ocr-main-base
```

## 確認方法

```bash
git ls-remote --heads origin
```

上記の20ブランチが消え、`main` / `claude/implement-issue-42-ZOBtK` /
`feature/make-sellect-shop-by-webapi` / `feature/shop-google-places-integration`
の4ブランチのみ残ることを確認する。
