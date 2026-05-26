import { Request, Response, NextFunction } from 'express'
import { verifyToken, JwtPayload } from '../lib/jwt'

export interface AuthRequest extends Request {
    user?: JwtPayload
}

export function authenticate(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
): void {
    const token =
        req.cookies?.token ??
        req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
        res.status(401).json({ error: 'Unauthorised' })
        return
    }

    try {
        req.user = verifyToken(token)
        next()
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' })
    }
}