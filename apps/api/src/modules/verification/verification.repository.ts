import {db, eq, NewVerification, verification} from "@repo/db";
import {ValidVerificationInput} from "./verifiaction.type.js";

export const createVerification = async (input: NewVerification) => {
    const [record] = await db.insert(verification).values(input).returning();
    return record;
}

export const findValidVerification = async (filter: ValidVerificationInput) => {
    return await db.query.verification.findFirst({
        where: (verification, {and, eq, gte, isNotNull}) => and(
            eq(verification.token, filter.token),
            eq(verification.type, filter.type),
            gte(verification.expiresAt, new Date()),
            isNotNull(verification.usedAt)
        )
        ,
        orderBy: (verification, {desc}) => desc(verification.updatedAt),

    });
}

export const invalidateVerification = async (id: string) => {
    const [record] = await db.update(verification).set({
        ...verification,
        usedAt: new Date(),
        updatedAt: new Date()
    }).where(eq(verification.id, id)).returning();
    return record;
}