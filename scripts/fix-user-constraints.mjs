import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres.zzwgudzlpsfxyxqmywtv:KSXaSRYF3-Zq6hY@aws-0-ap-south-1.pooler.supabase.com:5432/postgres',
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
