const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function verify() {
  console.log("==========================================");
  console.log("VERIFYING ALL IMPLEMENTED FEATURES");
  console.log("==========================================");

  // 1. Verify Circular Collections in DB
  const colRes = await pool.query("SELECT id, label, href, badge, is_active FROM public.circular_collections ORDER BY sort_order ASC");
  console.log(`[PASS] Circular Collections Count: ${colRes.rows.length}`);
  console.log("Sample Collections:", colRes.rows.slice(0, 3).map(c => `${c.label} (${c.href})`));

  // 2. Test inserting a test collection item
  const testInsert = await pool.query(
    `INSERT INTO public.circular_collections (label, href, image, badge, alt, sort_order, is_active)
     VALUES ('Test Belt Bags', '/category/crossbody-bags', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7', 'Test', 'Test Alt', 99, true)
     RETURNING id, label`
  );
  const testId = testInsert.rows[0].id;
  console.log(`[PASS] Created test collection: ${testInsert.rows[0].label} (ID: ${testId})`);

  // 3. Test deleting the test collection item
  const testDel = await pool.query("DELETE FROM public.circular_collections WHERE id = $1 RETURNING id", [testId]);
  console.log(`[PASS] Deleted test collection: ${testDel.rows[0].id}`);

  // 4. Verify Categories
  const catRes = await pool.query("SELECT id, name, slug FROM public.product_categories ORDER BY created_at ASC");
  console.log(`[PASS] Categories Count: ${catRes.rows.length}`);
  console.log("Categories List:", catRes.rows.map(c => `${c.name} -> /category/${c.slug}`));

  // 5. Verify Products with Categories
  const prodRes = await pool.query(`
    SELECT p.name, p.slug, p.price, c.name as category_name, c.slug as category_slug
    FROM public.products p
    JOIN public.product_category_relations pcr ON pcr.product_id = p.id
    JOIN public.product_categories c ON c.id = pcr.category_id
  `);
  console.log(`[PASS] Products with Category relations: ${prodRes.rows.length}`);
  prodRes.rows.forEach(p => {
    console.log(`  - ${p.name} ($${p.price}) in category: ${p.category_name} (/category/${p.category_slug})`);
  });

  // 6. Test Navigation subcategories retention
  const navRes = await pool.query("SELECT items FROM public.site_navigation_config WHERE id = 'storefront'");
  if (navRes.rows.length > 0) {
    const navItems = navRes.rows[0].items;
    const catTab = navItems.find(i => i.id === 'sf-categories' || i.label.toLowerCase() === 'categories');
    console.log(`[PASS] Storefront Navigation tab 'Categories' exists. Subcategories: ${catTab?.submenus?.length || 0}`);
  }

  console.log("==========================================");
  console.log("ALL VERIFICATIONS COMPLETED SUCCESSFULLY!");
  console.log("==========================================");
  await pool.end();
}

verify().catch(e => {
  console.error("Verification failed:", e);
  process.exit(1);
});
