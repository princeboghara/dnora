import { Pool } from "pg";

// Global pool cache for Next.js hot-reloading in dev
const globalForDb = global as unknown as { pgPool?: Pool };

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL environment variable is missing. Please configure it in .env.local"
  );
}

export const db =
  globalForDb.pgPool ||
  new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgPool = db;
}
