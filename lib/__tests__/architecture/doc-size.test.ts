import * as fs from 'node:fs'
import * as path from 'node:path'

const ROOT = path.resolve(__dirname, '..', '..', '..')

const LIMITS = [
  { file: 'AGENTS.md', max: 120 },
  { file: 'CLAUDE.md', max: 30 },
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
