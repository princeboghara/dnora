import pg from 'pg';
const { Client } = pg;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required.");
  process.exit(1);
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  await client.connect();
  console.log('Connected to Supabase DB');

  const res = await client.query(`
    SELECT conname, contype 
    FROM pg_constraint 
    WHERE conrelid = 'public.users'::regclass
  `);
  console.log('Constraints on public.users:', res.rows);

  console.log('Dropping users_id_fkey constraint if exists...');
  await client.query(`ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;`);
  console.log('Successfully dropped users_id_fkey!');

  await client.end();
}

run().catch(console.error);
