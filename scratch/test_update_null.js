const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function updateHeroBanner(id, updates) {
  const fields = [];
  const values = [];
  let i = 1;

  for (const [key, val] of Object.entries(updates)) {
    if (key !== "id" && key !== "created_at" && val !== undefined) {
      fields.push(`${key} = $${i}`);
      values.push(val);
      i++;
    }
  }

  if (fields.length === 0) return null;

  fields.push(`updated_at = now()`);
  values.push(id);

  console.log("SQL:", `UPDATE public.hero_banners SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`);
  console.log("Values:", values);

  const res = await pool.query(
    `UPDATE public.hero_banners SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
    values
  );
  return res.rows[0];
}

async function main() {
  const rows = await pool.query("SELECT id, title, heading, subtitle FROM public.hero_banners LIMIT 1");
  const banner = rows.rows[0];
  console.log("BEFORE:", banner);

  console.log("\nUpdating with heading: null, subtitle: null...");
  const updated = await updateHeroBanner(banner.id, { heading: null, subtitle: null });
  console.log("AFTER:", { id: updated.id, title: updated.title, heading: updated.heading, subtitle: updated.subtitle });

  await pool.end();
}

main().catch(console.error);
