import {drizzle} from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index.js";
import {sql} from "drizzle-orm";
import {AsyncLocalStorage} from "node:async_hooks"

export function createDb(connectionString: string) {
    const queryClient = postgres(connectionString, {
        max: 5,
        fetch_types: false,
        prepare: true,
    });

    return drizzle(queryClient, {schema});
}

export type Database = ReturnType<typeof createDb>;

const dbStorage = new AsyncLocalStorage<Database>();

export function runWithDb<T>(
    dbInstance: Database,
    callback: () => T
): T {
    return dbStorage.run(dbInstance, callback);
}

export function getDb(): Database {
    const dbInstance = dbStorage.getStore();

    if (!dbInstance) {
        throw new Error(
            'Database accessed outside request context'
        );
    }
    return dbInstance;
}

/**
 * Request-scoped database proxy.
 *
 * Existing code can continue using:
 *
 *     import { db } from "@repo/db";
 *
 * The actual Drizzle instance is resolved from AsyncLocalStorage
 * for the current request.
 */
export const db = new Proxy({} as Database, {
    get(_target, property, _receiver) {
        const dbInstance = getDb();

        const value = Reflect.get(
            dbInstance,
            property,
            dbInstance
        )
        if (typeof value === "function") {
            return value.bind(dbInstance);
        }
        return value;
    }
})


export async function checkDatabase() {
    const dbInstance = getDb();
    await dbInstance.execute(sql`SELECT 1`);
}

export * from "./schema/index.js"
export * from 'drizzle-orm'
