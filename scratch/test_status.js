const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function check() {
  const catRes = await pool.query("SELECT * FROM public.product_categories WHERE slug = 'shoulder-bags'");
  const cat = catRes.rows[0];
  console.log('Category:', cat);

  const circRes = await pool.query("SELECT * FROM public.circular_collections WHERE href ILIKE '%shoulder-bags%'");
  console.log('Circular matching:', circRes.rows);

  const ordersRes = await pool.query("SELECT COUNT(*) FROM public.orders");
  console.log('Total orders in DB:', ordersRes.rows[0].count);

  await pool.end();
}

check().catch(console.error);
