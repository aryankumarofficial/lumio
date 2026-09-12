import "dotenv/config";
import {drizzle} from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index.js";
import {sql} from "drizzle-orm";

const databaseConnectionString = process.env.DATABASE_URL || process.env.DATABASE_URL_FALLBACK;
if (!databaseConnectionString) {
    throw new Error("Missing database connection string");
}

const queryClient = postgres(databaseConnectionString, {prepare: false});

export const db = drizzle(queryClient, {schema});

export type Database = typeof db;
export * from "./schema/index.js"
export * from 'drizzle-orm'

export async function checkDatabase() {
    await db.execute(sql`SELECT 1`);
}