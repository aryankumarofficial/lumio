import {db, eq, NewVerification, verification} from "@repo/db";
import {ValidVerificationInput} from "./verifiaction.type.js";
import {gt, isNull} from "drizzle-orm";
import {hashToken} from "../../lib/token.js";

export const createVerification = async (input: NewVerification) => {
    const [record] = await db.insert(verification).values(input).returning();
    return record;
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