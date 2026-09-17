import pg from "pg";
import { v2 as cloudinary } from "cloudinary";
import {
  SEED_CATEGORIES,
  SEED_PRODUCTS,
  SEED_HERO_BANNERS,
  SEED_REVIEWS,
  SEED_SEEN_ON_YOU,
} from "../lib/data/seed-data";

const { Client } = pg;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required.");
  process.exit(1);
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Configure Database
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log("Connecting to Supabase PostgreSQL...");
  await client.connect();

  // 1. Create Supabase Storage Buckets
  console.log("\n--- Creating Supabase Storage Buckets ---");
  try {
    const buckets = ["dnora-media", "dnora-products", "dnora-heroes"];
    for (const b of buckets) {
      await client.query(
        `INSERT INTO storage.buckets (id, name, public, created_at, updated_at)
         VALUES ($1, $1, true, now(), now())
         ON CONFLICT (id) DO UPDATE SET public = true`,
        [b]
      );
    }
    console.log("Supabase Storage buckets created: dnora-media, dnora-products, dnora-heroes");
  } catch (e: unknown) {
    console.warn("Storage bucket setup warning:", e instanceof Error ? e.message : e);
  }

  // 2. Upload Categories to Cloudinary
  console.log("\n--- Migrating Categories to Cloudinary ---");
  for (const cat of SEED_CATEGORIES) {
    if (cat.image_url) {
      try {
        console.log(`Uploading category image: ${cat.name}...`);
        const res = await cloudinary.uploader.upload(cat.image_url, {
          folder: "dnora/categories",
          public_id: cat.slug,
          overwrite: true,
          resource_type: "image",
        });
        console.log(`✓ Hosted on Cloudinary: ${res.secure_url}`);

        await client.query(
          `UPDATE public.product_categories SET image_url = $1 WHERE slug = $2`,
          [res.secure_url, cat.slug]
        );
      } catch (err: unknown) {
        console.error(`Error uploading category ${cat.name}:`, err instanceof Error ? err.message : err);
      }
    }
  }

  // 3. Upload Products to Cloudinary
  console.log("\n--- Migrating Product Images to Cloudinary ---");
  for (const prod of SEED_PRODUCTS) {
    if (prod.images && prod.images.length > 0) {
      for (let i = 0; i < prod.images.length; i++) {
        const img = prod.images[i];
        try {
          console.log(`Uploading product image: ${prod.name} (image ${i + 1})...`);
          const res = await cloudinary.uploader.upload(img.secure_url, {
            folder: "dnora/products",
            public_id: `${prod.slug}-${i + 1}`,
            overwrite: true,
            resource_type: "image",
          });
          console.log(`✓ Hosted on Cloudinary: ${res.secure_url}`);

          // Update image in product_images
          await client.query(
            `UPDATE public.product_images 
             SET secure_url = $1, cloudinary_public_id = $2
             WHERE product_id IN (SELECT id FROM public.products WHERE slug = $3)
             AND sort_order = $4`,
            [res.secure_url, res.public_id, prod.slug, img.sort_order]
          );
        } catch (err: unknown) {
          console.error(`Error uploading image for ${prod.name}:`, err instanceof Error ? err.message : err);
        }
      }
    }
  }

  // 4. Upload Hero Banners to Cloudinary
  console.log("\n--- Migrating Hero Banners to Cloudinary ---");
  for (let i = 0; i < SEED_HERO_BANNERS.length; i++) {
    const banner = SEED_HERO_BANNERS[i];
    try {
      console.log(`Uploading hero banner: ${banner.title} (${banner.media_type})...`);
      const res = await cloudinary.uploader.upload(banner.media_url, {
        folder: "dnora/heroes",
        public_id: `hero-${i + 1}`,
        overwrite: true,
        resource_type: banner.media_type === "video" ? "video" : "image",
      });
      console.log(`✓ Hosted on Cloudinary: ${res.secure_url}`);

      await client.query(
        `UPDATE public.hero_banners 
         SET media_url = $1, cloudinary_public_id = $2
         WHERE title = $3`,
        [res.secure_url, res.public_id, banner.title]
      );
    } catch (err: unknown) {
      console.error(`Error uploading hero banner ${banner.title}:`, err instanceof Error ? err.message : err);
    }
  }

  // 5. Upload Customer Review Avatars to Cloudinary
  console.log("\n--- Migrating Customer Review Images to Cloudinary ---");
  for (let i = 0; i < SEED_REVIEWS.length; i++) {
    const r = SEED_REVIEWS[i];
    if (r.image_url) {
      try {
        console.log(`Uploading review avatar: ${r.customer_name}...`);
        const res = await cloudinary.uploader.upload(r.image_url, {
          folder: "dnora/reviews",
          public_id: `review-${i + 1}`,
          overwrite: true,
          resource_type: "image",
        });
        console.log(`✓ Hosted on Cloudinary: ${res.secure_url}`);

        await client.query(
          `UPDATE public.customer_reviews SET image_url = $1 WHERE customer_name = $2`,
          [res.secure_url, r.customer_name]
        );
      } catch (err: unknown) {
        console.error(`Error uploading review avatar:`, err instanceof Error ? err.message : err);
      }
    }
  }

  // 6. Upload Customer Videos (Seen On You) to Cloudinary
  console.log("\n--- Migrating Seen on You Customer Videos to Cloudinary ---");
  for (let i = 0; i < SEED_SEEN_ON_YOU.length; i++) {
    const v = SEED_SEEN_ON_YOU[i];
    try {
      console.log(`Uploading customer video: ${v.customer_name}...`);
      const videoRes = await cloudinary.uploader.upload(v.video_url, {
        folder: "dnora/customer-videos",
        public_id: `video-${i + 1}`,
        overwrite: true,
        resource_type: "video",
      });
      console.log(`✓ Hosted Video on Cloudinary: ${videoRes.secure_url}`);

      let thumbUrl = videoRes.secure_url.replace(/\.[^/.]+$/, ".jpg");
      if (v.thumbnail_url) {
        try {
          const thumbRes = await cloudinary.uploader.upload(v.thumbnail_url, {
            folder: "dnora/customer-videos",
            public_id: `video-thumb-${i + 1}`,
            overwrite: true,
            resource_type: "image",
          });
          thumbUrl = thumbRes.secure_url;
        } catch {
          // ignore
        }
      }

      await client.query(
        `UPDATE public.customer_videos 
         SET video_url = $1, thumbnail_url = $2, cloudinary_public_id = $3
         WHERE customer_name = $4`,
        [videoRes.secure_url, thumbUrl, videoRes.public_id, v.customer_name]
      );
    } catch (err: unknown) {
      console.error(`Error uploading customer video:`, err instanceof Error ? err.message : err);
    }
  }

  console.log("\n🎉 ALL MEDIA MIGRATION TO CLOUDINARY & SUPABASE COMPLETED SUCCESSFULLY!");
  await client.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
