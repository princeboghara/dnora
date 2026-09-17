import pg from "pg";
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

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();
  console.log("Connected to Supabase PostgreSQL...");

  // Check if categories already exist
  const existingCat = await client.query("SELECT COUNT(*) FROM public.product_categories");
  if (parseInt(existingCat.rows[0].count) > 0) {
    console.log("Categories already exist, skipping category insert.");
  } else {
    console.log("Inserting categories...");
    for (const cat of SEED_CATEGORIES) {
      await client.query(
        `INSERT INTO public.product_categories (name, slug, description, image_url)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (slug) DO NOTHING`,
        [cat.name, cat.slug, cat.description, cat.image_url]
      );
    }
  }

  // Fetch inserted categories map
  const catRows = await client.query("SELECT id, slug FROM public.product_categories");
  const categoryMap = new Map<string, string>();
  catRows.rows.forEach((r: { id: string; slug: string }) => categoryMap.set(r.slug, r.id));

  // Check products
  const existingProd = await client.query("SELECT COUNT(*) FROM public.products");
  if (parseInt(existingProd.rows[0].count) > 0) {
    console.log("Products already exist, skipping product insert.");
  } else {
    console.log("Inserting products...");
    for (const prod of SEED_PRODUCTS) {
      const prodRes = await client.query(
        `INSERT INTO public.products 
          (name, slug, short_description, description, price, compare_at_price, sku, stock, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (slug) DO NOTHING
         RETURNING id`,
        [
          prod.name,
          prod.slug,
          prod.short_description,
          prod.description,
          prod.price,
          prod.compare_at_price || null,
          prod.sku,
          prod.stock,
          prod.status,
        ]
      );

      const productId = prodRes.rows[0]?.id;
      if (productId) {
        // Flags
        await client.query(
          `INSERT INTO public.product_flags (product_id, is_best_seller, is_new_arrival, sort_order)
           VALUES ($1, $2, $3, $4)`,
          [productId, !!prod.is_best_seller, !!prod.is_new_arrival, prod.sort_order || 0]
        );

        // Images
        if (prod.images && prod.images.length > 0) {
          for (const img of prod.images) {
            await client.query(
              `INSERT INTO public.product_images (product_id, cloudinary_public_id, secure_url, alt_text, sort_order)
               VALUES ($1, $2, $3, $4, $5)`,
              [productId, img.cloudinary_public_id, img.secure_url, img.alt_text, img.sort_order]
            );
          }
        }

        // Category relations
        if (prod.categories && prod.categories.length > 0) {
          for (const catSlug of prod.categories) {
            const catId = categoryMap.get(catSlug);
            if (catId) {
              await client.query(
                `INSERT INTO public.product_category_relations (product_id, category_id)
                 VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                [productId, catId]
              );
            }
          }
        }
      }
    }
  }

  // Hero Banners
  const existingBanners = await client.query("SELECT COUNT(*) FROM public.hero_banners");
  if (parseInt(existingBanners.rows[0].count) === 0) {
    console.log("Inserting hero banners...");
    for (const b of SEED_HERO_BANNERS) {
      await client.query(
        `INSERT INTO public.hero_banners 
          (title, subtitle, media_type, cloudinary_public_id, media_url, button_text, button_link, duration_seconds, sort_order, is_active, status, text_alignment)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          b.title,
          b.subtitle,
          b.media_type,
          b.cloudinary_public_id || null,
          b.media_url,
          b.button_text,
          b.button_link,
          b.duration_seconds,
          b.sort_order,
          b.is_active,
          b.status,
          b.text_alignment,
        ]
      );
    }
  }

  // Customer Reviews
  const existingReviews = await client.query("SELECT COUNT(*) FROM public.customer_reviews");
  if (parseInt(existingReviews.rows[0].count) === 0) {
    console.log("Inserting customer reviews...");
    for (const r of SEED_REVIEWS) {
      await client.query(
        `INSERT INTO public.customer_reviews (customer_name, rating, review, image_url, verified_purchase, product_name, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [r.customer_name, r.rating, r.review, r.image_url || null, r.verified_purchase, r.product_name || null, r.status]
      );
    }
  }

  // Customer Videos
  const existingVideos = await client.query("SELECT COUNT(*) FROM public.customer_videos");
  if (parseInt(existingVideos.rows[0].count) === 0) {
    console.log("Inserting customer videos...");
    for (const v of SEED_SEEN_ON_YOU) {
      await client.query(
        `INSERT INTO public.customer_videos (customer_name, video_url, thumbnail_url, caption, product_name, product_slug, status, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [v.customer_name, v.video_url, v.thumbnail_url || null, v.caption, v.product_name, v.product_slug, v.status, v.sort_order]
      );
    }
  }

  console.log("Database seeded successfully!");
  await client.end();
}

main().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
