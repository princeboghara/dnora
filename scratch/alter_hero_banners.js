const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  console.log("Altering public.hero_banners to drop NOT NULL on button_text...");
  await pool.query(`
    ALTER TABLE public.hero_banners 
    ALTER COLUMN button_text DROP NOT NULL;
  `);
  console.log("Successfully dropped NOT NULL on button_text!");

  await pool.query(`
    ALTER TABLE public.hero_banners 
    ALTER COLUMN button_text SET DEFAULT '';
  `);
  console.log("Successfully set default '' on button_text!");

  // Verify
  const cols = await pool.query(`
    SELECT column_name, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'hero_banners' AND column_name = 'button_text'
  `);
  console.log("Updated column definition:", cols.rows[0]);

  await pool.end();
}

main().catch(console.error);
