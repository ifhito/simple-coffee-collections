# Task Completion Checklist
- Ensure Supabase local is running if feature depends on DB (`supabase start`).
- Run quality checks: `pnpm lint`; `pnpm test` (or targeted Jest tests). Build with `pnpm build` if deployment-related.
- Verify UI/logic locally via `pnpm dev` when relevant.
- Document changes: update relevant docs/README if behavior changes.
- Git: review `git status`/`git diff`, commit with message, push branch as requested.
- Spec workflow: if implementing tasks, update `.spec-workflow/specs/{spec}/tasks.md` statuses and log implementations via `log-implementation` tool.