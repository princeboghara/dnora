import pg from 'pg';
const { Pool } = pg;

const connectionString = "postgresql://postgres.zzwgudzlpsfxyxqmywtv:KSXaSRYF3-Zq6hY@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";

async function main() {
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log("Checking and updating table schema...");
    await pool.query(`
      ALTER TABLE public.products 
      ADD COLUMN IF NOT EXISTS color_variants JSONB DEFAULT '[]'::jsonb;
    `);
    console.log("color_variants column ensured.");

    const res = await pool.query(`
      SELECT id, name, slug, price, color_variants 
      FROM public.products 
      ORDER BY created_at DESC 
      LIMIT 10;
    `);
    console.log(`Found ${res.rows.length} products:`);
    for (const p of res.rows) {
      console.log(`- [${p.id}] ${p.name} (${p.slug}) | Variants: ${JSON.stringify(p.color_variants)}`);
    }

    const imgRes = await pool.query(`
      SELECT product_id, secure_url, alt_text 
      FROM public.product_images 
      LIMIT 20;
    `);
    console.log(`\nSample images count: ${imgRes.rows.length}`);
    for (const img of imgRes.rows.slice(0, 5)) {
      console.log(`- Product ${img.product_id}: ${img.secure_url}`);
    }

  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await pool.end();
  }
}

main();
