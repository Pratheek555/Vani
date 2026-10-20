import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { migrateDb } from './db/client'
import { env } from './env'
import { keiki } from './keiki'
import { auth, currentAccount } from './auth'
import { loginPage, setupPage } from './pages'
import { signup } from './signup'

await migrateDb()

const app = new Hono()
app.get('/health', (c) => c.json({ ok: true }))
app.get('/login', async (c) => ((await currentAccount(c)) ? c.redirect('/') : c.html(loginPage)))
app.get('/', async (c) => {
  const account = await currentAccount(c)
  return account ? c.html(setupPage(account.email)) : c.redirect('/login')
})
app.route('/api/auth', auth)
app.route('/api', signup)
app.route('/keiki', keiki)
app.onError((err, c) => {
  console.error(`[gateway] ${c.req.method} ${c.req.path}`, err)
  return c.json({ ok: false, summary: 'Something went wrong on our side. Try again in a minute.' }, 500)
})

serve({ fetch: app.fetch, hostname: '0.0.0.0', port: env.PORT }, ({ port }) =>
  console.log(`[gateway] listening on :${port} (core runtime: ${env.CORE_RUNTIME})`),
)
