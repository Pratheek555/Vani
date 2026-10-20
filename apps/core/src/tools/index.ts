import { z } from 'zod'
import { tools, type Caller, type CoreResponse, type ToolName } from '@vani/shared'
import type { FamilyDb } from '../db/client'
import { getFamily } from './family'

type Impl<T extends ToolName> = (
  db: FamilyDb,
  input: z.infer<(typeof tools)[T]['input']>,
  caller: Caller,
) => Promise<CoreResponse>

const impls: { [T in ToolName]: Impl<T> } = {
  get_family: getFamily,
}

export async function runTool(db: FamilyDb, name: string, rawInput: unknown, caller: Caller): Promise<CoreResponse> {
  if (!Object.hasOwn(impls, name)) return { ok: false, summary: `Unknown tool ${name}.` }
  const tool = name as ToolName
  const input = tools[tool].input.safeParse(rawInput)
  if (!input.success) return { ok: false, summary: `Bad input for ${tool}: ${z.prettifyError(input.error)}` }
  return impls[tool](db, input.data, caller)
}
