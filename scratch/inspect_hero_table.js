const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  const cols = await pool.query(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'hero_banners'
    ORDER BY ordinal_position
  `);
  console.log("COLUMNS:");
  cols.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type} (nullable: ${r.is_nullable}, default: ${r.column_default})`));

  const count = await pool.query(`SELECT count(*) FROM public.hero_banners`);
  console.log("\nTotal rows in hero_banners:", count.rows[0].count);

  const sample = await pool.query(`SELECT id, title, button_text, button_link FROM public.hero_banners LIMIT 3`);
  console.log("\nSample rows:", sample.rows);

  await pool.end();
}

main().catch(console.error);
