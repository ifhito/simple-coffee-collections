import * as fs from 'node:fs'
import * as path from 'node:path'

const ROOT = path.resolve(__dirname, '..', '..', '..')

// CLAUDE.md is the SSoT (auto-loaded by Claude Code). AGENTS.md is a thin
// wrapper containing only `@CLAUDE.md` for tools that read AGENTS.md by
// convention (e.g., Codex). Limits reflect that role split.
const LIMITS = [
  { file: 'CLAUDE.md', max: 120 },
  { file: 'AGENTS.md', max: 30 },
] as const

describe('Doc size limits (anti "lost in instructions")', () => {
  for (const { file, max } of LIMITS) {
    it(`${file} is at most ${max} lines`, () => {
      const filePath = path.join(ROOT, file)
      if (!fs.existsSync(filePath)) {
        // Documenting limit even when file is missing should not block.
        return
      }
      const content = fs.readFileSync(filePath, 'utf-8')
      const lines = content.split('\n').length
      if (lines > max) {
        throw new Error(
          `${file} is ${lines} lines (limit ${max}). Refactor: extract verbose sections to @docs/... and reference them.`
        )
      }
    })
  }
})
