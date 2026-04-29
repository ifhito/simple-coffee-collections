import * as fs from 'node:fs'
import * as path from 'node:path'

const MIGRATIONS_DIR = path.resolve(__dirname, '..', '..', '..', 'supabase', 'migrations')

describe('Supabase migration filenames', () => {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    it.skip('no migrations directory', () => undefined)
    return
  }

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))

  const timestamps = new Map<string, string[]>()
  for (const f of files) {
    const ts = f.split('_')[0]
    if (!timestamps.has(ts)) timestamps.set(ts, [])
    timestamps.get(ts)!.push(f)
  }

  it('have unique 14-digit timestamp prefixes', () => {
    const violations: string[] = []
    for (const f of files) {
      const ts = f.split('_')[0]
      if (!/^\d{14}$/.test(ts)) {
        violations.push(`${f}: prefix "${ts}" is not 14 digits`)
      }
    }
    expect(violations).toEqual([])
  })

  it('have no duplicate timestamps', () => {
    const dups = Array.from(timestamps.entries())
      .filter(([, fs]) => fs.length > 1)
      .map(([ts, fs]) => `${ts}: ${fs.join(', ')}`)
    expect(dups).toEqual([])
  })
})
