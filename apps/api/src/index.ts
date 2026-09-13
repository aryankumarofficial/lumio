import express, {Express} from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import {authRoutes} from './modules/auth/auth.routes.js'
import {notesRoutes} from './modules/notes/notes.routes.js'
import {sharedRoutes} from './modules/shared/shared.routes.js'
import {insightsRoutes} from './modules/insights/insights.routes.js'
import {errorHandler} from './middleware/error.js'
import {verificationRoutes} from "./modules/verification/verification.route.js";
import {checkDatabase} from "@repo/db";

import {httpServerHandler} from "cloudflare:node";

const app: Express = express()

app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        credentials: true,
    }),
)

app.use(express.json())
app.use(cookieParser())

app.use((req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - start;

        console.log(
            `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`,
        );
    });

    next();
});

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

app.get('/health', async (_req, res) => {
    try {
        await checkDatabase();
        return res.status(200).json({
            status: 'UP',
            timestamp: new Date().toISOString(),
            database: 'connected'
        });
    } catch (err) {
        console.error(`Failed to connect Database: `, err);
        return res
            .status(503)
            .json({
                status: 'DOWN',
                timestamp: new Date().toISOString(),
                error: 'Database connection failed'
            })
    }
})

app.use(errorHandler)

console.log(`env from root: ${process.env.PORT} ${Number(process.env.PORT)} ${Number(process.env.PORT || 8080)}`)


app.listen(3000, () => {
    console.log(`API server running on port ${3000}`)
})

export default httpServerHandler({
    port: 3000
});
