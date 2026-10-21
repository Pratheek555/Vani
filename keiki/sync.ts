// Pushes Vani's agent definition to Keiki (partner deployments API).
//   pnpm keiki:print   print the config (to paste into the dashboard instead)
//   pnpm keiki:sync    create/update the agent with externalRef "vani"
import { readFileSync } from 'node:fs'
import { z } from 'zod'
import { createCloudClient, type CloudAgentConfig } from '@onkeiki/agents/cloud'
import { gatewayTools, tools } from '@vani/shared'

try {
  process.loadEnvFile()
} catch {}

const print = process.argv.includes('--print')
const env = z
  .object({
    PUBLIC_URL: z.url(),
    KEIKI_WEBHOOK_SECRET: z.string().min(16),
    KEIKI_API_KEY: print ? z.string().optional() : z.string().min(1),
    KEIKI_MODEL: z.string().min(1),
  })
  .parse(process.env)

const config: CloudAgentConfig = {
  externalRef: 'vani',
  agent: {
    name: 'Vani',
    model: env.KEIKI_MODEL,
    system_prompt: readFileSync(new URL('./system-prompt.md', import.meta.url), 'utf8'),
    // Stopping condition: a confused model gives up instead of looping on tools.
    max_steps: 6,
  },
  tools: Object.entries({ ...gatewayTools, ...tools }).map(([name, tool]) => ({
    name,
    description: tool.description,
    inputSchema: z.toJSONSchema(tool.input) as Record<string, unknown>,
    executionType: 'webhook',
    webhookUrl: `${env.PUBLIC_URL}/keiki/tools/${name}`,
  })),
  identity: { webhook_url: `${env.PUBLIC_URL}/keiki/identity`, secret: env.KEIKI_WEBHOOK_SECRET },
}

if (print) {
  console.log(JSON.stringify({ ...config, identity: { ...config.identity, secret: '<KEIKI_WEBHOOK_SECRET>' } }, null, 2))
} else {
  const deployment = await createCloudClient({ apiKey: env.KEIKI_API_KEY! }).sync(config)
  console.log(JSON.stringify(deployment, null, 2))
}
