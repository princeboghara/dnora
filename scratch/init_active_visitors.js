const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const dbUrlMatch = env.match(/DATABASE_URL=([^\r\n]+)/);
if (!dbUrlMatch) {
  console.error("No DATABASE_URL found");
  process.exit(1);
}
const dbUrl = dbUrlMatch[1].trim();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: dbUrl });

async function run() {
  try {
    console.log("Creating public.active_visitors table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.active_visitors (
        visitor_id TEXT PRIMARY KEY,
        path TEXT DEFAULT '/',
        user_agent TEXT,
        ip_address TEXT,
        last_seen TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_active_visitors_last_seen ON public.active_visitors (last_seen);
    `);
    console.log("Table public.active_visitors created successfully!");
    const res = await pool.query(`SELECT COUNT(*) FROM public.active_visitors`);
    console.log("Initial active visitors count:", res.rows[0].count);
    await pool.end();
  } catch (err) {
    console.error("Error creating active_visitors table:", err);
    process.exit(1);
  }
}

run();
