import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { cors } from 'hono/cors'
import fileRoute from './routes/fileRoute'
import { UPLOAD_ROOT } from './services/storage'

const app = new Hono()
const PORT = Number(process.env.PORT || 3000)

app.use(
  '*',
  cors({
    origin: '*', 
    allowHeaders: ['Content-Type', 'x-admin-key'],
    allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
)

app.use(
  '/uploads/*',
  async (c, next) => {
    await next()
    if (c.req.path.toLowerCase().endsWith('.pdf')) {
      c.res.headers.set('Content-Type', 'application/pdf')
      c.res.headers.set('Content-Disposition', 'inline')
    }
  },
  serveStatic({
    root: './',
    rewriteRequestPath: (path) => path,
  }),
)

app.route('/api', fileRoute)

console.log(`🚀 Bun+Hono backend running on port ${PORT}`)
console.log(`📁 Upload root: ${UPLOAD_ROOT}`)

export default {
  port: PORT,
  fetch: app.fetch,
}
