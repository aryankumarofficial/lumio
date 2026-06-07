import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index.js";

const databaseConnectionString = process.env.DATABASE_URL || process.env.DATABASE_URL_FALLBACK;
console.log("Using database connection string:", databaseConnectionString);
if (!databaseConnectionString) {
    throw new Error("Missing database connection string");
}

const queryClient = postgres(databaseConnectionString, { prepare: false });

export const db = drizzle(queryClient, { schema });

export type Database = typeof db;
export * from "./schema/index.js"
export { eq, and, ilike, desc, or, gte, sql, count, sum } from 'drizzle-orm'