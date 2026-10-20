import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { ChatBody, CoreRequest, type CoreResponse } from '@vani/shared'
import { dbFor } from './db/client'
import { env } from './env'
import { runTool } from './tools'
import { syncFamily } from './tools/family'

async function handle(req: CoreRequest): Promise<CoreResponse> {
  const familyId = req.kind === 'tool' ? req.caller.familyId : req.family.id
  if (env.FAMILY_ID && env.FAMILY_ID !== familyId) {
    return { ok: false, summary: 'This request is for a different family.' }
  }
  const db = await dbFor(familyId)
  switch (req.kind) {
    case 'sync_family':
      return syncFamily(db, req.family)
    case 'tool':
      return runTool(db, req.tool, req.input, req.caller)
  }
}

const app = new Hono()
app.get('/health', (c) => c.json({ ok: true }))
// Cron entries Maritime fires as `POST /chat` with source "scheduled". None yet.
app.get('/schedules', (c) => c.json([]))

/** Maritime's chat contract: `{ message, source }` in, `{ response }` out within 30s. */
app.post('/chat', async (c) => {
  const { message, source } = ChatBody.parse(await c.req.json())
  if (source === 'scheduled') return c.json({ response: 'ok' })

  let result: CoreResponse
  try {
    const req = CoreRequest.safeParse(JSON.parse(message))
    result = req.success ? await handle(req.data) : { ok: false, summary: 'Malformed core request.' }
  } catch (err) {
    console.error('[core] /chat', err)
    result = { ok: false, summary: 'Something went wrong on our side. Try again in a minute.' }
  }
  return c.json({ response: JSON.stringify(result) })
})

serve({ fetch: app.fetch, hostname: '0.0.0.0', port: env.PORT }, ({ port }) =>
  console.log(`[core] listening on :${port} (${env.FAMILY_ID ? `family ${env.FAMILY_ID}` : 'local, all families'})`),
)
