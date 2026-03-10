import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { Agent } from '@mastra/core/agent'
import type { AgentConfig } from '@mastra/core/agent'
import { CoffeeOcrOutputSchema, ROAST_LEVEL_VALUES } from '../tools/coffee-ocr-tool'

function loadSystemPrompt(): string {
  const raw = readFileSync(
    join(process.cwd(), 'lib/mastra/prompts/coffee-ocr.md'),
    'utf-8'
  )
  return raw.replace('{{ROAST_LEVEL_GUIDE}}', ROAST_LEVEL_VALUES.join(', '))
}

type AgentModel = AgentConfig['model']

export function createCoffeeOcrAgent(model: AgentModel): Agent {
  return new Agent({
    id: 'coffee-ocr-agent',
    name: 'coffee-ocr-agent',
    instructions: loadSystemPrompt(),
    model,
  })
}

export { CoffeeOcrOutputSchema }
