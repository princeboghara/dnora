const { Pool } = require('pg');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const dbUrl = env.match(/DATABASE_URL=([^\r\n]+)/)[1].trim();
const pool = new Pool({ connectionString: dbUrl });

async function check() {
  const res = await pool.query("SELECT id, name, slug, image_url, banner_image_url, banner_mobile_image_url, banner_fit, banner_position, banner_aspect_ratio FROM public.product_categories WHERE id = $1", ['0645fca2-0d86-44de-a06e-1f551da18138']);
  console.log("CATEGORY RECORD:", res.rows[0]);
  await pool.end();
}
check();
