const { Pool } = require('pg');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const dbUrl = env.match(/DATABASE_URL=([^\r\n]+)/)[1].trim();
const pool = new Pool({ connectionString: dbUrl });

async function main() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.shipping_config (
      id TEXT PRIMARY KEY DEFAULT 'default',
      is_standard_enabled BOOLEAN DEFAULT true,
      standard_title TEXT DEFAULT 'Complimentary Insured Courier',
      standard_rate NUMERIC(10, 2) DEFAULT 0,
      free_shipping_threshold NUMERIC(10, 2) DEFAULT 0,
      standard_estimated_days TEXT DEFAULT '3-5 business days',
      is_express_enabled BOOLEAN DEFAULT true,
      express_title TEXT DEFAULT 'VIP Express Air Courier',
      express_rate NUMERIC(10, 2) DEFAULT 150,
      express_estimated_days TEXT DEFAULT '1-2 business days',
      is_cod_enabled BOOLEAN DEFAULT true,
      cod_charge NUMERIC(10, 2) DEFAULT 0,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
    );
  `);
  
  await pool.query(`
    INSERT INTO public.shipping_config (id)
    VALUES ('default')
    ON CONFLICT (id) DO NOTHING;
  `);

  const r = await pool.query("SELECT * FROM public.shipping_config WHERE id = 'default'");
  console.log('Shipping config initialized:', r.rows[0]);
  await pool.end();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
