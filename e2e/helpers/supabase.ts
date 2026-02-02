import { readFileSync } from 'fs'
import { resolve } from 'path'
import type { APIRequestContext } from '@playwright/test'

type SupabaseConfig = {
  url: string
  anonKey: string
}

function parseEnvFile(path: string): Record<string, string> {
  try {
    const content = readFileSync(path, 'utf-8')
    const env: Record<string, string> = {}

    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const index = trimmed.indexOf('=')
      if (index === -1) continue
      const key = trimmed.slice(0, index).trim()
      let value = trimmed.slice(index + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      env[key] = value
    }

    return env
  } catch {
    return {}
  }
}

export function getSupabaseConfig(): SupabaseConfig {
  const env = parseEnvFile(resolve(process.cwd(), '.env.local'))
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('Missing Supabase config in env or .env.local')
  }

  return { url, anonKey }
}

export async function createTestUser(
  request: APIRequestContext,
  email: string,
  password: string
) {
  const { url, anonKey } = getSupabaseConfig()

  const response = await request.post(`${url}/auth/v1/signup`, {
    data: { email, password },
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
    },
  })

  if (response.ok()) {
    return
  }

  const body = await response.json().catch(() => ({}))
  const message =
    body?.msg ??
    body?.error_description ??
    body?.message ??
    response.statusText() ??
    ''

  if (
    typeof message === 'string' &&
    (message.includes('already') || message.includes('registered'))
  ) {
    return
  }

  throw new Error(`Failed to create test user: ${message}`)
}
