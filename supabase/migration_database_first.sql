-- ==============================================================================
-- D'NORA LUXURY ATELIER — 100% DATABASE-FIRST MIGRATION & CLEANUP SCRIPT
-- RUN THIS IN SUPABASE DASHBOARD -> SQL EDITOR (CLICK 'RUN')
-- ==============================================================================

-- 1. ERASE ALL OLD MOCK/SAMPLE DATA FOR A CLEAN SLATE
TRUNCATE TABLE 
  public.order_items,
  public.orders,
  public.cart_items,
  public.wishlist_items,
  public.coupon_usage,
  public.coupons,
  public.reviews,
  public.product_variants,
  public.product_images,
  public.collection_products,
  public.products,
  public.categories,
  public.banners,
  public.admin_activity_logs
CASCADE;

-- 2. SCHEMA ALIGNMENT: ENSURE PRODUCTS TABLE HAS ALL REQUIRED APPLICATION COLUMNS
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_slug TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_quantity INT DEFAULT 50;

-- 3. CREATE STORE_SETTINGS TABLE FOR GLOBAL BRANDING & LOGO PERSISTENCE
CREATE TABLE IF NOT EXISTS public.store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name TEXT DEFAULT 'D''NORA LUXURY ATELIER',
  announcement_text TEXT DEFAULT 'Complimentary Pan-India Delivery on all Orders Above ₹15,000 — Atelier Guarantee',
  logo_url TEXT DEFAULT '',
  icon_url TEXT DEFAULT '',
  free_shipping_threshold NUMERIC DEFAULT 15000,
  standard_shipping_fee NUMERIC DEFAULT 500,
  tax_percentage NUMERIC DEFAULT 12,
  contact_email TEXT DEFAULT 'concierge@dnora.luxury',
  concierge_phone TEXT DEFAULT '+91 98765 43210',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default row if empty
INSERT INTO public.store_settings (id, brand_name, announcement_text) VALUES ('00000000-0000-0000-0000-000000000001', 'D''NORA LUXURY ATELIER', 'Complimentary Pan-India Delivery on all Orders Above ₹15,000 — Atelier Guarantee')
ON CONFLICT (id) DO NOTHING;

-- 4. GRANT PERMISSIONS (DISABLE RLS ON PUBLIC E-COMMERCE CATALOG & ADMIN TABLES)
-- This allows the frontend Admin Panel and Storefront to perform CRUD directly on Supabase PostgreSQL
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs DISABLE ROW LEVEL SECURITY;

-- 5. CREATE SUPABASE STORAGE BUCKETS (FOR PRODUCTS, CATEGORIES, BANNERS, SITE-ASSETS)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('products', 'products', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']),
  ('banners', 'banners', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']),
  ('categories', 'categories', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']),
  ('site-assets', 'site-assets', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- 6. STORAGE OBJECT POLICIES (ALLOW PUBLIC READ, UPLOAD, UPDATE, DELETE)
DROP POLICY IF EXISTS "Public Read products" ON storage.objects;
CREATE POLICY "Public Read products" ON storage.objects FOR SELECT USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Public Read banners" ON storage.objects;
CREATE POLICY "Public Read banners" ON storage.objects FOR SELECT USING (bucket_id = 'banners');

DROP POLICY IF EXISTS "Public Read categories" ON storage.objects;
CREATE POLICY "Public Read categories" ON storage.objects FOR SELECT USING (bucket_id = 'categories');

DROP POLICY IF EXISTS "Public Read site-assets" ON storage.objects;
CREATE POLICY "Public Read site-assets" ON storage.objects FOR SELECT USING (bucket_id = 'site-assets');

DROP POLICY IF EXISTS "Allow upload products" ON storage.objects;
CREATE POLICY "Allow upload products" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products');

DROP POLICY IF EXISTS "Allow upload banners" ON storage.objects;
CREATE POLICY "Allow upload banners" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'banners');

DROP POLICY IF EXISTS "Allow upload categories" ON storage.objects;
CREATE POLICY "Allow upload categories" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'categories');

DROP POLICY IF EXISTS "Allow upload site-assets" ON storage.objects;
CREATE POLICY "Allow upload site-assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'site-assets');

DROP POLICY IF EXISTS "Allow update products" ON storage.objects;
CREATE POLICY "Allow update products" ON storage.objects FOR UPDATE USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Allow update banners" ON storage.objects;
CREATE POLICY "Allow update banners" ON storage.objects FOR UPDATE USING (bucket_id = 'banners');

DROP POLICY IF EXISTS "Allow update categories" ON storage.objects;
CREATE POLICY "Allow update categories" ON storage.objects FOR UPDATE USING (bucket_id = 'categories');

DROP POLICY IF EXISTS "Allow update site-assets" ON storage.objects;
CREATE POLICY "Allow update site-assets" ON storage.objects FOR UPDATE USING (bucket_id = 'site-assets');

DROP POLICY IF EXISTS "Allow delete products" ON storage.objects;
CREATE POLICY "Allow delete products" ON storage.objects FOR DELETE USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Allow delete banners" ON storage.objects;
CREATE POLICY "Allow delete banners" ON storage.objects FOR DELETE USING (bucket_id = 'banners');

DROP POLICY IF EXISTS "Allow delete categories" ON storage.objects;
CREATE POLICY "Allow delete categories" ON storage.objects FOR DELETE USING (bucket_id = 'categories');

DROP POLICY IF EXISTS "Allow delete site-assets" ON storage.objects;
CREATE POLICY "Allow delete site-assets" ON storage.objects FOR DELETE USING (bucket_id = 'site-assets');
