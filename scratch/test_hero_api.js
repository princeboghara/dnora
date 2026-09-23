const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testDirectDbInsert() {
  console.log("Testing direct DB insert with null button_text...");
  try {
    const res = await pool.query(
      `INSERT INTO public.hero_banners 
        (title, heading, subtitle, media_type, cloudinary_public_id, media_url, tablet_media_url, mobile_media_url, button_text, button_link, duration_seconds, sort_order, is_active, status, text_alignment, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING *`,
      [
        "Test Banner",
        null,
        null,
        "image",
        null,
        "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        null,
        null,
        null, // <--- testing null button_text
        "/shop",
        5,
        1,
        true,
        "published",
        "left",
        null,
        null,
      ]
    );
    console.log("Success! Inserted id:", res.rows[0].id);
    await pool.query("DELETE FROM public.hero_banners WHERE id = $1", [res.rows[0].id]);
  } catch (err) {
    console.error("FAILED DIRECT DB INSERT:", err.message);
  }
}

async function main() {
  await testDirectDbInsert();
  await pool.end();
}

main().catch(console.error);
