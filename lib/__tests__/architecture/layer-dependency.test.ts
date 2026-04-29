import * as fs from 'node:fs'
import * as path from 'node:path'

const LIB_ROOT = path.resolve(__dirname, '..', '..')

type Rule = {
  layer: string
  forbiddenImportPatterns: RegExp[]
}

const RULES: Rule[] = [
  {
    layer: 'domain',
    forbiddenImportPatterns: [
      /from\s+['"]@\/lib\/infrastructure\b/,
      /from\s+['"]@\/lib\/actions\b/,
      /from\s+['"]next(\/|['"])/,
      /from\s+['"]react['"]/,
      /from\s+['"]@supabase\//,
    ],
  },
  {
    layer: 'application',
    forbiddenImportPatterns: [
      /from\s+['"]next(\/|['"])/,
      /from\s+['"]react['"]/,
      /from\s+['"]@supabase\//,
    ],
  },
]

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  const out: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === '__tests__' || entry.name === 'node_modules') continue
      out.push(...walk(full))
    } else if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)) {
      out.push(full)
    }
  }
  return out
}

describe('Clean Architecture layer boundaries', () => {
  for (const rule of RULES) {
    describe(`lib/${rule.layer}`, () => {
      const files = walk(path.join(LIB_ROOT, rule.layer))

      for (const file of files) {
        const rel = path.relative(LIB_ROOT, file)
        it(`${rel} obeys forbidden-import rules`, () => {
          const src = fs.readFileSync(file, 'utf8')
          const violations = rule.forbiddenImportPatterns
            .filter((re) => re.test(src))
            .map((re) => re.source)
          expect(violations).toEqual([])
        })
      }
    })
  }
})
