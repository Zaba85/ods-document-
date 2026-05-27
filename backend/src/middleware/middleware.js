const ADMIN_KEY = process.env.ADMIN_KEY || '1234'

export const requireAdmin = (req, res, next) => {
  if (req.header('x-admin-key') !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
}
