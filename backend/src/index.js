import express from 'express'
import cors from 'cors'
import fileUpload from 'express-fileupload'
import { UPLOAD_ROOT } from './services/storage.js'
import router from './routes/file_Route.js'

const app = express()
const PORT = Number(process.env.PORT || 3000)

app.set('trust proxy', 1)
app.use(express.json())
app.use(
  cors({
    origin: true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'x-admin-key'],
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  }),
)

app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    abortOnLimit: true,
  }),
)

app.use(
  '/uploads',
  express.static(UPLOAD_ROOT, {
    setHeaders: (res, filePath) => {
      if (String(filePath).toLowerCase().endsWith('.pdf')) {
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', 'inline')
      }
    },
  }),
)

app.use('/', router)

app.listen(PORT, () => {
  console.log(`✅ Backend beží na: http://localhost:${PORT}`)
  console.log(`📁 Upload root: ${UPLOAD_ROOT}`)
})
