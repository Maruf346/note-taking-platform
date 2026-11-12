import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { databaseMiddleware } from './config/database.js'
import { errorHandler, notFound } from './middleware/errors.js'
import { adminRouter } from './routes/adminRoutes.js'
import { authRouter } from './routes/authRoutes.js'
import { noteRouter } from './routes/noteRoutes.js'
import { postRouter, userPostRouter } from './routes/postRoutes.js'

const app = express()
app.set('trust proxy', 1)
app.disable('x-powered-by')
app.use(helmet())

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map((origin) => origin.trim())
app.use(cors({ origin(origin, callback) { if (!origin || allowedOrigins.includes(origin)) return callback(null, true); return callback(new Error('Origin is not allowed by CORS')) } }))
app.use(express.json({ limit: '32kb' }))

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 500, standardHeaders: 'draft-8', legacyHeaders: false })
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false })

app.get('/', (_request, response) => response.json({ name: 'Noted API', documentation: '/api/health' }))
app.get('/api/health', (_request, response) => response.json({ status: 'ok', timestamp: new Date().toISOString() }))
app.use('/api', apiLimiter, databaseMiddleware)
app.use('/api/auth', authLimiter, authRouter)
app.use('/api/notes', noteRouter)
app.use('/api/posts', postRouter)
app.use('/api/users', userPostRouter)
app.use('/api/admin', adminRouter)
app.use(notFound)
app.use(errorHandler)

export default app
