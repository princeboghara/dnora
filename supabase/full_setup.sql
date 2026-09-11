-- ==============================================================================
-- D'NORA LUXURY ATELIER — PRODUCTION POSTGRESQL SCHEMA (SUPABASE)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Customer & Admin Accounts)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger to auto-create profile when a new user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    CASE
      WHEN NEW.email ILIKE '%admin%' OR NEW.email ILIKE '%@dnora.luxury' THEN 'super_admin'
      ELSE 'customer'
    END
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. ROLES & USER ROLES (RBAC)
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- 3. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  hero_image_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. COLLECTIONS
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  subtitle TEXT,
  short_description TEXT,
  full_description TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  base_price NUMERIC(12, 2) NOT NULL,
  sale_price NUMERIC(12, 2),
  sku TEXT UNIQUE NOT NULL,
  is_new BOOLEAN DEFAULT FALSE,
  is_bestseller BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  rating NUMERIC(2, 1) DEFAULT 5.0,
  review_count INT DEFAULT 0,
  primary_image TEXT NOT NULL,
  secondary_image TEXT NOT NULL,
  details JSONB DEFAULT '[]'::JSONB,
  care_instructions TEXT,
  shipping_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. COLLECTION PRODUCTS (M:N)
CREATE TABLE IF NOT EXISTS public.collection_products (
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  display_order INT DEFAULT 0,
  PRIMARY KEY (collection_id, product_id)
);

-- 7. PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  display_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. PRODUCT VARIANTS
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT UNIQUE NOT NULL,
  color_name TEXT,
  color_hex TEXT,
  size TEXT,
  volume_ml INT,
  price_adjustment NUMERIC(10, 2) DEFAULT 0.00,
  stock INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. PRODUCT ATTRIBUTES (Flexible category-specific attributes)
CREATE TABLE IF NOT EXISTS public.product_attributes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
  attribute_type TEXT NOT NULL,
  attributes JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. INVENTORY TRACKER
CREATE TABLE IF NOT EXISTS public.inventory (
  sku TEXT PRIMARY KEY,
  stock_quantity INT NOT NULL DEFAULT 0,
  reserved_quantity INT NOT NULL DEFAULT 0,
  low_stock_threshold INT NOT NULL DEFAULT 3,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. ADDRESSES
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  street TEXT NOT NULL,
  landmark TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT DEFAULT 'India' NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  address_type TEXT DEFAULT 'shipping',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 12. CARTS & CART ITEMS
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_token TEXT,
  coupon_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  quantity INT DEFAULT 1 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 13. WISHLISTS & WISHLIST ITEMS
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wishlist_id UUID REFERENCES public.wishlists(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (wishlist_id, product_id)
);

-- 14. COUPONS & USAGE
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10, 2) NOT NULL,
  min_cart_value NUMERIC(10, 2) DEFAULT 0.00,
  max_discount_amount NUMERIC(10, 2),
  start_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  usage_limit INT DEFAULT 100,
  times_used INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.coupon_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  order_id UUID,
  used_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 15. ORDERS & ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'authorized', 'captured', 'failed', 'refunded')),
  payment_method TEXT NOT NULL,
  subtotal NUMERIC(12, 2) NOT NULL,
  discount NUMERIC(12, 2) DEFAULT 0.00,
  shipping_fee NUMERIC(10, 2) DEFAULT 0.00,
  tax NUMERIC(10, 2) DEFAULT 0.00,
  total NUMERIC(12, 2) NOT NULL,
  coupon_code TEXT,
  tracking_number TEXT,
  courier TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_slug TEXT NOT NULL,
  product_image TEXT NOT NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  variant_title TEXT,
  price NUMERIC(12, 2) NOT NULL,
  quantity INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 16. PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  gateway TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  status TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 17. REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  title TEXT NOT NULL,
  comment TEXT NOT NULL,
  verified_purchase BOOLEAN DEFAULT TRUE,
  images TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'hidden')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 18. CMS BANNERS & SECTIONS
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT,
  cta_text TEXT,
  cta_link TEXT,
  desktop_image_url TEXT NOT NULL,
  mobile_image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  type TEXT DEFAULT 'hero' CHECK (type IN ('hero', 'promo', 'editorial')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 19. ADMIN AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID,
  admin_name TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 20. STORE SETTINGS
CREATE TABLE IF NOT EXISTS public.store_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_name TEXT DEFAULT 'D''NORA' NOT NULL,
  currency TEXT DEFAULT 'INR' NOT NULL,
  currency_symbol TEXT DEFAULT '₹' NOT NULL,
  free_shipping_threshold NUMERIC(10, 2) DEFAULT 5000.00,
  standard_shipping_fee NUMERIC(10, 2) DEFAULT 250.00,
  express_shipping_fee NUMERIC(10, 2) DEFAULT 750.00,
  tax_percentage NUMERIC(5, 2) DEFAULT 12.00,
  contact_email TEXT DEFAULT 'concierge@dnora.luxury',
  concierge_phone TEXT DEFAULT '+91 98765 43210',
  announcement_text TEXT DEFAULT 'Complimentary Pan-India White Glove Delivery on orders above ₹5,000'
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Allow public read for active categories" ON public.categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Allow public read for published products" ON public.products FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Allow public read for variants" ON public.product_variants FOR SELECT USING (TRUE);
CREATE POLICY "Allow public read for images" ON public.product_images FOR SELECT USING (TRUE);
CREATE POLICY "Allow public read for attributes" ON public.product_attributes FOR SELECT USING (TRUE);
CREATE POLICY "Allow public read for active collections" ON public.collections FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Allow public read for collection products" ON public.collection_products FOR SELECT USING (TRUE);
CREATE POLICY "Allow public read for approved reviews" ON public.reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "Allow public read for active banners" ON public.banners FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Allow public read for store settings" ON public.store_settings FOR SELECT USING (TRUE);
CREATE POLICY "Allow public read for active coupons" ON public.coupons FOR SELECT USING (is_active = TRUE);

-- Customer Specific Policies
CREATE POLICY "Users can manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own addresses" ON public.addresses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own wishlist" ON public.wishlists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can submit reviews" ON public.reviews FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Users can manage own cart" ON public.carts FOR ALL USING (auth.uid() = user_id OR session_token IS NOT NULL);
CREATE POLICY "Users can manage own cart items" ON public.cart_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND (carts.user_id = auth.uid() OR carts.session_token IS NOT NULL))
);
CREATE POLICY "Users can manage own wishlist items" ON public.wishlist_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.wishlists WHERE wishlists.id = wishlist_items.wishlist_id AND wishlists.user_id = auth.uid())
);

