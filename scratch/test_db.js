const { Pool } = require('pg');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const dbUrl = env.match(/DATABASE_URL=([^\r\n]+)/)[1].trim();
const pool = new Pool({ connectionString: dbUrl });

async function main() {
  const r = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;");
  console.log('Tables in public schema:', r.rows.map(x => x.table_name));
  await pool.end();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
