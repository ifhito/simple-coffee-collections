/**
 * Fetches available model IDs from an OpenAI-compatible /models endpoint.
 * Returns empty array on failure (graceful degradation).
 */
export async function fetchModelList(
  baseUrl: string,
  apiKey: string,
  providerTemplate?: string | null
): Promise<string[]> {
  try {
    // Normalize base URL (remove trailing slash)
    const normalizedBase = baseUrl.replace(/\/$/, '')
    let url = `${normalizedBase}/models`

    // OpenRouter supports filtering by capability
    if (providerTemplate === 'openrouter') {
      url += '?supported_parameters=vision'
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10_000),
    })

    if (!response.ok) return []

    const json = await response.json()
    const data: Array<{ id: string }> = json?.data ?? []
    return data.map((m) => m.id).filter(Boolean)
  } catch {
    return []
  }
}
