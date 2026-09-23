const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  console.log("Starting DB migration...");

  // 1. Enable uuid extension
  await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

  // 2. Create product_categories
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.product_categories (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      image_url TEXT,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
    );
  `);
  console.log("Checked product_categories table.");

  // 3. Create products
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.products (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      short_description TEXT NOT NULL,
      description TEXT NOT NULL,
      price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
      compare_at_price DECIMAL(10, 2) CHECK (compare_at_price IS NULL OR compare_at_price >= price),
      sku TEXT NOT NULL UNIQUE,
      stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
    );
  `);
  console.log("Checked products table.");

  // 4. Create product_images
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.product_images (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
      cloudinary_public_id TEXT NOT NULL,
      secure_url TEXT NOT NULL,
      alt_text TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
    );
  `);
  console.log("Checked product_images table.");

  // 5. Create product_category_relations
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.product_category_relations (
      product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
      category_id UUID NOT NULL REFERENCES public.product_categories(id) ON DELETE CASCADE,
      PRIMARY KEY (product_id, category_id)
    );
  `);
  console.log("Checked product_category_relations table.");

  // 6. Create product_flags
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.product_flags (
      product_id UUID PRIMARY KEY REFERENCES public.products(id) ON DELETE CASCADE,
      is_best_seller BOOLEAN NOT NULL DEFAULT false,
      is_new_arrival BOOLEAN NOT NULL DEFAULT false,
      sort_order INTEGER NOT NULL DEFAULT 0
    );
  `);
  console.log("Checked product_flags table.");

  // 7. Create circular_collections table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.circular_collections (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      label TEXT NOT NULL,
      href TEXT NOT NULL DEFAULT '/shop',
      image TEXT NOT NULL,
      badge TEXT,
      alt TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
    );
  `);
  console.log("Checked circular_collections table.");

  // Indexes
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_circular_collections_sort ON public.circular_collections(sort_order ASC, created_at DESC);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_product_categories_slug ON public.product_categories(slug);`);

  // Seed default collections if empty
  const collCheck = await pool.query(`SELECT COUNT(*) FROM public.circular_collections`);
  if (parseInt(collCheck.rows[0].count, 10) === 0) {
    console.log("Seeding circular_collections with initial 10 items...");
    const defaults = [
      {
        label: "New Arrivals",
        href: "/shop?sort=newest",
        image: "https://www.linoperros.com/cdn/shop/files/Circular_512_X_512_Icon_Webp_1.jpg?v=1786340044&width=300",
        badge: "New",
        alt: "New Arrivals Collection",
        sort_order: 1,
      },
      {
        label: "Best Sellers",
        href: "/#bestsellers",
        image: "https://www.linoperros.com/cdn/shop/files/bestseller.png?v=1788779073&width=300",
        badge: "Hot",
        alt: "Best Sellers Handbags",
        sort_order: 2,
      },
      {
        label: "Tote Bags",
        href: "/category/tote-bags",
        image: "https://www.linoperros.com/cdn/shop/files/TOTE_1.webp?v=1786339599&width=300",
        alt: "Luxury Tote Bags",
        sort_order: 3,
      },
      {
        label: "Sling Bags",
        href: "/category/crossbody-bags",
        image: "https://www.linoperros.com/cdn/shop/files/sling.png?v=1788779073&width=300",
        alt: "Designer Sling Bags",
        sort_order: 4,
      },
      {
        label: "Satchel Bags",
        href: "/category/satchel-bags",
        image: "https://www.linoperros.com/cdn/shop/files/satchel_22824a1f-9b5d-4041-a13c-79d1ba2ea671.png?v=1788779073&width=300",
        alt: "Leather Satchel Bags",
        sort_order: 5,
      },
      {
        label: "Shoulder Bags",
        href: "/category/shoulder-bags",
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=300&q=80",
        alt: "Elegant Shoulder Bags",
        sort_order: 6,
      },
      {
        label: "Clutches",
        href: "/category/mini-bags",
        image: "https://www.linoperros.com/cdn/shop/files/clutch_c0e75bbd-9455-4ee5-88e2-c778c0ad809a.png?v=1788779073&width=300",
        alt: "Evening Clutches & Minis",
        sort_order: 7,
      },
      {
        label: "Backpacks",
        href: "/category/backpacks",
        image: "https://www.linoperros.com/cdn/shop/files/backpack.png?v=1788779073&width=300",
        alt: "Luxury Backpacks",
        sort_order: 8,
      },
      {
        label: "Wallets",
        href: "/category/wallets",
        image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=300&q=80",
        alt: "Fine Leather Wallets",
        sort_order: 9,
      },
      {
        label: "Gifting",
        href: "/shop?collection=gifts",
        image: "https://www.linoperros.com/cdn/shop/files/Perfume_thumbnail_jpg_1.webp?v=1786359653&width=300",
        alt: "Luxury Gifting Collection",
        sort_order: 10,
      },
    ];

    for (const item of defaults) {
      await pool.query(
        `INSERT INTO public.circular_collections (label, href, image, badge, alt, sort_order, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, true)`,
        [item.label, item.href, item.image, item.badge || null, item.alt || null, item.sort_order]
      );
    }
    console.log("Seeded default circular collections successfully.");
  }

  // Seed default categories if empty
  const catCheck = await pool.query(`SELECT COUNT(*) FROM public.product_categories`);
  if (parseInt(catCheck.rows[0].count, 10) === 0) {
    console.log("Seeding product_categories with default silhouettes...");
    const seedCategories = [
      {
        name: "Shoulder Bags",
        slug: "shoulder-bags",
        description: "Architectural silhouettes crafted for graceful shoulder draping.",
        image_url: "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1000&q=85",
      },
      {
        name: "Tote Bags",
        slug: "tote-bags",
        description: "Expansive structured carries sculpted from buttery Italian calfskin.",
        image_url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=85",
      },
      {
        name: "Crossbody Bags",
        slug: "crossbody-bags",
        description: "Hands-free modernity engineered with sculptural brass hardware.",
        image_url: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1000&q=85",
      },
      {
        name: "Handbags",
        slug: "handbags",
        description: "Iconic top-handle silhouettes celebrating artisan minimalism.",
        image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85",
      },
      {
        name: "Mini Bags",
        slug: "mini-bags",
        description: "Compact micro-proportions engineered for high-impact evening wear.",
        image_url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=85",
      },
    ];

    for (const cat of seedCategories) {
      await pool.query(
        `INSERT INTO public.product_categories (name, slug, description, image_url)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (slug) DO NOTHING`,
        [cat.name, cat.slug, cat.description, cat.image_url]
      );
    }
    console.log("Seeded product_categories successfully.");
  }

  // Seed sample products if empty
  const prodCheck = await pool.query(`SELECT COUNT(*) FROM public.products`);
  if (parseInt(prodCheck.rows[0].count, 10) === 0) {
    console.log("Seeding sample products...");
    const catRows = (await pool.query(`SELECT id, slug FROM public.product_categories`)).rows;
    const catMap = {};
    catRows.forEach(c => { catMap[c.slug] = c.id; });

    const sampleProducts = [
      {
        name: "The Marais Structured Handbag",
        slug: "the-marais-structured-handbag",
        short_description: "Architectural top-handle handbag in pebbled Noir calfskin.",
        description: "Handcrafted in Florence, Italy, The Marais is DNORA's quintessential architectural silhouette. Cut from full-grain vegetable-tanned Italian calfskin with hand-painted beveled edges and signature brushed champagne brass hardware.",
        price: 680,
        compare_at_price: 750,
        sku: "DNR-MAR-01-BLK",
        stock: 18,
        catSlug: "handbags",
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85"
      },
      {
        name: "The Sienne Flap Shoulder Bag",
        slug: "the-sienne-flap-shoulder-bag",
        short_description: "Elongated minimalist flap shoulder bag in warm Caramel.",
        description: "A celebration of mid-century geometry and effortless shoulder wear. The Sienne features a smooth semi-patent finish that develops a natural patina over time.",
        price: 540,
        compare_at_price: null,
        sku: "DNR-SIE-02-CAR",
        stock: 12,
        catSlug: "shoulder-bags",
        image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1200&q=85"
      },
      {
        name: "The Palazzo Grand Tote",
        slug: "the-palazzo-grand-tote",
        short_description: "Unstructured architectural tote with reinforced double handles.",
        description: "Engineered for generous daily capacity without sacrificing silhouette sharpness. Cut from ultra-supple tumbled leather that folds effortlessly.",
        price: 720,
        compare_at_price: 800,
        sku: "DNR-PLZ-03-ESP",
        stock: 8,
        catSlug: "tote-bags",
        image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=85"
      },
      {
        name: "The Verona Sculptural Crossbody",
        slug: "the-verona-sculptural-crossbody",
        short_description: "Compact crescent crossbody with modular leather strap.",
        description: "Fluid curves meet contemporary utility. The Verona hugs the torso naturally, featuring an interchangeable crossbody strap and hand-buffed gilded clasp.",
        price: 480,
        compare_at_price: null,
        sku: "DNR-VRN-04-OLV",
        stock: 15,
        catSlug: "crossbody-bags",
        image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1200&q=85"
      },
      {
        name: "The Vendome Evening Minaudière",
        slug: "the-vendome-evening-minaudiere",
        short_description: "Box clutch with faceted crystal clasp and satin lining.",
        description: "Designed for nocturnal glamour. Wrapped in lustrous micro-grain calfskin with champagne hardware and a concealed delicate chain drop.",
        price: 390,
        compare_at_price: 450,
        sku: "DNR-VDM-05-CHM",
        stock: 20,
        catSlug: "mini-bags",
        image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85"
      }
    ];

    for (const p of sampleProducts) {
      const pRes = await pool.query(
        `INSERT INTO public.products (name, slug, short_description, description, price, compare_at_price, sku, stock, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [p.name, p.slug, p.short_description, p.description, p.price, p.compare_at_price, p.sku, p.stock]
      );
      const prodId = pRes.rows[0].id;

      await pool.query(
        `INSERT INTO public.product_flags (product_id, is_best_seller, is_new_arrival, sort_order)
         VALUES ($1, true, false, 1)
         ON CONFLICT (product_id) DO NOTHING`,
        [prodId]
      );

      if (catMap[p.catSlug]) {
        await pool.query(
          `INSERT INTO public.product_category_relations (product_id, category_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [prodId, catMap[p.catSlug]]
        );
      }

      await pool.query(
        `INSERT INTO public.product_images (product_id, cloudinary_public_id, secure_url, alt_text, sort_order)
         VALUES ($1, 'dnora/seed', $2, $3, 0)`,
        [prodId, p.image, p.name]
      );
    }
    console.log("Seeded sample products successfully.");
  }

  console.log("Migration complete!");
  await pool.end();
}

migrate().catch(e => {
  console.error("Migration error:", e);
  process.exit(1);
});
