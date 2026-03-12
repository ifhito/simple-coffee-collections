---
name: cmux-handoff-orchestrator
description: Use when a user asks to read work from another cmux surface/workspace and continue it. If the target task or target agent is unspecified, ask first. Then search across all candidate workspaces/surfaces (not limited to Claude/Codex), identify the right target from logs, ask user confirmation before continuing, then strictly extract/verify the plan and check post-plan execution before implementing.
---

# cmux Handoff Orchestrator

## When To Use

Use this skill when the user asks to:

- read logs from another terminal tab/workspace
- continue work that was done elsewhere
- attach to a running task in cmux
- recover plan and resume implementation

Do not assume the target is only Claude/Codex. Always search all relevant surfaces/workspaces.

## Required Workflow

Follow this sequence exactly.

0. Clarify missing targeting information before discovery.

- If the user did not specify what work/task to continue, ask briefly what kind of work you should look for.
- If the user did not specify which agent/session family to target, ask briefly which one to inspect first.
  - examples: `codex`, `Claude Code`, other named agents or terminal sessions
- If both are missing, ask both before reading logs broadly.
- Do not assume the target agent from titles alone when the user has not said so.
- If the user already specified both the task and the target agent, do not ask again.

1. Discover all candidates first.

```bash
cmux list-workspaces
cmux list-pane-surfaces --workspace <workspace-ref>
```

2. Read candidate logs broadly, then narrow down.

```bash
cmux read-screen --workspace <workspace-ref> --surface <surface-ref> --scrollback --lines 300
cmux read-screen --workspace <workspace-ref> --surface <surface-ref> --scrollback --lines 2000
```

3. Identify likely target by task evidence, not by tool name.

- prioritize concrete evidence: filenames, commands, error text, plan bullets, commit messages
- do not select target only from title text (e.g. "Claude Code")

4. Ask user confirmation before continuing.

After identifying the likely target, provide:

- target `workspace` and `surface`
- a short evidence summary
- concise question asking if this is the correct target

Do not continue implementation until user confirms.

5. Enforce plan-first resume.

Before coding:

- extract the plan from log text
- write it to `plan/<YYYY-MM-DD>-cmux-resume-plan.md`
- report extracted plan to user and confirm alignment

6. Verify post-plan execution.

After plan extraction, inspect later log sections and classify:

- already executed steps
- partially executed steps
- not started steps

Continue only from the first truly pending step. Avoid duplicate work.

7. Implement, verify, and report.

- implement pending tasks
- run tests/build relevant to touched area
- summarize what was resumed vs newly completed

## Command Reference

Detailed option notes are in:

- `references/cmux-options.md`

Use this file when you need exact option semantics for `read-screen`, `send`, `send-key`, and ID handling.

## Failure Handling

If cmux is unreachable:

- report socket/connect error
- ask user to confirm cmux is running and socket path
- retry with `--socket <path>` if provided

If logs are insufficient:

- increase `--lines`
- keep `--scrollback`
- read multiple candidate surfaces before deciding
