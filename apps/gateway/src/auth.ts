import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { eq } from 'drizzle-orm'
import { Hono, type Context, type MiddlewareHandler } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { z } from 'zod'
import { db } from './db/client'
import { accounts, sessions, type Account } from './db/schema'
import { env } from './env'
import { hashToken, newId } from './families'

const scryptAsync = promisify(scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>
const COOKIE = 'vani_session'
const SESSION_DAYS = 30

async function hashPassword(password: string) {
  const salt = randomBytes(16)
  return `${salt.toString('hex')}:${(await scryptAsync(password, salt, 64)).toString('hex')}`
}

async function checkPassword(password: string, stored: string) {
  const [salt = '', hash = ''] = stored.split(':')
  const got = await scryptAsync(password, Buffer.from(salt, 'hex'), 64)
  return timingSafeEqual(got, Buffer.from(hash, 'hex'))
}

async function startSession(c: Context, accountId: string) {
  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000)
  await db.insert(sessions).values({ tokenHash: hashToken(token), accountId, expiresAt })
  setCookie(c, COOKIE, token, {
    httpOnly: true,
    sameSite: 'Lax',
    secure: env.PUBLIC_URL.startsWith('https://'),
    path: '/',
    expires: expiresAt,
  })
}

export async function currentAccount(c: Context): Promise<Account | null> {
  const token = getCookie(c, COOKIE)
  if (!token) return null
  const session = await db.query.sessions.findFirst({ where: eq(sessions.tokenHash, hashToken(token)) })
  if (!session || session.expiresAt < new Date()) return null
  return (await db.query.accounts.findFirst({ where: eq(accounts.id, session.accountId) })) ?? null
}

export const requireAccount: MiddlewareHandler<{ Variables: { account: Account } }> = async (c, next) => {
  const account = await currentAccount(c)
  if (!account) return c.json({ error: 'Please log in.' }, 401)
  c.set('account', account)
  await next()
}

const Credentials = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(200),
})

export const auth = new Hono()

auth.post('/signup', async (c) => {
  const parsed = Credentials.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) return c.json({ error: z.prettifyError(parsed.error) }, 400)
  const { email, password } = parsed.data
  if (await db.query.accounts.findFirst({ where: eq(accounts.email, email) }))
    return c.json({ error: 'An account with that email already exists. Log in instead.' }, 409)

  const id = newId('acc')
  await db.insert(accounts).values({ id, email, passwordHash: await hashPassword(password), createdAt: new Date() })
  await startSession(c, id)
  return c.json({ ok: true, email })
})

auth.post('/login', async (c) => {
  const parsed = Credentials.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) return c.json({ error: 'Wrong email or password.' }, 400)
  const account = await db.query.accounts.findFirst({ where: eq(accounts.email, parsed.data.email) })
  if (!account || !(await checkPassword(parsed.data.password, account.passwordHash)))
    return c.json({ error: 'Wrong email or password.' }, 401)
  await startSession(c, account.id)
  return c.json({ ok: true, email: account.email })
})

auth.post('/logout', async (c) => {
  const token = getCookie(c, COOKIE)
  if (token) await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)))
  deleteCookie(c, COOKIE, { path: '/' })
  return c.json({ ok: true })
})

auth.get('/me', async (c) => {
  const account = await currentAccount(c)
  return account ? c.json({ email: account.email }) : c.json({ error: 'Not logged in.' }, 401)
})
