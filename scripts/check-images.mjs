import pg from 'pg';
const { Pool } = pg;
const connectionString = "postgresql://postgres.zzwgudzlpsfxyxqmywtv:KSXaSRYF3-Zq6hY@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";

async function main() {
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  const res = await pool.query(`
    SELECT p.id, p.name, p.slug, 
           json_agg(json_build_object('id', pi.id, 'secure_url', pi.secure_url, 'sort_order', pi.sort_order)) as images
    FROM public.products p
    LEFT JOIN public.product_images pi ON pi.product_id = p.id
    GROUP BY p.id
    ORDER BY p.name;
  `);

  for (const row of res.rows) {
    console.log(`\nProduct: ${row.name} (${row.slug})`);
    console.log(`Images:`, row.images);
  }
  await pool.end();
}
main();
