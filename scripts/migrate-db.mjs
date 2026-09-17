import fs from "fs";
import path from "path";
import pg from "pg";
const { Client } = pg;

const client = new Client({
  connectionString:
    "postgresql://postgres.zzwgudzlpsfxyxqmywtv:KSXaSRYF3-Zq6hY@aws-0-ap-south-1.pooler.supabase.com:5432/postgres",
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log("Connecting to Supabase PostgreSQL database...");
  await client.connect();
  console.log("Connected successfully!");

  const sql = fs.readFileSync(
    path.join(process.cwd(), "lib", "supabase", "schema.sql"),
    "utf-8"
  );

  console.log("Running schema migration...");
  await client.query(sql);
  console.log("Schema migration completed successfully!");

  // Verify created tables
  const tables = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
  );
  console.log("Created tables:", tables.rows.map((r) => r.table_name));

  await client.end();
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
