import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { authRoutes } from './modules/auth/auth.routes.js'
import { notesRoutes } from './modules/notes/notes.routes.js'
import { sharedRoutes } from './modules/shared/shared.routes.js'
import { insightsRoutes } from './modules/insights/insights.routes.js'
import { errorHandler } from './middleware/error.js'

const app = express()

app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        credentials: true,
    }),
)

app.use(express.json())
app.use(cookieParser())

app.use('/auth', authRoutes)
app.use('/notes', notesRoutes)
app.use('/shared', sharedRoutes)
app.use('/insights', insightsRoutes)

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

app.use(errorHandler)

const port = process.env.PORT || 4000

app.listen(port, () => {
    console.log(`API server running on port ${port}`)
})
