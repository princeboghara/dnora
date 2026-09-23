const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  await pool.query("DELETE FROM public.hero_banners WHERE title = 'New Test Luxury Banner'");
  await pool.query("UPDATE public.hero_banners SET title = 'GLAM ENTRANCE COUTURE' WHERE title LIKE 'GLAM ENTRANCE COUTURE%'");
  const count = await pool.query("SELECT id, title, button_text FROM public.hero_banners");
  console.log("Current banners in DB:", count.rows);
  await pool.end();
}

main().catch(console.error);
