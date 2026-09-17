import pg from 'pg';
const { Client } = pg;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required.");
  process.exit(1);
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const defaultSidebarItems = [
  {
    id: "nav-dashboard",
    label: "Dashboard",
    href: "/admin",
    icon: "LayoutDashboard",
    is_active: true
  },
  {
    id: "nav-products",
    label: "Catalog & Products",
    href: "/admin/products",
    icon: "ShoppingBag",
    is_active: true,
    submenus: [
      { id: "sub-prod-all", label: "All Products", href: "/admin/products" },
      { id: "sub-prod-bestsellers", label: "Best Sellers", href: "/admin/products?filter=best_seller" },
      { id: "sub-prod-new", label: "New Arrivals", href: "/admin/products?filter=new_arrival" }
    ]
  },
  {
    id: "nav-heroes",
    label: "Hero Banners",
    href: "/admin/heroes",
    icon: "Image",
    is_active: true,
    submenus: [
      { id: "sub-hero-all", label: "Banner Studio", href: "/admin/heroes" },
      { id: "sub-hero-active", label: "Live Banners", href: "/admin/heroes?filter=published" }
    ]
  },
  {
    id: "nav-customers",
    label: "Customers & CRM",
    href: "/admin/customers",
    icon: "Users",
    is_active: true,
    submenus: [
      { id: "sub-cust-all", label: "All Clients", href: "/admin/customers" },
      { id: "sub-cust-buyers", label: "Active Buyers", href: "/admin/customers?filter=buyers" }
    ]
  },
  {
    id: "nav-orders",
    label: "Orders",
    href: "/admin/customers",
    icon: "ShoppingCart",
    badge: "Soon",
    is_active: true
  },
  {
    id: "nav-analytics",
    label: "Analytics",
    href: "/admin",
    icon: "BarChart3",
    badge: "Soon",
    is_active: true
  }
];

async function run() {
  await client.connect();
  console.log('Connected to DB');

  console.log('Creating public.admin_sidebar_config table...');
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.admin_sidebar_config (
      id TEXT PRIMARY KEY DEFAULT 'default',
      items JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
    );
  `);

  console.log('Seeding default sidebar configuration...');
  await client.query(`
    INSERT INTO public.admin_sidebar_config (id, items, updated_at)
    VALUES ('default', $1, timezone('utc'::text, now()))
    ON CONFLICT (id) DO NOTHING;
  `, [JSON.stringify(defaultSidebarItems)]);

  const count = await client.query(`SELECT COUNT(*) FROM public.admin_sidebar_config`);
  console.log('Table verified, config rows:', count.rows[0].count);

  await client.end();
  console.log('Sidebar migration completed successfully!');
}

run().catch(console.error);
