import {db, NewVerification, users, verification} from "@repo/db";
import {ValidVerificationInput} from "./verifiaction.type.js";
import {gt, eq, isNull} from "drizzle-orm";
import {hashToken} from "../../lib/token.js";

export enum StatusType {
    INVALID_LINK = "INVALID_LINK",
    ACCOUNT_ALREADY_VERIFIED = "ACCOUNT_ALREADY_VERIFIED",
    NEED_TO_VERIFY = "NEED_TO_VERIFY",
    INVALID_USER = "INVALID_USER",
}

export interface UserStatusResponse {
    status: StatusType
}

export const createVerification = async (input: NewVerification) => {
    return await db.transaction(async (trx) => {
        const [verificationRecord] = await trx
            .insert(verification)
            .values(input)
            .returning()
        const [user] = await trx
            .select({
                userId: users.id,
                email: users.email,
                name: users.name
            })
            .from(users)
            .where(eq(users.id, verificationRecord!.userId))
            .limit(1)
        return {
            verification: verificationRecord,
            user,
        }
    })
}

export const findValidVerification = async (filter: ValidVerificationInput) => {
    const hashedToken = hashToken(filter.token);
    return await db.query.verification.findFirst({
        where: (verification, {and, eq}) => and(
            eq(verification.token, hashedToken),
            eq(verification.type, filter.type),
            gt(verification.expiresAt, new Date()),
            isNull(verification.usedAt)
        )
        ,
        orderBy: (verification, {desc}) => desc(verification.updatedAt),

    });
}

export const checkUserStatusByVerificationToken = async (token: string): Promise<UserStatusResponse> => {
    const hashedToken = hashToken(token);
    return await db
        .transaction(async (trx) => {

            const verificationRecord = await trx
                .query.verification.findFirst({
                    where: eq(verification.token, hashedToken)
                })
            if (!verificationRecord) {
                return {
                    status: StatusType.INVALID_LINK
                }
            }
            const [user] = await trx
                .select({
                    userId: users.id,
                    isVerified: users.isVerified,
                })
                .from(verification)
                .innerJoin(users, eq(verification.userId, users.id))
                .where(eq(verification.id, verificationRecord.id));

            if (!user) {
                return {
                    status: StatusType.INVALID_USER // or maybe USER_NOT_FOUND as const
                }
            }

            if (user.isVerified) {
                return {
                    status: StatusType.ACCOUNT_ALREADY_VERIFIED
                }
            }
            return {
                status: StatusType.NEED_TO_VERIFY
            }

        });


}
