import { lt } from 'drizzle-orm'
import { z } from 'zod'
import { tools, type Caller, type CoreResponse, type ToolDef, type ToolName } from '@vani/shared'
import type { FamilyDb } from '../db/client'
import { toolCalls } from '../db/schema'
import { getFamily } from './family'

type Impl<T extends ToolName> = (
  db: FamilyDb,
  input: z.infer<(typeof tools)[T]['input']>,
  caller: Caller,
) => Promise<CoreResponse>

const impls: { [T in ToolName]: Impl<T> } = {
  get_family: getFamily,
}

const REPLAY_DAYS = 7

async function execute(db: FamilyDb, name: string, rawInput: unknown, caller: Caller): Promise<CoreResponse> {
  if (!Object.hasOwn(impls, name)) return { ok: false, summary: `Unknown tool ${name}.` }
  const tool = name as ToolName
  const def: ToolDef = tools[tool]
  if (def.dmOnly && caller.conversationKind !== 'dm') {
    return { ok: false, summary: 'That has private details, so I only share it in a direct message. Offer to continue in a DM.' }
  }
  const input = tools[tool].input.safeParse(rawInput)
  if (!input.success) return { ok: false, summary: `Bad input for ${tool}: ${z.prettifyError(input.error)}` }
  return impls[tool](db, input.data, caller)
}

// Concurrent redeliveries of a call that's still running wait for the first one.
const inFlight = new Map<string, Promise<CoreResponse>>()

/**
 * Runs a tool once per idempotency key: a redelivered call gets the stored answer instead
 * of running again (no double orders). Calls that throw aren't stored, so a retry runs fresh.
 */
export async function runTool(
  db: FamilyDb,
  name: string,
  rawInput: unknown,
  caller: Caller,
  idempotencyKey: string | null,
): Promise<CoreResponse> {
  if (!idempotencyKey) return execute(db, name, rawInput, caller)

  const running = inFlight.get(idempotencyKey)
  if (running) return running
  const done = await db.query.toolCalls.findFirst({ where: (t, { eq }) => eq(t.key, idempotencyKey) })
  if (done) return JSON.parse(done.response) as CoreResponse

  const run = (async () => {
    const result = await execute(db, name, rawInput, caller)
    const now = new Date()
    await db
      .insert(toolCalls)
      .values({ key: idempotencyKey, tool: name, response: JSON.stringify(result), createdAt: now })
      .onConflictDoNothing()
    await db.delete(toolCalls).where(lt(toolCalls.createdAt, new Date(now.getTime() - REPLAY_DAYS * 86_400_000)))
    return result
  })()
  inFlight.set(idempotencyKey, run)
  try {
    return await run
  } finally {
    inFlight.delete(idempotencyKey)
  }
}
