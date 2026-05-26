import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { AIError } from '@repo/ai'

export function errorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
): void {
    // Zod validation errors
    if (err instanceof ZodError) {
        res.status(400).json({
            error: 'Validation failed',
            issues: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
        })
        return
    }

    // AI errors
    if (err instanceof AIError) {
        const status =
            err.code === 'RATE_LIMIT' ? 429 :
                err.code === 'CONTENT_TOO_LONG' ? 413 : 502
        res.status(status).json({ error: err.message, code: err.code })
        return
    }

    // Generic
    console.error('[API Error]', err)
    res.status(500).json({ error: 'Internal server error' })
}