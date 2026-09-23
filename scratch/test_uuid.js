const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
  const res = await pool.query('SELECT uuid_generate_v4();');
  console.log("UUID test success:", res.rows[0]);
  await pool.end();
}

run().catch((e) => {
  console.error("Test failed:", e.message);
  process.exit(1);
});
