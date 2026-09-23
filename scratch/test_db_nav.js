const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  const res = await pool.query("SELECT * FROM public.site_navigation_config WHERE id = 'storefront'");
  console.log("Rows:", res.rows.length);
  if (res.rows.length > 0) {
    console.log("Items count:", res.rows[0].items?.length);
    console.log("First item:", JSON.stringify(res.rows[0].items?.[0], null, 2));
    console.log("All item labels:", res.rows[0].items?.map(it => it.label));
  }
  await pool.end();
}

main().catch(console.error);
