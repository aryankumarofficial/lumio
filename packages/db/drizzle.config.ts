import "dotenv/config";
import {defineConfig} from "drizzle-kit";

const databaseConnectionUrl = process.env.DATABASE_URL;

if (!databaseConnectionUrl) {
    throw new Error("Missing database connection url");
}


export default defineConfig({
    out: "./.drizzle",
    dialect: "postgresql",
    schema: ['./src/schema'],
    migrations: {
        prefix: "unix",
        table: "__drizzle_migrations__"
    },
    dbCredentials: {
        url: databaseConnectionUrl,
    }
})