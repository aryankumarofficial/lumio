import {createVerification, findValidVerification} from "./verification.repository.js";
import {VerifyAccountInput} from "./verifiaction.type.js";
import {and, db, eq, users, verification, VerificationType} from "@repo/db"
import {gt, isNull} from "drizzle-orm";
import {generateRandomToken, hashToken} from "../../lib/token.js";
import {resendVerificationEmail, sendVerificationEmail, sendWelcomeEmail} from "@repo/email"

export enum REQUEST_TYPE {
    ACCOUNT_CREATION,
    RESEND_VERIFICATION,
}

interface VerificationServiceProps {
    userId: string;
    type: REQUEST_TYPE;
}

export const sendAccountVerification = async ({userId, type}: VerificationServiceProps) => {
    try {
        const rawToken = generateRandomToken();
        const hashedToken = hashToken(rawToken);
        const {verification, user} = await createVerification({
            type: VerificationType.EMAIL_VERIFICATION,
            userId: userId,
            token: hashedToken,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });

        if (!verification || !user) {
            throw new Error("Failed to create Verification");
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
    } catch (err) {
        throw new Error("Failed to send Verification Link", {
            cause: err
        })
    }
}

export const verifyAccount = async ({
                                        token,
                                    }: VerifyAccountInput) => {
    try {
        const dbToken = await findValidVerification({
            token,
            type: VerificationType.EMAIL_VERIFICATION,
        })

        if (!dbToken) {
            throw new Error("Invalid or expired token");
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
                throw new Error("Invalid or expired verification token");
            }
            const [user] = await tx
                .update(users)
                .set({
                    isVerified: true
                })
                .where(eq(users.id, dbToken.userId))
                .returning();
            if (!user) {
                throw new Error("User not found");
            }
            return user;
        })

        await sendWelcomeEmail({
            name: updatedUser?.name,
            email: updatedUser?.email,
        })

        return updatedUser;

    } catch (err) {
        throw new Error("Something went wrong while verifying the account!", {cause: err})
    }

}