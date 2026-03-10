# cmux Options Quick Reference

## Core Read Commands

```bash
cmux read-screen --workspace <workspace-ref> --surface <surface-ref> --scrollback --lines <n>
cmux capture-pane --workspace <workspace-ref> --surface <surface-ref> --scrollback --lines <n>
```

`capture-pane` is a tmux-compatible alias of `read-screen`.

## `read-screen` Options

- `--workspace <id|ref>`
  - target workspace (example: `workspace:1`)
- `--surface <id|ref>`
  - target tab/surface (example: `surface:2`)
- `--scrollback`
  - include scrollback history, not just visible viewport
- `--lines <n>`
  - max lines to return

## Discovery Commands

```bash
cmux list-workspaces
cmux list-pane-surfaces --workspace <workspace-ref>
cmux identify --workspace <workspace-ref> --surface <surface-ref>
```

## Send Commands

```bash
cmux send --workspace <workspace-ref> --surface <surface-ref> "git status"
cmux send-key --workspace <workspace-ref> --surface <surface-ref> Enter
```

## Useful Global Options

- `--json`
  - JSON output for scripted parsing
- `--id-format refs|uuids|both`
  - controls ID format in output
- `--socket <path>`
  - explicitly set socket path if default `/tmp/cmux.sock` is wrong
- `--password <value>`
  - socket auth password when required

## Typical Errors

- `Failed to connect to socket at /tmp/cmux.sock`
  - cmux not running or different socket path
- reads from wrong tab
  - wrong `surface`; re-check with `list-pane-surfaces`
