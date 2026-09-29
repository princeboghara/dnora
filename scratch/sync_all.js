const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function syncAll() {
  const cats = await pool.query("SELECT * FROM public.product_categories");
  for (const c of cats.rows) {
    if (c.image_url) {
      await pool.query(
        "UPDATE public.circular_collections SET image = $1 WHERE href ILIKE $2 OR label ILIKE $3",
        [c.image_url, `%/category/${c.slug}%`, c.name]
      );
    }
  }
  console.log("All categories synced to circular_collections successfully!");
  await pool.end();
}

syncAll().catch(console.error);
