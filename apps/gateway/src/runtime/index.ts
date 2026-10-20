import type { CoreRequest, CoreResponse } from '@vani/shared'
import { env } from '../env'
import { localRuntime } from './local'
import { maritimeRuntime } from './maritime'

/** Where a family's core runs. Both speak Maritime's `POST /chat` contract. */
export interface CoreRuntime {
  /** Get-or-create the family's core. Idempotent. Returns the agent id to send to. */
  provision(familyId: string): Promise<string>
  send(agentId: string, req: CoreRequest): Promise<CoreResponse>
}

export const runtime: CoreRuntime = env.CORE_RUNTIME === 'maritime' ? maritimeRuntime() : localRuntime()
