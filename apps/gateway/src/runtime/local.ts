import { parseCoreReply } from '@vani/shared'
import { env } from '../env'
import type { CoreRuntime } from './index'

/** One core process for every family; it keeps a separate SQLite file per family. */
export function localRuntime(): CoreRuntime {
  return {
    async provision() {
      return 'local'
    },
    async send(_agentId, req) {
      const res = await fetch(`${env.LOCAL_CORE_URL}/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: JSON.stringify(req), source: 'gateway' }),
        signal: AbortSignal.timeout(30_000),
      })
      if (!res.ok) throw new Error(`local core: HTTP ${res.status}`)
      const { response } = (await res.json()) as { response: string }
      return parseCoreReply(response)
    },
  }
}
