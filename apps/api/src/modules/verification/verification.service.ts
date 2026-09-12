import {
    checkUserStatusByVerificationToken,
    createVerification,
    findValidVerification,
    StatusType
} from "./verification.repository.js";
import {VerifyAccountInput} from "./verifiaction.type.js";
import {and, db, eq, User, users, verification, VerificationType, gt, isNull} from "@repo/db"
import {generateRandomToken, hashToken} from "../../lib/token.js";
import {resendVerificationEmail, sendVerificationEmail, sendWelcomeEmail} from "@repo/email"
import {AppError} from "../../lib/errors/app-error.js";

export enum REQUEST_TYPE {
    ACCOUNT_CREATION,
    RESEND_VERIFICATION,
}

interface VerificationServiceProps {
    userId: string;
    type: REQUEST_TYPE;
}

export const sendAccountVerification = async ({userId, type}: VerificationServiceProps) => {
    const rawToken = generateRandomToken();
    const hashedToken = hashToken(rawToken);
    const {verification, user} = await createVerification({
        type: VerificationType.EMAIL_VERIFICATION,
        userId: userId,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    if (!verification || !user) {
        throw new AppError(
            'Invalid or expired verification link',
            400,
            'VERIFICATION_TOKEN_INVALID',
        )
    }

    const verificationUrl = `${process.env.CLIENT_URL}/verify?token=${encodeURIComponent(rawToken)}`;
    if (type === REQUEST_TYPE.ACCOUNT_CREATION) {
        await sendVerificationEmail({
            name: user.name,
            email: user.email,
            link: verificationUrl,
        });
    } else if (type === REQUEST_TYPE.RESEND_VERIFICATION) {
        await resendVerificationEmail({
            email: user.email,
            name: user.name,
            link: verificationUrl,
        })
    }
}


export type VerifyAccountResponse =
    | { status: StatusType }
    | { user: User }


export const verifyAccount = async ({
                                        token,
                                    }: VerifyAccountInput): Promise<VerifyAccountResponse> => {

    const {status} = await checkUserStatusByVerificationToken(token);
    if (status === StatusType.ACCOUNT_ALREADY_VERIFIED) {
        return {
            status: StatusType.ACCOUNT_ALREADY_VERIFIED,
        }
    }

    const dbToken = await findValidVerification({
        token,
        type: VerificationType.EMAIL_VERIFICATION,
    })

    if (!dbToken) {
        throw new AppError(
            'Invalid or expired verification link',
            400,
            'VERIFICATION_TOKEN_INVALID',
        )
    }


    const updatedUser = await db.transaction(async (tx) => {
        const result = await tx
            .update(verification)
            .set({
                usedAt: new Date()
            })
            .where(
                and(
                    eq(verification.id, dbToken.id),
                    isNull(verification.usedAt),
                    gt(verification.expiresAt, new Date())
                ))
            .returning();
        if (result.length === 0) {
            throw new AppError(
                'Invalid or expired verification link',
                400,
                'VERIFICATION_TOKEN_INVALID',
            )
        }
        const [user] = await tx
            .update(users)
            .set({
                isVerified: true
            })
            .where(eq(users.id, dbToken.userId))
            .returning();
        if (!user) {
            throw new AppError(
                'User not found',
                404,
                'USER_NOT_FOUND',
            )
        }
        return user;
    })

    await sendWelcomeEmail({
        name: updatedUser?.name,
        email: updatedUser?.email,
    })

    return {user: updatedUser};


}