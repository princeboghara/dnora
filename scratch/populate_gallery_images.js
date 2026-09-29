const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

// High quality luxury handbag photo angles from Unsplash
const GALLERY_SETS = {
  // Structured Handbag Set
  tote_set: [
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=85",
  ],
  shoulder_set: [
    "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1200&q=85",
  ],
  crossbody_set: [
    "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1200&q=85",
  ],
  evening_set: [
    "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1200&q=85",
  ]
};

async function populate() {
  const prods = await pool.query("SELECT id, name, slug FROM public.products");
  console.log(`Found ${prods.rows.length} products to enrich with multi-angle gallery photos.`);

  for (const p of prods.rows) {
    // Check existing images
    const currentImgs = await pool.query("SELECT * FROM public.product_images WHERE product_id = $1 ORDER BY sort_order ASC", [p.id]);
    
    // Choose appropriate set
    let chosenSet = GALLERY_SETS.tote_set;
    if (p.slug.includes("shoulder")) chosenSet = GALLERY_SETS.shoulder_set;
    else if (p.slug.includes("crossbody") || p.slug.includes("verona")) chosenSet = GALLERY_SETS.crossbody_set;
    else if (p.slug.includes("evening") || p.slug.includes("minaudiere")) chosenSet = GALLERY_SETS.evening_set;

    // Keep primary existing image as slot 1
    const primaryImg = currentImgs.rows[0]?.secure_url || chosenSet[0];
    const newImgs = [primaryImg, ...chosenSet.filter(url => url !== primaryImg)];

    // Clean and re-insert all images with correct sort_order
    await pool.query("DELETE FROM public.product_images WHERE product_id = $1", [p.id]);
    for (let idx = 0; idx < newImgs.length; idx++) {
      await pool.query(
        "INSERT INTO public.product_images (product_id, cloudinary_public_id, secure_url, alt_text, sort_order) VALUES ($1, $2, $3, $4, $5)",
        [p.id, `prod_gallery_${idx + 1}`, newImgs[idx], `${p.name} - View ${idx + 1}`, idx + 1]
      );
    }
    console.log(`Enriched "${p.name}" with ${newImgs.length} images.`);
  }

  console.log("All products successfully updated with multi-angle gallery images!");
  await pool.end();
}

populate().catch(console.error);
