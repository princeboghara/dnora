import { Pool } from "pg";

// Global pool cache for Next.js hot-reloading in dev
const globalForDb = global as unknown as { pgPool?: Pool };

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.zzwgudzlpsfxyxqmywtv:KSXaSRYF3-Zq6hY@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";

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
