import { Maritime } from 'maritime-sdk'
import { parseCoreReply } from '@vani/shared'
import { env } from '../env'
import type { CoreRuntime } from './index'

/** One Maritime agent (own VM, own /data) per family, running the core image. */
export function maritimeRuntime(): CoreRuntime {
  if (!env.MARITIME_API_KEY || !env.CORE_IMAGE) {
    throw new Error('CORE_RUNTIME=maritime needs MARITIME_API_KEY and CORE_IMAGE')
  }
  const maritime = new Maritime({ apiKey: env.MARITIME_API_KEY })
  const image = env.CORE_IMAGE

  return {
    async provision(familyId) {
      const agent = await maritime.agents.provision({
        externalId: familyId,
        name: `vani-${familyId.replaceAll('_', '-')}`,
        template: env.CORE_TEMPLATE,
        imageName: image,
        env: [{ key: 'FAMILY_ID', value: familyId, secret: false }],
        idleTtlSeconds: 900,
      })
      return agent.id
    },
    async send(agentId, req) {
      const { response, error } = await maritime.agents.chat(agentId, JSON.stringify(req))
      if (response == null) throw new Error(`maritime core ${agentId}: ${error ?? 'no response'}`)
      return parseCoreReply(response)
    },
  }
}
