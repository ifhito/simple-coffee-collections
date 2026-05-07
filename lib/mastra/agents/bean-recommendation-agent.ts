import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { Agent } from '@mastra/core/agent'
import type { AgentConfig } from '@mastra/core/agent'
import { BeanRecommendationOutputSchema } from '../tools/bean-recommendation-tool'

function loadSystemPrompt(): string {
  return readFileSync(join(process.cwd(), 'lib/mastra/prompts/bean-recommendation.md'), 'utf-8')
}

type AgentModel = AgentConfig['model']

export function createBeanRecommendationAgent(model: AgentModel): Agent {
  return new Agent({
    id: 'bean-recommendation-agent',
    name: 'bean-recommendation-agent',
    instructions: loadSystemPrompt(),
    model,
  })
}

export { BeanRecommendationOutputSchema }
