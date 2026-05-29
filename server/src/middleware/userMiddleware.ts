import type { Context, Next } from 'hono'

const ADMIN_KEY = process.env.ADMIN_KEY || '1234'

export const requireAdmin = async (c: Context, next: Next) => {
  const key = c.req.header('x-admin-key')
  if (!key || key !== ADMIN_KEY) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  await next()
}
