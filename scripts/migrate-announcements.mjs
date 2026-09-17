import pg from "pg";

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

if (!connectionString) {
  console.error("Missing DATABASE_URL or DIRECT_URL in environment variables.");
  process.exit(1);
}

const pool = new Pool({ connectionString });

const DEFAULT_ANNOUNCEMENTS = [
  {
    id: "ann-1",
    text: "\"A/W 26\" Collection Is Live — Explore Architectural Silhouettes",
    link: "/shop",
    badge: "New Release",
    is_active: true,
    sort_order: 1,
  },
  {
    id: "ann-2",
    text: "Complimentary Worldwide Express White-Glove Delivery on Orders Over $250",
    link: "/shop",
    badge: "Privilege",
    is_active: true,
    sort_order: 2,
  },
  {
    id: "ann-3",
    text: "Artisan Handcrafted in Florence, Italy • Limited Atelier Batch Production",
    link: "/#editorial",
    badge: "Craftsmanship",
    is_active: true,
    sort_order: 3,
  },
  {
    id: "ann-4",
    text: "Extra 5% Courtesy Privilege on All Prepaid Registrations • Code: DNORA5",
    link: "/shop",
    badge: "Exclusive",
    is_active: true,
    sort_order: 4,
  },
];

async function migrate() {
  console.log("🚀 Running announcements migration...");

  try {
    // 1. Create table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.announcements_config (
        id TEXT PRIMARY KEY DEFAULT 'default',
        interval_seconds INTEGER NOT NULL DEFAULT 4,
        is_active BOOLEAN NOT NULL DEFAULT true,
        items JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
      );
    `);
    console.log("✅ public.announcements_config table verified.");

    // 2. Insert default config if none exists
    const check = await pool.query(
      `SELECT id FROM public.announcements_config WHERE id = 'default' LIMIT 1`
    );

    if (check.rows.length === 0) {
      await pool.query(
        `INSERT INTO public.announcements_config (id, interval_seconds, is_active, items, updated_at)
         VALUES ('default', 4, true, $1, timezone('utc'::text, now()))`,
        [JSON.stringify(DEFAULT_ANNOUNCEMENTS)]
      );
      console.log("✅ Seeded default announcements configuration.");
    } else {
      console.log("ℹ️ Announcements configuration already initialized.");
    }

    console.log("🎉 Announcements migration completed successfully!");
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
