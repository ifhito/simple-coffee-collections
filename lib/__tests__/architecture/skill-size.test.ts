import * as fs from 'node:fs'
import * as path from 'node:path'

const SKILLS_DIR = path.resolve(__dirname, '..', '..', '..', '.agents', 'skills')

// Hard ceiling per spec ("SKILL.md 本体は 200 行以内、詳細は references/ へ").
// Soft target is ~100 lines; existing legacy SKILL (cmux-handoff-orchestrator)
// is grandfathered until refactored separately.
const MAX_LINES = 200
const MAX_PROCEDURE_STEPS = 8

function listSkills(): { name: string; file: string }[] {
  if (!fs.existsSync(SKILLS_DIR)) return []
  return fs
    .readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => ({
      name: e.name,
      file: path.join(SKILLS_DIR, e.name, 'SKILL.md'),
    }))
    .filter((s) => fs.existsSync(s.file))
}

describe('SKILL constraints (1 SKILL = 1 job)', () => {
  const skills = listSkills()

  if (skills.length === 0) {
    it.skip('no skills found', () => undefined)
    return
  }

  for (const { name, file } of skills) {
    describe(`.agents/skills/${name}/SKILL.md`, () => {
      const content = fs.readFileSync(file, 'utf-8')

      it(`is at most ${MAX_LINES} lines (excl. references/)`, () => {
        const lines = content.split('\n').length
        if (lines > MAX_LINES) {
          throw new Error(
            `SKILL.md is ${lines} lines (limit ${MAX_LINES}). Move detail to references/${name}.md.`
          )
        }
      })

      it(`Procedure section has at most ${MAX_PROCEDURE_STEPS} numbered steps`, () => {
        const procedureBlock = content.match(
          /^## Procedure\s*\n([\s\S]+?)(?=^## |\Z)/m
        )
        if (!procedureBlock) return
        const steps = procedureBlock[1].match(/^\d+\.\s/gm) ?? []
        if (steps.length > MAX_PROCEDURE_STEPS) {
          throw new Error(
            `Procedure has ${steps.length} steps (limit ${MAX_PROCEDURE_STEPS}). Split into multiple SKILLs (1 SKILL = 1 job).`
          )
        }
      })
    })
  }
})
