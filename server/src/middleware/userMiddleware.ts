import type { Context, Next } from 'hono'

const ADMIN_KEY = process.env.ADMIN_KEY || '1234'

export const requireAdmin = async (c: Context, next: Next) => {
  const key = c.req.header('x-admin-key')

  console.log('🔑 RECEIVED:', key)
  console.log('🔐 EXPECTED:', ADMIN_KEY)

  if (!key) {
    return c.text('Missing key', 401)
  }

  if (key !== ADMIN_KEY) {
    return c.text('Unauthorized', 401)
  }

  await next()
}