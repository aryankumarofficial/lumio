import {config} from "dotenv";
import {fileURLToPath} from "url"
import {dirname, resolve} from "path"
import morgan from "morgan";
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import {authRoutes} from './modules/auth/auth.routes.js'
import {notesRoutes} from './modules/notes/notes.routes.js'
import {sharedRoutes} from './modules/shared/shared.routes.js'
import {insightsRoutes} from './modules/insights/insights.routes.js'
import {errorHandler} from './middleware/error.js'
import {verificationRoutes} from "./modules/verification/verification.route.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

config({
    path: resolve(__dirname, "..", '.env'),
    override: false
})

const app = express()

app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        credentials: true,
    }),
)

app.use(express.json())
app.use(cookieParser())

app.use(morgan("dev"));

app.use('/auth', authRoutes)
app.use('/notes', notesRoutes)
app.use('/shared', sharedRoutes)
app.use('/insights', insightsRoutes)
app.use("/verify", verificationRoutes);


app.get("/", (_req, res) => {
    res.json({
        name: "Lumio API",
        status: "ok",
        version: "1.0.0",
        health: "/health",
    });
});

app.get('/health', (_req, res) => res.json({status: 'ok'}))

app.use(errorHandler)

console.log(`env from root: ${process.env.PORT} ${Number(process.env.PORT)} ${Number(process.env.PORT || 8080)}`)

const port = Number(process.env.PORT || 4000)

app.listen(port, () => {
    console.log(`API server running on port ${port}`)
})