-- Indexes for blazing fast catalog and order queries
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(is_published);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);

-- ==============================================================================
-- SUPABASE STORAGE CONFIGURATION (FOR PRODUCT IMAGES, HERO BANNERS & ASSETS)
-- ==============================================================================

-- 1. Create Public Storage Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('products', 'products', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']),
  ('banners', 'banners', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']),
  ('categories', 'categories', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']),
  ('site-assets', 'site-assets', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Storage Public Read Policies (Allows storefront visitors to view images)
DROP POLICY IF EXISTS "Public Read products" ON storage.objects;
CREATE POLICY "Public Read products" ON storage.objects FOR SELECT USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Public Read banners" ON storage.objects;
CREATE POLICY "Public Read banners" ON storage.objects FOR SELECT USING (bucket_id = 'banners');

DROP POLICY IF EXISTS "Public Read categories" ON storage.objects;
CREATE POLICY "Public Read categories" ON storage.objects FOR SELECT USING (bucket_id = 'categories');

DROP POLICY IF EXISTS "Public Read site-assets" ON storage.objects;
CREATE POLICY "Public Read site-assets" ON storage.objects FOR SELECT USING (bucket_id = 'site-assets');

-- 3. Storage Upload & Management Policies
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



-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

-- ==============================================================================
-- D'NORA LUXURY ATELIER — PRODUCTION SQL SEED DATA (SUPABASE)
-- ==============================================================================

-- 1. CATEGORIES
INSERT INTO public.categories (id, slug, name, tagline, description, image_url, hero_image_url, display_order, is_active, seo_title, seo_description)
VALUES
('a0000000-0000-0000-0000-000000000001', 'handbags', 'Handbags & Clutches', 'Sculptural silhouettes crafted in supple Italian nappa and full-grain leather.', 'Handcrafted by master artisans with bespoke brushed champagne gold hardware and architectural lines.', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1800&q=85', 1, TRUE, 'Luxury Designer Handbags & Evening Clutches | D''NORA', 'Handcrafted luxury handbags and heirloom clutches by D''NORA.'),
('a0000000-0000-0000-0000-000000000002', 'perfumes', 'Haute Parfumerie', 'Noble botanical extracts, rare Mysore sandalwood, and Kashmiri saffron.', 'Extrait de parfum concoctions evoking ancient royal courtyards and modern olfactory poetry.', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1800&q=85', 2, TRUE, 'Artisanal Luxury Perfumes & Pure Extraits | D''NORA', 'Precious perfumes formulated with genuine Indian botanical extraits, oud, and Damascena rose.'),
('a0000000-0000-0000-0000-000000000003', 'jewellery', 'Fine Jewellery', '22K gold vermeil, natural Basra pearls, and hand-cut uncut polki crystals.', 'Statement heirlooms reflecting centuries of Indian goldsmithing reimagined with sleek geometry.', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1800&q=85', 3, TRUE, 'Handcrafted Demi-Fine & Heritage Jewellery | D''NORA', 'Modern heirloom jewellery featuring 22k gold vermeil, lustrous pearls, and architectural statement cuffs.'),
('a0000000-0000-0000-0000-000000000004', 'clothing', 'Artisanal Apparel', 'Mulberry silks, hand-spun linens, and ethereal draped silhouettes.', 'Fluid garments tailored for effortless daytime poise and radiant evening soirees.', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1800&q=85', 4, TRUE, 'Luxury Mulberry Silk & Artisanal Clothing | D''NORA', 'Modern luxury draped silk silhouettes, kaftans, and tailored separates.'),
('a0000000-0000-0000-0000-000000000005', 'purse-charms', 'Purse Charms & Talismans', 'Bespoke gilded amulets, sculpted brass miniatures, and tassel charms.', 'Intricate charms designed to personalize your luxury handbag with individual charisma.', 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1608042314453-ae338d80c427?auto=format&fit=crop&w=1800&q=85', 5, TRUE, 'Handcrafted Gold Purse Charms & Handbag Talismans | D''NORA', 'Elevate your handbag with gilded lotus talismans and baroque pearl charms.'),
('a0000000-0000-0000-0000-000000000006', 'accessories', 'Fine Accessories', 'Hand-rolled twill silk scarves, leather cardholders, and sculpted belts.', 'The subtle accents that complete the wardrobe of the discerning connoisseur.', 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1800&q=85', 6, TRUE, 'Luxury Silk Scarves, Leather Goods & Accessories | D''NORA', 'Artisanal accessories including pure twill silk scarves and monogrammed cardholders.')
ON CONFLICT (slug) DO NOTHING;

-- 2. PRODUCTS
INSERT INTO public.products (id, slug, name, subtitle, short_description, full_description, category_id, base_price, sale_price, sku, is_new, is_bestseller, is_featured, is_published, rating, review_count, primary_image, secondary_image, details, care_instructions, shipping_info)
VALUES
('b0000000-0000-0000-0000-000000000001', 'the-noor-sculpted-nappa-tote', 'The Noor Sculpted Tote', 'Calfskin Nappa with Brushed Gold Hardware', 'An architectural statement tote crafted in supple, full-grain ivory nappa leather.', 'The Noor Tote embodies the intersection of minimalist modernist sculpture and everyday utility. Handcrafted in our bespoke leather atelier from ultra-supple full-grain calfskin.', 'a0000000-0000-0000-0000-000000000001', 34500.00, 31500.00, 'DNR-HB-NOOR-01', TRUE, TRUE, TRUE, TRUE, 4.9, 28, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=80', '["Handcrafted with Italian full-grain nappa leather", "Reinforced protective gold base studs", "Lined with water-resistant micro-suede"]'::JSONB, 'Store in provided dust bag.', 'Complimentary white-glove shipping across India.'),
('b0000000-0000-0000-0000-000000000002', 'oud-saffron-royal-extrait-de-parfum', 'Oud & Saffron Royal', 'Extrait de Parfum • 32% Noble Botanical Oil Concentration', 'A decadent, smoky-sweet harmony of sun-dried Kashmiri saffron and aged Assam agarwood.', 'A sensory tapestry inspired by royal darbars and twilight palace gardens. Oud & Saffron Royal opens with a radiant burst of certified Kashmiri Mongra saffron, pink peppercorn, and wild bitter orange.', 'a0000000-0000-0000-0000-000000000002', 18500.00, 16500.00, 'DNR-PF-SAFOUD-01', TRUE, TRUE, TRUE, TRUE, 5.0, 42, 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=80', '["Concentrated at 32% pure perfume oils", "Heavy French crystal flacon with magnetic 24K gold cap"]'::JSONB, 'Store in a cool dark place.', 'Complimentary luxury insured shipping.'),
('b0000000-0000-0000-0000-000000000003', 'the-jodha-22k-gold-basra-pearl-choker', 'The Jodha Pearl Choker', '22K Gold Vermeil with Natural Basra River Pearls', 'A sculpted collar choker alternating brushed gold crescent links with luminous hand-strung pearls.', 'The Jodha Choker reimagines traditional Rajasthani royal neckpieces into a sleek, minimalist contemporary collar. Cast in heavy 925 sterling silver layered with 5 microns of 22k yellow gold vermeil.', 'a0000000-0000-0000-0000-000000000003', 24500.00, 22000.00, 'DNR-JW-JODHA-01', TRUE, TRUE, TRUE, TRUE, 4.9, 31, 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=80', '["Natural Grade AAA untreated pearls", "Heavy 22K gold vermeil plating tested for lifelong lustre"]'::JSONB, 'Avoid spraying perfume directly onto pearls.', 'Delivered in signature velvet keepsake case.'),
('b0000000-0000-0000-0000-000000000004', 'handwoven-mulberry-silk-draped-saree-gown', 'The Aurelia Draped Silk Gown', '100% Handwoven Mulberry Silk with Zari Accent', 'A pre-draped contemporary saree-gown sculpted from handwoven champagne mulberry silk.', 'Effortless glamour meets timeless Indian craftsmanship. The Aurelia Gown fuses the majestic drape of an Indian saree with the sleek silhouette of a modern evening gown.', 'a0000000-0000-0000-0000-000000000004', 48500.00, 44000.00, 'DNR-CL-AURELIA-01', TRUE, TRUE, TRUE, TRUE, 4.9, 22, 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80', '["Woven on heritage handlooms in Varanasi", "Interior corset boning for structured bust support"]'::JSONB, 'Professional dry clean only.', 'Shipped in bespoke D''NORA garment travel bag.'),
('b0000000-0000-0000-0000-000000000005', 'gilded-lotus-keshi-pearl-purse-charm', 'The Padmam Lotus Charm', '24K Gold Plated Brass & Organic Keshi Pearl', 'A talismanic bloom charm that clips seamlessly onto any handbag handle or zip pull.', 'The Padmam Charm pays homage to the divine Indian lotus, symbol of purity and rebirth. Sculpted in high-relief solid brass and dipped in 24k gold.', 'a0000000-0000-0000-0000-000000000005', 6800.00, 5900.00, 'DNR-PC-LOTUS-01', TRUE, TRUE, TRUE, TRUE, 5.0, 36, 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1608042314453-ae338d80c427?auto=format&fit=crop&w=1200&q=80', '["Natural untreated iridescent Keshi pearl", "Heavy-duty micro-spring snap clasp"]'::JSONB, 'Wipe with soft dry cloth.', 'Dispatches within 24 hours.'),
('b0000000-0000-0000-0000-000000000006', 'hand-rolled-kashmiri-flora-silk-twill-scarf', 'The Shalimar Silk Twill Scarf', '100% Pure Mulberry Silk Twill (90 x 90 cm)', 'A decadent square foulard depicting historic Mughal pleasure gardens.', 'Printed on heavy 18-momme pure mulberry silk twill, The Shalimar Scarf portrays the flora, fountains, and nightingales of Kashmir''s iconic Shalimar Bagh.', 'a0000000-0000-0000-0000-000000000006', 12500.00, 11000.00, 'DNR-AC-SHAL-01', TRUE, TRUE, TRUE, TRUE, 4.9, 27, 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80', '["100% pure Grade 6A mulberry silk", "Artisanal hand-rolled and hand-sewn hem"]'::JSONB, 'Specialist dry clean only.', 'Dispatched in signature gift box.')
ON CONFLICT (slug) DO NOTHING;

-- 3. COUPONS
INSERT INTO public.coupons (id, code, description, discount_type, discount_value, min_cart_value, max_discount_amount, start_date, end_date, usage_limit, times_used, is_active)
VALUES
('c0000000-0000-0000-0000-000000000001', 'WELCOME10', 'Enjoy 10% privilege on your debut atelier acquisition', 'percentage', 10.00, 5000.00, 5000.00, NOW(), NOW() + INTERVAL '1 year', 1000, 142, TRUE),
('c0000000-0000-0000-0000-000000000002', 'ROYALVVIP', 'Flat ₹5,000 privilege on celebratory orders above ₹40,000', 'fixed', 5000.00, 40000.00, NULL, NOW(), NOW() + INTERVAL '1 year', 250, 38, TRUE)
ON CONFLICT (code) DO NOTHING;

-- 4. BANNERS
INSERT INTO public.banners (id, title, subtitle, cta_text, cta_link, desktop_image_url, mobile_image_url, is_active, display_order, type)
VALUES
('d0000000-0000-0000-0000-000000000001', 'THE ART OF EVERYDAY LUXURY', 'Handcrafted Italian Nappa Leather, Haute Parfumerie & Modern Indian Heirlooms', 'DISCOVER THE ATELIER', '/shop', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=2000&q=85', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85', TRUE, 1, 'hero'),
('d0000000-0000-0000-0000-000000000002', 'THE SCENT OF NOBILITY', 'Rare Kashmiri Saffron & Aged Assam Agarwood distilled into pure Extrait de Parfum.', 'EXPLORE HAUTE PARFUMERIE', '/shop/perfumes', 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1800&q=85', NULL, TRUE, 2, 'editorial')
ON CONFLICT (id) DO NOTHING;
