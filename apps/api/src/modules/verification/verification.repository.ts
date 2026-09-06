import {db, NewVerification, users, verification} from "@repo/db";
import {ValidVerificationInput} from "./verifiaction.type.js";
import {gt, eq, isNull} from "drizzle-orm";
import {hashToken} from "../../lib/token.js";
import {email} from "zod/v4";

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
        where: (verification, {and, eq, gte, isNotNull}) => and(
            eq(verification.token, hashedToken),
            eq(verification.type, filter.type),
            gt(verification.expiresAt, new Date()),
            isNull(verification.usedAt)
        )
        ,
        orderBy: (verification, {desc}) => desc(verification.updatedAt),

    });
}