import pg from 'pg';
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || "postgresql://postgres.zzwgudzlpsfxyxqmywtv:KSXaSRYF3-Zq6hY@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";

async function main() {
  console.log("🚀 Starting database migration for Homepage Config and Admin UUID...");
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    // 1. Create homepage_config table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.homepage_config (
        id TEXT PRIMARY KEY DEFAULT 'default',
        config JSONB NOT NULL DEFAULT '{}'::jsonb,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
      );
    `);
    console.log("✓ public.homepage_config table ensured.");

    // Default configuration
    const defaultConfig = {
      topbar: {
        enabled: true,
        text: "COMPLIMENTARY WHITE-GLOVE EXPRESS DELIVERY ON ALL LUXURY ORDERS",
        link: "/shop"
      },
      hero: {
        enabled: true
      },
      categories: {
        enabled: true,
        title: "CATEGORIES"
      },
      best_sellers: {
        enabled: true,
        title: "BEST SELLERS",
        view_all_link: "/shop?best_seller=true",
        view_all_text: "VIEW ALL"
      },
      new_in: {
        enabled: true,
        title: "NEW IN",
        view_all_link: "/shop?new_arrival=true",
        view_all_text: "VIEW ALL"
      },
      middle_banner: {
        enabled: true,
        eyebrow: "Atelier Edition • Florence",
        title: "ARCHITECTURAL LEATHER",
        description: "Sculpted with uncompromising discipline. Cut from certified full-grain Tuscan calfskin and finished with bespoke satin metal hardware.",
        button_text: "DISCOVER THE ATELIER",
        button_link: "/shop",
        image_url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1800&q=85"
      },
      seen_on_you: {
        enabled: true,
        title: "SEEN ON YOU"
      },
      customer_reviews: {
        enabled: true,
        title: "CUSTOMER REVIEWS"
      },
      footer: {
        subtitle: "Artisan Handbags • Florence • New York",
        story_text: "Architectural silhouettes, meticulous artisan leatherwork, and timeless aesthetics designed for the modern woman. Handcrafted with bespoke calfskin and precision hardware.",
        instagram_url: "https://instagram.com/dnoralifestyle",
        facebook_url: "https://facebook.com/dnoralifestyle",
        pinterest_url: "https://pinterest.com/dnoralifestyle"
      }
    };

    const existingConfig = await pool.query(`SELECT id FROM public.homepage_config WHERE id = 'default'`);
    if (existingConfig.rows.length === 0) {
      await pool.query(
        `INSERT INTO public.homepage_config (id, config) VALUES ('default', $1)`,
        [JSON.stringify(defaultConfig)]
      );
      console.log("✓ Default homepage configuration seeded.");
    } else {
      console.log("✓ Homepage configuration already exists.");
    }

    // 2. Ensure Admin User with valid UUID exists in public.users
    const adminUUID = 'a0000000-0000-0000-0000-000000000001';
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@dnora.luxury").toLowerCase().trim();

    await pool.query(`
      INSERT INTO public.users (id, email, full_name, role)
      VALUES ($1, $2, 'DNORA Administrator', 'admin')
      ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, role = 'admin'
    `, [adminUUID, adminEmail]);
    console.log(`✓ Admin user ensured with UUID: ${adminUUID}`);

    console.log("🎉 Migration completed successfully!");
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
