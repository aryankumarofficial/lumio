import {pgEnum, pgTable, text, timestamp, uuid} from "drizzle-orm/pg-core";
import {users} from "./user.js";

export const VerificationType = {
    EMAIL_VERIFICATION: "email_verification",
    PASSWORD_RESET: "password_reset",
} as const;

export type VerificationType =
    (typeof VerificationType)[keyof typeof VerificationType];

export const verificationTypeEnum = pgEnum(
    "verification_type",
    Object.values(VerificationType) as [
        VerificationType,
        ...VerificationType[]
    ],
);

export const verification = pgTable("verifications", {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, {onDelete: "cascade"}),

    token: text("token").notNull(),

    type: verificationTypeEnum("type").notNull(),

    expiresAt: timestamp("expires_at", {
        withTimezone: true,
    }).notNull(),

    usedAt: timestamp("used_at", {
        withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
        withTimezone: true,
    })
        .notNull()
        .defaultNow(),

    updatedAt: timestamp("updated_at", {
        withTimezone: true,
    })
        .notNull()
        .defaultNow()
        .$onUpdateFn(() => new Date()),
});

export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;