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
  console.log('Connected to database.');

  console.log('Adding password_hash column to public.users...');
  await client.query(`
    ALTER TABLE public.users 
    ADD COLUMN IF NOT EXISTS password_hash TEXT;
  `);

  console.log('Creating public.email_verifications table...');
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.email_verifications (
      email TEXT PRIMARY KEY,
      otp_hash TEXT NOT NULL,
      full_name TEXT,
      phone TEXT,
      password_hash TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
    );
  `);

  // Verify structure
  const cols = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'password_hash';
  `);
  console.log('Verified column:', cols.rows);

  const verTable = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'email_verifications';
  `);
  console.log('Verified email_verifications columns:', verTable.rows.map(r => r.column_name));

  await client.end();
  console.log('Auth migration finished successfully!');
}

run().catch(console.error);
