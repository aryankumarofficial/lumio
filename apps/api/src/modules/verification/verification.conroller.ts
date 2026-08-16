import {NextFunction, Request, Response} from "express"
import {db, eq, users} from "@repo/db";
import {sendAccountVerification} from "./verification.service.js";

export const requestVerificationLinkController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {email}: { email: string } = req.body;
        if (!email) {
            return res.status(400).json({error: 'Email is required'})
        }
        // verify by email REGEX
        const isValidEmail = /[A-Za-z]/.test(email) // TODO: YET TO WRITE PROPER REGEX
        if (!isValidEmail) {
            return res.status(400).json({error: 'Invalid email address'})
        }
        const userExists = await db.query.users.findFirst({
            where: eq(users.email, email)
        })
        if (!userExists) {
            return res.status(200).json({
                success: true,
                message: 'If an account with this email exists a verification link will be send to the email'
            })
        }

        if (userExists.isVerified) {
            return res.status(200).json({
                success: true,
                message: `Account already verified`
            })
        }

        await sendAccountVerification({
            userId: userExists.id,
            email
        })

        return res.status(200).json({
            success: true,
            message: `If an account with this email exists a verification link will be sent to this email`
        })

    } catch (err) {
        next(err)
    }
}