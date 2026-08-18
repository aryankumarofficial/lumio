import {NextFunction, Request, Response} from 'express'
import {db, users} from '@repo/db'
import {loginSchema, signupSchema} from '@repo/schemas'
import {hashPassword, verifyPassword} from '../../lib/password.js'
import {signToken} from '../../lib/jwt.js'
import {sendAccountVerification} from "../verification/verification.service.js";

export const signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = signupSchema.parse(req.body)

        const existing = await db.query.users.findFirst({
            where: (u, {eq}) => eq(u.email, body.email),
        })

        if (existing) {
            return res.status(409).json({error: 'Email already in use'})
        }

        const passwordHash = await hashPassword(body.password)

        const [user] = await db
            .insert(users)
            .values({name: body.name, email: body.email, passwordHash})
            .returning({id: users.id, name: users.name, email: users.email})

        if (!user) throw new Error('Failed to create user')

        await sendAccountVerification(user.id)
        return res.status(201).json({
            success: true,
            message: `Signup Success! verify your account to access the App.`
        })
    } catch (err) {
        next(err)
    }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = loginSchema.parse(req.body)

        const user = await db.query.users.findFirst({
            where: (u, {eq}) => eq(u.email, body.email),
        })

        if (!user) {
            return res.status(401).json({error: 'Invalid credentials'})
        }

        const valid = await verifyPassword(user.passwordHash, body.password)

        if (!valid) {
            return res.status(401).json({error: 'Invalid credentials'})

        }

        const isVerified = user.isVerified;
        if (!isVerified) {
            return res.status(400).json({error: 'Please verify your account to access the App'})
        }
        const token = signToken({userId: user.id, email: user.email})

        res
            .cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })
            .json({user: {id: user.id, name: user.name, email: user.email}})
    } catch (err) {
        next(err)
    }
}

export const logout = (_req: Request, res: Response) => {
    res.clearCookie('token').json({success: true})
}

export const me = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token =
            req.cookies?.token ??
            req.headers.authorization?.replace('Bearer ', '')

        if (!token) {
            res.status(401).json({error: 'Not authenticated'})
            return
        }

        const {verifyToken} = await import('../../lib/jwt.js')
        const payload = verifyToken(token)

        const user = await db.query.users.findFirst({
            where: (u, {eq}) => eq(u.id, payload.userId),
            columns: {id: true, name: true, email: true, createdAt: true},
        })

        if (!user) {
            res.status(404).json({error: 'User not found'})
            return
        }

        res.json({user})
    } catch (err) {
        next(err)
    }
}

export const sendVerification = async (req: Request, res: Response, next: NextFunction) => {
    try {

    } catch (err) {
        next(err);
    }
}