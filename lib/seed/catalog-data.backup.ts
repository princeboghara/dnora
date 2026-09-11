import { Category, Product, Collection, Banner, Coupon, StoreSettings, Review } from "@/types";

export const INITIAL_CATEGORIES: Category[] = [
  {
    "id": "cat-handbags",
    "slug": "handbags",
    "name": "Shoulder Bags & Handbags",
    "tagline": "Effortless silhouettes tailored in supple pebbled vegan leather with bespoke hardware.",
    "description": "Designed for day-to-evening transitions with spacious main compartments, internal slip pockets, and signature brushed gold details.",
    "image_url": "/images/categories/view-all.jpg",
    "hero_image_url": "/images/banners/hero-1-desktop.jpg",
    "display_order": 1,
    "is_active": true,
    "seo_title": "Designer Shoulder Bags & Handbags for Women | DNORA",
    "seo_description": "Shop premium designer shoulder bags and handbags with dual handles and compartments from DNORA.",
    "product_count": 8
  },
  {
    "id": "cat-tote-bags",
    "slug": "tote-bags",
    "name": "Tote Bags",
    "tagline": "Spacious everyday totes designed for work, travel, and leisure.",
    "description": "Generously proportioned totes featuring laptop sleeves, secure zip closures, and reinforced shoulder straps.",
    "image_url": "/images/categories/tote-bags.jpg",
    "hero_image_url": "/images/banners/hero-3-desktop.jpg",
    "display_order": 2,
    "is_active": true,
    "seo_title": "Luxury Tote Bags for Women | DNORA",
    "seo_description": "Explore spacious workwear and casual tote bags crafted with refined minimalism.",
    "product_count": 6
  },
  {
    "id": "cat-sling-bags",
    "slug": "sling-bags",
    "name": "Sling Bags",
    "tagline": "Hands-free elegance with versatile adjustable crossbody straps.",
    "description": "Compact yet surprisingly spacious slings adorned with subtle gold accents and quick-access magnetic flap closures.",
    "image_url": "/images/categories/sling-bags.jpg",
    "hero_image_url": "/images/banners/hero-1-desktop.jpg",
    "display_order": 3,
    "is_active": true,
    "seo_title": "Women's Designer Crossbody & Sling Bags | DNORA",
    "seo_description": "Shop everyday lightweight crossbody and sling bags from DNORA.",
    "product_count": 6
  },
  {
    "id": "cat-satchels",
    "slug": "satchels",
    "name": "Satchel Bags",
    "tagline": "Structured poise and timeless executive style for the modern woman.",
    "description": "Structured silhouette satchels engineered to hold their shape with pristine dual top handles and detachable shoulder straps.",
    "image_url": "/images/categories/satchel-bags.jpg",
    "hero_image_url": "/images/banners/hero-2-desktop.jpg",
    "display_order": 4,
    "is_active": true,
    "seo_title": "Structured Satchel Bags | DNORA",
    "seo_description": "Discover sophisticated satchel bags engineered for poise and elegance.",
    "product_count": 5
  },
  {
    "id": "cat-clutches",
    "slug": "clutches",
    "name": "Clutches & Wristlets",
    "tagline": "Sleek evening companions with detachable wrist loops and gilded chains.",
    "description": "Sleek and dazzling clutches curated for gala evenings, cocktail soirees, and weddings.",
    "image_url": "/images/categories/clutches.jpg",
    "hero_image_url": "/images/banners/hero-2-desktop.jpg",
    "display_order": 5,
    "is_active": true,
    "seo_title": "Designer Clutches & Evening Bags | DNORA",
    "seo_description": "Shop bridal, festive, and party clutch bags from DNORA.",
    "product_count": 4
  },
  {
    "id": "cat-backpacks",
    "slug": "backpacks",
    "name": "Backpacks",
    "tagline": "Contemporary ergonomic style for the urban commuter and traveler.",
    "description": "Sleek backpacks with padded tablet sleeves, anti-theft back zips, and water-resistant finishes.",
    "image_url": "/images/categories/backpacks.jpg",
    "hero_image_url": "/images/banners/hero-1-desktop.jpg",
    "display_order": 6,
    "is_active": true,
    "seo_title": "Women's Designer Backpacks | DNORA",
    "seo_description": "Discover stylish women's backpacks crafted with luxury vegan leather.",
    "product_count": 4
  },
  {
    "id": "cat-perfumes",
    "slug": "perfumes",
    "name": "Haute Parfumerie & Gifting",
    "tagline": "Noble botanical extracts, rare Mysore sandalwood, and Kashmiri saffron.",
    "description": "Extrait de parfum concoctions evoking ancient royal courtyards, opulent velvet nights, and modern olfactory poetry.",
    "image_url": "/images/categories/perfumes.jpg",
    "hero_image_url": "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1800&q=85",
    "display_order": 7,
    "is_active": true,
    "seo_title": "Luxury Artisanal Perfumes & Gift Sets | DNORA",
    "seo_description": "Discover precious perfumes formulated with botanical extraits and oud.",
    "product_count": 4
  },
  {
    "id": "cat-purse-charms",
    "slug": "purse-charms",
    "name": "Purse Charms & Talismans",
    "tagline": "Bespoke gilded amulets, sculpted brass miniatures, and tassel charms.",
    "description": "Intricate charms designed to personalize your luxury handbag with individual charisma.",
    "image_url": "https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=1200&q=80",
    "hero_image_url": "https://images.unsplash.com/photo-1608042314453-ae338d80c427?auto=format&fit=crop&w=1800&q=85",
    "display_order": 8,
    "is_active": true,
    "seo_title": "Handcrafted Gold Purse Charms | DNORA",
    "seo_description": "Elevate your handbag with gilded charms and sculpted leather bag accents.",
    "product_count": 3
  },
  {
    "id": "cat-accessories",
    "slug": "accessories",
    "name": "Wallets & Small Leather Goods",
    "tagline": "Compact bifold wallets, RFID cardholders, and fine accessories.",
    "description": "Functional luxury crafted with precision down to the smallest stitch.",
    "image_url": "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1200&q=80",
    "hero_image_url": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1800&q=85",
    "display_order": 9,
    "is_active": true,
    "seo_title": "Designer Leather Wallets & Cardholders | DNORA",
    "seo_description": "Shop luxury bifold wallets and RFID cardholders.",
    "product_count": 3
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    "id": "prod-dnora-1",
    "slug": "texas-alessia-brown-shoulder-bag",
    "name": "Texas Alessia Brown Shoulder Bag",
    "subtitle": "Classic Shoulder Bag",
    "short_description": "Exquisitely tailored texas alessia brown shoulder bag with signature hardware and spacious interior.",
    "full_description": "Designed for modern versatility, the Texas Alessia Brown Shoulder Bag combines minimalist poise with thoughtful utility. Crafted from premium vegan textured leather with reinforced top handles, smooth glide zips, and bespoke brushed gold hardware. Perfect for daily commutes, weekend brunches, and evening outings.",
    "category_slug": "handbags",
    "category_id": "cat-handbags",
    "base_price": 3495,
    "sale_price": 2446,
    "is_new": true,
    "is_bestseller": true,
    "is_featured": true,
    "is_published": true,
    "rating": 4.5,
    "review_count": 45,
    "primary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00576BROWN-1.webp?v=1787132169",
    "secondary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00576BROWN-2.webp?v=1787132169",
    "images": [
      {
        "id": "img-1-1",
        "product_id": "prod-dnora-1",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00576BROWN-1.webp?v=1787132169",
        "alt_text": "Texas Alessia Brown Shoulder Bag - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-1-2",
        "product_id": "prod-dnora-1",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00576BROWN-2.webp?v=1787132169",
        "alt_text": "Texas Alessia Brown Shoulder Bag - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-1-3",
        "product_id": "prod-dnora-1",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00576BROWN-3.webp?v=1787132169",
        "alt_text": "Texas Alessia Brown Shoulder Bag - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-1-4",
        "product_id": "prod-dnora-1",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00576BROWN-4.webp?v=1787132169",
        "alt_text": "Texas Alessia Brown Shoulder Bag - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-1-5",
        "product_id": "prod-dnora-1",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00576BROWN-5.webp?v=1787132169",
        "alt_text": "Texas Alessia Brown Shoulder Bag - View 5",
        "display_order": 5,
        "is_primary": false
      },
      {
        "id": "img-1-6",
        "product_id": "prod-dnora-1",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00576BROWN-6.webp?v=1787132169",
        "alt_text": "Texas Alessia Brown Shoulder Bag - View 6",
        "display_order": 6,
        "is_primary": false
      },
      {
        "id": "img-1-7",
        "product_id": "prod-dnora-1",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00576BROWN-7.webp?v=1787132169",
        "alt_text": "Texas Alessia Brown Shoulder Bag - View 7",
        "display_order": 7,
        "is_primary": false
      }
    ],
    "variants": [
      {
        "id": "var-1-std",
        "product_id": "prod-dnora-1",
        "sku": "DNR-TEXAS-ALES-1",
        "color_name": "Brown",
        "size": "One Size",
        "price_adjustment": 0,
        "stock": 25,
        "in_stock": true
      }
    ],
    "details": [
      "Crafted with signature premium vegan leather with supple pebble grain",
      "Reinforced top handles and adjustable/detachable shoulder strap",
      "Spacious main compartment with internal zippered organizer pocket",
      "Signature brushed gold metal accents and engraved DNORA logo emblem",
      "Water-resistant protective inner fabric lining"
    ],
    "care_instructions": "Wipe clean with a soft dry cloth. Keep away from direct sunlight and extreme moisture. Store in provided protective dust bag.",
    "shipping_info": "Dispatched within 24 hours. Free express delivery across India. 7-day hassle-free return window.",
    "stock_quantity": 45,
    "sku": "DNR-TEXAS-ALES-1",
    "created_at": "2026-09-11T13:29:19.409Z",
    "tags": [
      "bestseller",
      "handbag",
      "luxury",
      "dnora",
      "handbags"
    ]
  },
  {
    "id": "prod-dnora-2",
    "slug": "texas-alessia-off-white-shoulder-bag",
    "name": "Texas Alessia Off-White Shoulder Bag",
    "subtitle": "Classic Shoulder Bag",
    "short_description": "Exquisitely tailored texas alessia off-white shoulder bag with signature hardware and spacious interior.",
    "full_description": "Designed for modern versatility, the Texas Alessia Off-White Shoulder Bag combines minimalist poise with thoughtful utility. Crafted from premium vegan textured leather with reinforced top handles, smooth glide zips, and bespoke brushed gold hardware. Perfect for daily commutes, weekend brunches, and evening outings.",
    "category_slug": "handbags",
    "category_id": "cat-handbags",
    "base_price": 3495,
    "sale_price": 2446,
    "is_new": true,
    "is_bestseller": false,
    "is_featured": false,
    "is_published": true,
    "rating": 4.6,
    "review_count": 64,
    "primary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00576OFFWHITE-1.webp?v=1787132185",
    "secondary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00576OFFWHITE-2.webp?v=1787132185",
    "images": [
      {
        "id": "img-2-1",
        "product_id": "prod-dnora-2",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00576OFFWHITE-1.webp?v=1787132185",
        "alt_text": "Texas Alessia Off-White Shoulder Bag - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-2-2",
        "product_id": "prod-dnora-2",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00576OFFWHITE-2.webp?v=1787132185",
        "alt_text": "Texas Alessia Off-White Shoulder Bag - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-2-3",
        "product_id": "prod-dnora-2",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00576OFFWHITE-3.webp?v=1787132185",
        "alt_text": "Texas Alessia Off-White Shoulder Bag - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-2-4",
        "product_id": "prod-dnora-2",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00576OFFWHITE-4.webp?v=1787132185",
        "alt_text": "Texas Alessia Off-White Shoulder Bag - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-2-5",
        "product_id": "prod-dnora-2",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00576OFFWHITE-5.webp?v=1787132185",
        "alt_text": "Texas Alessia Off-White Shoulder Bag - View 5",
        "display_order": 5,
        "is_primary": false
      },
      {
        "id": "img-2-6",
        "product_id": "prod-dnora-2",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00576OFFWHITE-6.webp?v=1787132185",
        "alt_text": "Texas Alessia Off-White Shoulder Bag - View 6",
        "display_order": 6,
        "is_primary": false
      },
      {
        "id": "img-2-7",
        "product_id": "prod-dnora-2",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00576OFFWHITE-7.webp?v=1787132185",
        "alt_text": "Texas Alessia Off-White Shoulder Bag - View 7",
        "display_order": 7,
        "is_primary": false
      }
    ],
    "variants": [
      {
        "id": "var-2-std",
        "product_id": "prod-dnora-2",
        "sku": "DNR-TEXAS-ALES-2",
        "color_name": "Off-White",
        "size": "One Size",
        "price_adjustment": 0,
        "stock": 26,
        "in_stock": true
      }
    ],
    "details": [
      "Crafted with signature premium vegan leather with supple pebble grain",
      "Reinforced top handles and adjustable/detachable shoulder strap",
      "Spacious main compartment with internal zippered organizer pocket",
      "Signature brushed gold metal accents and engraved DNORA logo emblem",
      "Water-resistant protective inner fabric lining"
    ],
    "care_instructions": "Wipe clean with a soft dry cloth. Keep away from direct sunlight and extreme moisture. Store in provided protective dust bag.",
    "shipping_info": "Dispatched within 24 hours. Free express delivery across India. 7-day hassle-free return window.",
    "stock_quantity": 45,
    "sku": "DNR-TEXAS-ALES-2",
    "created_at": "2026-09-10T13:29:19.422Z",
    "tags": [
      "bestseller",
      "handbag",
      "luxury",
      "dnora",
      "handbags"
    ]
  },
  {
    "id": "prod-dnora-3",
    "slug": "ella-arden-olive-sling-bag",
    "name": "Ella Arden Olive Sling Bag",
    "subtitle": "Crossbody Sling",
    "short_description": "Exquisitely tailored ella arden olive sling bag with signature hardware and spacious interior.",
    "full_description": "Designed for modern versatility, the Ella Arden Olive Sling Bag combines minimalist poise with thoughtful utility. Crafted from premium vegan textured leather with reinforced top handles, smooth glide zips, and bespoke brushed gold hardware. Perfect for daily commutes, weekend brunches, and evening outings.",
    "category_slug": "sling-bags",
    "category_id": "cat-sling-bags",
    "base_price": 3495,
    "sale_price": 2446,
    "is_new": true,
    "is_bestseller": false,
    "is_featured": false,
    "is_published": true,
    "rating": 4.7,
    "review_count": 83,
    "primary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00575OLIVE-1.webp?v=1787131983",
    "secondary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00575OLIVE-2.webp?v=1787131982",
    "images": [
      {
        "id": "img-3-1",
        "product_id": "prod-dnora-3",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00575OLIVE-1.webp?v=1787131983",
        "alt_text": "Ella Arden Olive Sling Bag - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-3-2",
        "product_id": "prod-dnora-3",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00575OLIVE-2.webp?v=1787131982",
        "alt_text": "Ella Arden Olive Sling Bag - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-3-3",
        "product_id": "prod-dnora-3",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00575OLIVE-3.webp?v=1787131983",
        "alt_text": "Ella Arden Olive Sling Bag - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-3-4",
        "product_id": "prod-dnora-3",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00575OLIVE-4.webp?v=1787131982",
        "alt_text": "Ella Arden Olive Sling Bag - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-3-5",
        "product_id": "prod-dnora-3",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00575OLIVE-5.webp?v=1787131982",
        "alt_text": "Ella Arden Olive Sling Bag - View 5",
        "display_order": 5,
        "is_primary": false
      },
      {
        "id": "img-3-6",
        "product_id": "prod-dnora-3",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00575OLIVE-6.webp?v=1787131982",
        "alt_text": "Ella Arden Olive Sling Bag - View 6",
        "display_order": 6,
        "is_primary": false
      },
      {
        "id": "img-3-7",
        "product_id": "prod-dnora-3",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00575OLIVE-7.webp?v=1787131983",
        "alt_text": "Ella Arden Olive Sling Bag - View 7",
        "display_order": 7,
        "is_primary": false
      }
    ],
    "variants": [
      {
        "id": "var-3-std",
        "product_id": "prod-dnora-3",
        "sku": "DNR-ELLA-ARDEN-3",
        "color_name": "Olive",
        "size": "One Size",
        "price_adjustment": 0,
        "stock": 27,
        "in_stock": true
      }
    ],
    "details": [
      "Crafted with signature premium vegan leather with supple pebble grain",
      "Reinforced top handles and adjustable/detachable shoulder strap",
      "Spacious main compartment with internal zippered organizer pocket",
      "Signature brushed gold metal accents and engraved DNORA logo emblem",
      "Water-resistant protective inner fabric lining"
    ],
    "care_instructions": "Wipe clean with a soft dry cloth. Keep away from direct sunlight and extreme moisture. Store in provided protective dust bag.",
    "shipping_info": "Dispatched within 24 hours. Free express delivery across India. 7-day hassle-free return window.",
    "stock_quantity": 45,
    "sku": "DNR-ELLA-ARDEN-3",
    "created_at": "2026-09-09T13:29:19.422Z",
    "tags": [
      "bestseller",
      "handbag",
      "luxury",
      "dnora",
      "sling-bags"
    ]
  },
  {
    "id": "prod-dnora-4",
    "slug": "ella-arden-beige-sling-bag",
    "name": "Ella Arden Beige Sling Bag",
    "subtitle": "Crossbody Sling",
    "short_description": "Exquisitely tailored ella arden beige sling bag with signature hardware and spacious interior.",
    "full_description": "Designed for modern versatility, the Ella Arden Beige Sling Bag combines minimalist poise with thoughtful utility. Crafted from premium vegan textured leather with reinforced top handles, smooth glide zips, and bespoke brushed gold hardware. Perfect for daily commutes, weekend brunches, and evening outings.",
    "category_slug": "sling-bags",
    "category_id": "cat-sling-bags",
    "base_price": 3495,
    "sale_price": 2446,
    "is_new": true,
    "is_bestseller": true,
    "is_featured": false,
    "is_published": true,
    "rating": 4.8,
    "review_count": 102,
    "primary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00575BEIGE-1.webp?v=1787131895",
    "secondary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00575BEIGE-2.webp?v=1787131895",
    "images": [
      {
        "id": "img-4-1",
        "product_id": "prod-dnora-4",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00575BEIGE-1.webp?v=1787131895",
        "alt_text": "Ella Arden Beige Sling Bag - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-4-2",
        "product_id": "prod-dnora-4",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00575BEIGE-2.webp?v=1787131895",
        "alt_text": "Ella Arden Beige Sling Bag - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-4-3",
        "product_id": "prod-dnora-4",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00575BEIGE-3.webp?v=1787131895",
        "alt_text": "Ella Arden Beige Sling Bag - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-4-4",
        "product_id": "prod-dnora-4",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00575BEIGE-4.webp?v=1787131895",
        "alt_text": "Ella Arden Beige Sling Bag - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-4-5",
        "product_id": "prod-dnora-4",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00575BEIGE-5.webp?v=1787131895",
        "alt_text": "Ella Arden Beige Sling Bag - View 5",
        "display_order": 5,
        "is_primary": false
      },
      {
        "id": "img-4-6",
        "product_id": "prod-dnora-4",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00575BEIGE-6.webp?v=1787131895",
        "alt_text": "Ella Arden Beige Sling Bag - View 6",
        "display_order": 6,
        "is_primary": false
      },
      {
        "id": "img-4-7",
        "product_id": "prod-dnora-4",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00575BEIGE-7.webp?v=1787131895",
        "alt_text": "Ella Arden Beige Sling Bag - View 7",
        "display_order": 7,
        "is_primary": false
      }
    ],
    "variants": [
      {
        "id": "var-4-std",
        "product_id": "prod-dnora-4",
        "sku": "DNR-ELLA-ARDEN-4",
        "color_name": "Beige",
        "size": "One Size",
        "price_adjustment": 0,
        "stock": 28,
        "in_stock": true
      }
    ],
    "details": [
      "Crafted with signature premium vegan leather with supple pebble grain",
      "Reinforced top handles and adjustable/detachable shoulder strap",
      "Spacious main compartment with internal zippered organizer pocket",
      "Signature brushed gold metal accents and engraved DNORA logo emblem",
      "Water-resistant protective inner fabric lining"
    ],
    "care_instructions": "Wipe clean with a soft dry cloth. Keep away from direct sunlight and extreme moisture. Store in provided protective dust bag.",
    "shipping_info": "Dispatched within 24 hours. Free express delivery across India. 7-day hassle-free return window.",
    "stock_quantity": 45,
    "sku": "DNR-ELLA-ARDEN-4",
    "created_at": "2026-09-08T13:29:19.422Z",
    "tags": [
      "bestseller",
      "handbag",
      "luxury",
      "dnora",
      "sling-bags"
    ]
  },
  {
    "id": "prod-dnora-5",
    "slug": "ella-arden-brown-sling-bag",
    "name": "Ella Arden Brown Sling Bag",
    "subtitle": "Crossbody Sling",
    "short_description": "Exquisitely tailored ella arden brown sling bag with signature hardware and spacious interior.",
    "full_description": "Designed for modern versatility, the Ella Arden Brown Sling Bag combines minimalist poise with thoughtful utility. Crafted from premium vegan textured leather with reinforced top handles, smooth glide zips, and bespoke brushed gold hardware. Perfect for daily commutes, weekend brunches, and evening outings.",
    "category_slug": "sling-bags",
    "category_id": "cat-sling-bags",
    "base_price": 3495,
    "sale_price": 2446,
    "is_new": true,
    "is_bestseller": false,
    "is_featured": true,
    "is_published": true,
    "rating": 4.9,
    "review_count": 121,
    "primary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00575BROWN-1.webp?v=1787131906",
    "secondary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00575BROWN-2.webp?v=1787131906",
    "images": [
      {
        "id": "img-5-1",
        "product_id": "prod-dnora-5",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00575BROWN-1.webp?v=1787131906",
        "alt_text": "Ella Arden Brown Sling Bag - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-5-2",
        "product_id": "prod-dnora-5",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00575BROWN-2.webp?v=1787131906",
        "alt_text": "Ella Arden Brown Sling Bag - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-5-3",
        "product_id": "prod-dnora-5",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00575BROWN-3.webp?v=1787131906",
        "alt_text": "Ella Arden Brown Sling Bag - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-5-4",
        "product_id": "prod-dnora-5",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00575BROWN-4.webp?v=1787131906",
        "alt_text": "Ella Arden Brown Sling Bag - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-5-5",
        "product_id": "prod-dnora-5",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00575BROWN-5.webp?v=1787131906",
        "alt_text": "Ella Arden Brown Sling Bag - View 5",
        "display_order": 5,
        "is_primary": false
      },
      {
        "id": "img-5-6",
        "product_id": "prod-dnora-5",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00575BROWN-6.webp?v=1787131906",
        "alt_text": "Ella Arden Brown Sling Bag - View 6",
        "display_order": 6,
        "is_primary": false
      },
      {
        "id": "img-5-7",
        "product_id": "prod-dnora-5",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00575BROWN-7.webp?v=1787131906",
        "alt_text": "Ella Arden Brown Sling Bag - View 7",
        "display_order": 7,
        "is_primary": false
      }
    ],
    "variants": [
      {
        "id": "var-5-std",
        "product_id": "prod-dnora-5",
        "sku": "DNR-ELLA-ARDEN-5",
        "color_name": "Brown",
        "size": "One Size",
        "price_adjustment": 0,
        "stock": 29,
        "in_stock": true
      }
    ],
    "details": [
      "Crafted with signature premium vegan leather with supple pebble grain",
      "Reinforced top handles and adjustable/detachable shoulder strap",
      "Spacious main compartment with internal zippered organizer pocket",
      "Signature brushed gold metal accents and engraved DNORA logo emblem",
      "Water-resistant protective inner fabric lining"
    ],
    "care_instructions": "Wipe clean with a soft dry cloth. Keep away from direct sunlight and extreme moisture. Store in provided protective dust bag.",
    "shipping_info": "Dispatched within 24 hours. Free express delivery across India. 7-day hassle-free return window.",
    "stock_quantity": 45,
    "sku": "DNR-ELLA-ARDEN-5",
    "created_at": "2026-09-07T13:29:19.422Z",
    "tags": [
      "bestseller",
      "handbag",
      "luxury",
      "dnora",
      "sling-bags"
    ]
  },
  {
    "id": "prod-dnora-6",
    "slug": "ella-arden-coffee-sling-bag",
    "name": "Ella Arden Coffee Sling Bag",
    "subtitle": "Crossbody Sling",
    "short_description": "Exquisitely tailored ella arden coffee sling bag with signature hardware and spacious interior.",
    "full_description": "Designed for modern versatility, the Ella Arden Coffee Sling Bag combines minimalist poise with thoughtful utility. Crafted from premium vegan textured leather with reinforced top handles, smooth glide zips, and bespoke brushed gold hardware. Perfect for daily commutes, weekend brunches, and evening outings.",
    "category_slug": "sling-bags",
    "category_id": "cat-sling-bags",
    "base_price": 3495,
    "sale_price": 2446,
    "is_new": true,
    "is_bestseller": false,
    "is_featured": false,
    "is_published": true,
    "rating": 4.5,
    "review_count": 140,
    "primary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00575COFFEE-1.webp?v=1787131953",
    "secondary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00575COFFEE-2.webp?v=1787131953",
    "images": [
      {
        "id": "img-6-1",
        "product_id": "prod-dnora-6",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00575COFFEE-1.webp?v=1787131953",
        "alt_text": "Ella Arden Coffee Sling Bag - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-6-2",
        "product_id": "prod-dnora-6",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00575COFFEE-2.webp?v=1787131953",
        "alt_text": "Ella Arden Coffee Sling Bag - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-6-3",
        "product_id": "prod-dnora-6",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00575COFFEE-3.webp?v=1787131953",
        "alt_text": "Ella Arden Coffee Sling Bag - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-6-4",
        "product_id": "prod-dnora-6",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00575COFFEE-4.webp?v=1787131953",
        "alt_text": "Ella Arden Coffee Sling Bag - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-6-5",
        "product_id": "prod-dnora-6",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00575COFFEE-5.webp?v=1787131953",
        "alt_text": "Ella Arden Coffee Sling Bag - View 5",
        "display_order": 5,
        "is_primary": false
      },
      {
        "id": "img-6-6",
        "product_id": "prod-dnora-6",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00575COFFEE-6.webp?v=1787131953",
        "alt_text": "Ella Arden Coffee Sling Bag - View 6",
        "display_order": 6,
        "is_primary": false
      },
      {
        "id": "img-6-7",
        "product_id": "prod-dnora-6",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00575COFFEE-7.webp?v=1787131953",
        "alt_text": "Ella Arden Coffee Sling Bag - View 7",
        "display_order": 7,
        "is_primary": false
      }
    ],
    "variants": [
      {
        "id": "var-6-std",
        "product_id": "prod-dnora-6",
        "sku": "DNR-ELLA-ARDEN-6",
        "color_name": "Coffee",
        "size": "One Size",
        "price_adjustment": 0,
        "stock": 30,
        "in_stock": true
      }
    ],
    "details": [
      "Crafted with signature premium vegan leather with supple pebble grain",
      "Reinforced top handles and adjustable/detachable shoulder strap",
      "Spacious main compartment with internal zippered organizer pocket",
      "Signature brushed gold metal accents and engraved DNORA logo emblem",
      "Water-resistant protective inner fabric lining"
    ],
    "care_instructions": "Wipe clean with a soft dry cloth. Keep away from direct sunlight and extreme moisture. Store in provided protective dust bag.",
    "shipping_info": "Dispatched within 24 hours. Free express delivery across India. 7-day hassle-free return window.",
    "stock_quantity": 45,
    "sku": "DNR-ELLA-ARDEN-6",
    "created_at": "2026-09-06T13:29:19.422Z",
    "tags": [
      "bestseller",
      "handbag",
      "luxury",
      "dnora",
      "sling-bags"
    ]
  },
  {
    "id": "prod-dnora-7",
    "slug": "ella-luna-black-sling-bag",
    "name": "Ella Luna Black Sling Bag",
    "subtitle": "Crossbody Sling",
    "short_description": "Exquisitely tailored ella luna black sling bag with signature hardware and spacious interior.",
    "full_description": "Designed for modern versatility, the Ella Luna Black Sling Bag combines minimalist poise with thoughtful utility. Crafted from premium vegan textured leather with reinforced top handles, smooth glide zips, and bespoke brushed gold hardware. Perfect for daily commutes, weekend brunches, and evening outings.",
    "category_slug": "sling-bags",
    "category_id": "cat-sling-bags",
    "base_price": 3995,
    "sale_price": 2796,
    "is_new": true,
    "is_bestseller": true,
    "is_featured": false,
    "is_published": true,
    "rating": 4.6,
    "review_count": 159,
    "primary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00574BLACK-1.webp?v=1787131605",
    "secondary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00574BLACK-2.webp?v=1787131605",
    "images": [
      {
        "id": "img-7-1",
        "product_id": "prod-dnora-7",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00574BLACK-1.webp?v=1787131605",
        "alt_text": "Ella Luna Black Sling Bag - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-7-2",
        "product_id": "prod-dnora-7",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00574BLACK-2.webp?v=1787131605",
        "alt_text": "Ella Luna Black Sling Bag - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-7-3",
        "product_id": "prod-dnora-7",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00574BLACK-3.webp?v=1787131605",
        "alt_text": "Ella Luna Black Sling Bag - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-7-4",
        "product_id": "prod-dnora-7",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00574BLACK-4.webp?v=1787131605",
        "alt_text": "Ella Luna Black Sling Bag - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-7-5",
        "product_id": "prod-dnora-7",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00574BLACK-5.webp?v=1787131605",
        "alt_text": "Ella Luna Black Sling Bag - View 5",
        "display_order": 5,
        "is_primary": false
      },
      {
        "id": "img-7-6",
        "product_id": "prod-dnora-7",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00574BLACK-6.webp?v=1787131605",
        "alt_text": "Ella Luna Black Sling Bag - View 6",
        "display_order": 6,
        "is_primary": false
      },
      {
        "id": "img-7-7",
        "product_id": "prod-dnora-7",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00574BLACK-7.webp?v=1787131605",
        "alt_text": "Ella Luna Black Sling Bag - View 7",
        "display_order": 7,
        "is_primary": false
      }
    ],
    "variants": [
      {
        "id": "var-7-std",
        "product_id": "prod-dnora-7",
        "sku": "DNR-ELLA-LUNA--7",
        "color_name": "Black",
        "size": "One Size",
        "price_adjustment": 0,
        "stock": 31,
        "in_stock": true
      }
    ],
    "details": [
      "Crafted with signature premium vegan leather with supple pebble grain",
      "Reinforced top handles and adjustable/detachable shoulder strap",
      "Spacious main compartment with internal zippered organizer pocket",
      "Signature brushed gold metal accents and engraved DNORA logo emblem",
      "Water-resistant protective inner fabric lining"
    ],
    "care_instructions": "Wipe clean with a soft dry cloth. Keep away from direct sunlight and extreme moisture. Store in provided protective dust bag.",
    "shipping_info": "Dispatched within 24 hours. Free express delivery across India. 7-day hassle-free return window.",
    "stock_quantity": 45,
    "sku": "DNR-ELLA-LUNA--7",
    "created_at": "2026-09-05T13:29:19.422Z",
    "tags": [
      "bestseller",
      "handbag",
      "luxury",
      "dnora",
      "sling-bags"
    ]
  },
  {
    "id": "prod-dnora-8",
    "slug": "ella-luna-brown-sling-bag",
    "name": "Ella Luna Brown Sling Bag",
    "subtitle": "Crossbody Sling",
    "short_description": "Exquisitely tailored ella luna brown sling bag with signature hardware and spacious interior.",
    "full_description": "Designed for modern versatility, the Ella Luna Brown Sling Bag combines minimalist poise with thoughtful utility. Crafted from premium vegan textured leather with reinforced top handles, smooth glide zips, and bespoke brushed gold hardware. Perfect for daily commutes, weekend brunches, and evening outings.",
    "category_slug": "sling-bags",
    "category_id": "cat-sling-bags",
    "base_price": 3995,
    "sale_price": 2796,
    "is_new": true,
    "is_bestseller": false,
    "is_featured": false,
    "is_published": true,
    "rating": 4.7,
    "review_count": 178,
    "primary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00574BROWN-1.webp?v=1787131636",
    "secondary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00574BROWN-2.webp?v=1787131636",
    "images": [
      {
        "id": "img-8-1",
        "product_id": "prod-dnora-8",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00574BROWN-1.webp?v=1787131636",
        "alt_text": "Ella Luna Brown Sling Bag - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-8-2",
        "product_id": "prod-dnora-8",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00574BROWN-2.webp?v=1787131636",
        "alt_text": "Ella Luna Brown Sling Bag - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-8-3",
        "product_id": "prod-dnora-8",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00574BROWN-3.webp?v=1787131636",
        "alt_text": "Ella Luna Brown Sling Bag - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-8-4",
        "product_id": "prod-dnora-8",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00574BROWN-4.webp?v=1787131636",
        "alt_text": "Ella Luna Brown Sling Bag - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-8-5",
        "product_id": "prod-dnora-8",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00574BROWN-5.webp?v=1787131636",
        "alt_text": "Ella Luna Brown Sling Bag - View 5",
        "display_order": 5,
        "is_primary": false
      },
      {
        "id": "img-8-6",
        "product_id": "prod-dnora-8",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00574BROWN-6.webp?v=1787131636",
        "alt_text": "Ella Luna Brown Sling Bag - View 6",
        "display_order": 6,
        "is_primary": false
      },
      {
        "id": "img-8-7",
        "product_id": "prod-dnora-8",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00574BROWN-7.webp?v=1787131637",
        "alt_text": "Ella Luna Brown Sling Bag - View 7",
        "display_order": 7,
        "is_primary": false
      }
    ],
    "variants": [
      {
        "id": "var-8-std",
        "product_id": "prod-dnora-8",
        "sku": "DNR-ELLA-LUNA--8",
        "color_name": "Brown",
        "size": "One Size",
        "price_adjustment": 0,
        "stock": 32,
        "in_stock": true
      }
    ],
    "details": [
      "Crafted with signature premium vegan leather with supple pebble grain",
      "Reinforced top handles and adjustable/detachable shoulder strap",
      "Spacious main compartment with internal zippered organizer pocket",
      "Signature brushed gold metal accents and engraved DNORA logo emblem",
      "Water-resistant protective inner fabric lining"
    ],
    "care_instructions": "Wipe clean with a soft dry cloth. Keep away from direct sunlight and extreme moisture. Store in provided protective dust bag.",
    "shipping_info": "Dispatched within 24 hours. Free express delivery across India. 7-day hassle-free return window.",
    "stock_quantity": 45,
    "sku": "DNR-ELLA-LUNA--8",
    "created_at": "2026-09-04T13:29:19.422Z",
    "tags": [
      "bestseller",
      "handbag",
      "luxury",
      "dnora",
      "sling-bags"
    ]
  },
  {
    "id": "prod-dnora-9",
    "slug": "ella-luna-off-white-sling-bag",
    "name": "Ella Luna Off-White Sling Bag",
    "subtitle": "Crossbody Sling",
    "short_description": "Exquisitely tailored ella luna off-white sling bag with signature hardware and spacious interior.",
    "full_description": "Designed for modern versatility, the Ella Luna Off-White Sling Bag combines minimalist poise with thoughtful utility. Crafted from premium vegan textured leather with reinforced top handles, smooth glide zips, and bespoke brushed gold hardware. Perfect for daily commutes, weekend brunches, and evening outings.",
    "category_slug": "sling-bags",
    "category_id": "cat-sling-bags",
    "base_price": 3995,
    "sale_price": 2796,
    "is_new": false,
    "is_bestseller": false,
    "is_featured": true,
    "is_published": true,
    "rating": 4.8,
    "review_count": 197,
    "primary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00574OFFWHITE-1.webp?v=1787131645",
    "secondary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00574OFFWHITE-2.webp?v=1787131645",
    "images": [
      {
        "id": "img-9-1",
        "product_id": "prod-dnora-9",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00574OFFWHITE-1.webp?v=1787131645",
        "alt_text": "Ella Luna Off-White Sling Bag - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-9-2",
        "product_id": "prod-dnora-9",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00574OFFWHITE-2.webp?v=1787131645",
        "alt_text": "Ella Luna Off-White Sling Bag - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-9-3",
        "product_id": "prod-dnora-9",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00574OFFWHITE-3.webp?v=1787131645",
        "alt_text": "Ella Luna Off-White Sling Bag - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-9-4",
        "product_id": "prod-dnora-9",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00574OFFWHITE-4.webp?v=1787131645",
        "alt_text": "Ella Luna Off-White Sling Bag - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-9-5",
        "product_id": "prod-dnora-9",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00574OFFWHITE-5.webp?v=1787131645",
        "alt_text": "Ella Luna Off-White Sling Bag - View 5",
        "display_order": 5,
        "is_primary": false
      },
      {
        "id": "img-9-6",
        "product_id": "prod-dnora-9",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00574OFFWHITE-6.webp?v=1787131645",
        "alt_text": "Ella Luna Off-White Sling Bag - View 6",
        "display_order": 6,
        "is_primary": false
      },
      {
        "id": "img-9-7",
        "product_id": "prod-dnora-9",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00574OFFWHITE-7.webp?v=1787131645",
        "alt_text": "Ella Luna Off-White Sling Bag - View 7",
        "display_order": 7,
        "is_primary": false
      }
    ],
    "variants": [
      {
        "id": "var-9-std",
        "product_id": "prod-dnora-9",
        "sku": "DNR-ELLA-LUNA--9",
        "color_name": "Off-White",
        "size": "One Size",
        "price_adjustment": 0,
        "stock": 33,
        "in_stock": true
      }
    ],
    "details": [
      "Crafted with signature premium vegan leather with supple pebble grain",
      "Reinforced top handles and adjustable/detachable shoulder strap",
      "Spacious main compartment with internal zippered organizer pocket",
      "Signature brushed gold metal accents and engraved DNORA logo emblem",
      "Water-resistant protective inner fabric lining"
    ],
    "care_instructions": "Wipe clean with a soft dry cloth. Keep away from direct sunlight and extreme moisture. Store in provided protective dust bag.",
    "shipping_info": "Dispatched within 24 hours. Free express delivery across India. 7-day hassle-free return window.",
    "stock_quantity": 45,
    "sku": "DNR-ELLA-LUNA--9",
    "created_at": "2026-09-03T13:29:19.422Z",
    "tags": [
      "bestseller",
      "handbag",
      "luxury",
      "dnora",
      "sling-bags"
    ]
  },
  {
    "id": "prod-dnora-10",
    "slug": "ella-lyla-coffee-sling-bag",
    "name": "Ella Lyla Coffee Sling Bag",
    "subtitle": "Crossbody Sling",
    "short_description": "Exquisitely tailored ella lyla coffee sling bag with signature hardware and spacious interior.",
    "full_description": "Designed for modern versatility, the Ella Lyla Coffee Sling Bag combines minimalist poise with thoughtful utility. Crafted from premium vegan textured leather with reinforced top handles, smooth glide zips, and bespoke brushed gold hardware. Perfect for daily commutes, weekend brunches, and evening outings.",
    "category_slug": "sling-bags",
    "category_id": "cat-sling-bags",
    "base_price": 2995,
    "sale_price": 2096,
    "is_new": false,
    "is_bestseller": true,
    "is_featured": false,
    "is_published": true,
    "rating": 4.9,
    "review_count": 216,
    "primary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573COFFEE-1.webp?v=1788159103",
    "secondary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573COFFEE-2.jpg?v=1787131226",
    "images": [
      {
        "id": "img-10-1",
        "product_id": "prod-dnora-10",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573COFFEE-1.webp?v=1788159103",
        "alt_text": "Ella Lyla Coffee Sling Bag - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-10-2",
        "product_id": "prod-dnora-10",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573COFFEE-2.jpg?v=1787131226",
        "alt_text": "Ella Lyla Coffee Sling Bag - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-10-3",
        "product_id": "prod-dnora-10",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573COFFEE-3.jpg?v=1787131226",
        "alt_text": "Ella Lyla Coffee Sling Bag - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-10-4",
        "product_id": "prod-dnora-10",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573COFFEE-4.jpg?v=1787131226",
        "alt_text": "Ella Lyla Coffee Sling Bag - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-10-5",
        "product_id": "prod-dnora-10",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573COFFEE-5.jpg?v=1787131226",
        "alt_text": "Ella Lyla Coffee Sling Bag - View 5",
        "display_order": 5,
        "is_primary": false
      },
      {
        "id": "img-10-6",
        "product_id": "prod-dnora-10",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573COFFEE-6.jpg?v=1787131226",
        "alt_text": "Ella Lyla Coffee Sling Bag - View 6",
        "display_order": 6,
        "is_primary": false
      },
      {
        "id": "img-10-7",
        "product_id": "prod-dnora-10",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573COFFEE-7.jpg?v=1787131226",
        "alt_text": "Ella Lyla Coffee Sling Bag - View 7",
        "display_order": 7,
        "is_primary": false
      },
      {
        "id": "img-10-8",
        "product_id": "prod-dnora-10",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573COFFEE-8.jpg?v=1787131227",
        "alt_text": "Ella Lyla Coffee Sling Bag - View 8",
        "display_order": 8,
        "is_primary": false
      }
    ],
    "variants": [
      {
        "id": "var-10-std",
        "product_id": "prod-dnora-10",
        "sku": "DNR-ELLA-LYLA--10",
        "color_name": "Coffee",
        "size": "One Size",
        "price_adjustment": 0,
        "stock": 34,
        "in_stock": true
      }
    ],
    "details": [
      "Crafted with signature premium vegan leather with supple pebble grain",
      "Reinforced top handles and adjustable/detachable shoulder strap",
      "Spacious main compartment with internal zippered organizer pocket",
      "Signature brushed gold metal accents and engraved DNORA logo emblem",
      "Water-resistant protective inner fabric lining"
    ],
    "care_instructions": "Wipe clean with a soft dry cloth. Keep away from direct sunlight and extreme moisture. Store in provided protective dust bag.",
    "shipping_info": "Dispatched within 24 hours. Free express delivery across India. 7-day hassle-free return window.",
    "stock_quantity": 45,
    "sku": "DNR-ELLA-LYLA--10",
    "created_at": "2026-09-02T13:29:19.422Z",
    "tags": [
      "bestseller",
      "handbag",
      "luxury",
      "dnora",
      "sling-bags"
    ]
  },
  {
    "id": "prod-dnora-11",
    "slug": "ella-lyla-off-white-sling-bag",
    "name": "Ella Lyla Off-White Sling Bag",
    "subtitle": "Crossbody Sling",
    "short_description": "Exquisitely tailored ella lyla off-white sling bag with signature hardware and spacious interior.",
    "full_description": "Designed for modern versatility, the Ella Lyla Off-White Sling Bag combines minimalist poise with thoughtful utility. Crafted from premium vegan textured leather with reinforced top handles, smooth glide zips, and bespoke brushed gold hardware. Perfect for daily commutes, weekend brunches, and evening outings.",
    "category_slug": "sling-bags",
    "category_id": "cat-sling-bags",
    "base_price": 2995,
    "sale_price": 2096,
    "is_new": false,
    "is_bestseller": false,
    "is_featured": false,
    "is_published": true,
    "rating": 4.5,
    "review_count": 235,
    "primary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573_OFFWHITE-1.webp?v=1788159103",
    "secondary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573OFFWHITE-2.jpg?v=1787131242",
    "images": [
      {
        "id": "img-11-1",
        "product_id": "prod-dnora-11",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573_OFFWHITE-1.webp?v=1788159103",
        "alt_text": "Ella Lyla Off-White Sling Bag - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-11-2",
        "product_id": "prod-dnora-11",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573OFFWHITE-2.jpg?v=1787131242",
        "alt_text": "Ella Lyla Off-White Sling Bag - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-11-3",
        "product_id": "prod-dnora-11",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573OFFWHITE-3.jpg?v=1787131241",
        "alt_text": "Ella Lyla Off-White Sling Bag - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-11-4",
        "product_id": "prod-dnora-11",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573OFFWHITE-4.jpg?v=1787131242",
        "alt_text": "Ella Lyla Off-White Sling Bag - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-11-5",
        "product_id": "prod-dnora-11",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573OFFWHITE-5.jpg?v=1787131241",
        "alt_text": "Ella Lyla Off-White Sling Bag - View 5",
        "display_order": 5,
        "is_primary": false
      },
      {
        "id": "img-11-6",
        "product_id": "prod-dnora-11",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573OFFWHITE-6.jpg?v=1787131242",
        "alt_text": "Ella Lyla Off-White Sling Bag - View 6",
        "display_order": 6,
        "is_primary": false
      },
      {
        "id": "img-11-7",
        "product_id": "prod-dnora-11",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573OFFWHITE-7.jpg?v=1787131242",
        "alt_text": "Ella Lyla Off-White Sling Bag - View 7",
        "display_order": 7,
        "is_primary": false
      },
      {
        "id": "img-11-8",
        "product_id": "prod-dnora-11",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573OFFWHITE-8.jpg?v=1787131242",
        "alt_text": "Ella Lyla Off-White Sling Bag - View 8",
        "display_order": 8,
        "is_primary": false
      }
    ],
    "variants": [
      {
        "id": "var-11-std",
        "product_id": "prod-dnora-11",
        "sku": "DNR-ELLA-LYLA--11",
        "color_name": "Off-White",
        "size": "One Size",
        "price_adjustment": 0,
        "stock": 35,
        "in_stock": true
      }
    ],
    "details": [
      "Crafted with signature premium vegan leather with supple pebble grain",
      "Reinforced top handles and adjustable/detachable shoulder strap",
      "Spacious main compartment with internal zippered organizer pocket",
      "Signature brushed gold metal accents and engraved DNORA logo emblem",
      "Water-resistant protective inner fabric lining"
    ],
    "care_instructions": "Wipe clean with a soft dry cloth. Keep away from direct sunlight and extreme moisture. Store in provided protective dust bag.",
    "shipping_info": "Dispatched within 24 hours. Free express delivery across India. 7-day hassle-free return window.",
    "stock_quantity": 45,
    "sku": "DNR-ELLA-LYLA--11",
    "created_at": "2026-09-01T13:29:19.422Z",
    "tags": [
      "bestseller",
      "handbag",
      "luxury",
      "dnora",
      "sling-bags"
    ]
  },
  {
    "id": "prod-dnora-12",
    "slug": "ella-lyla-brown-sling-bag",
    "name": "Ella Lyla Brown Sling Bag",
    "subtitle": "Crossbody Sling",
    "short_description": "Exquisitely tailored ella lyla brown sling bag with signature hardware and spacious interior.",
    "full_description": "Designed for modern versatility, the Ella Lyla Brown Sling Bag combines minimalist poise with thoughtful utility. Crafted from premium vegan textured leather with reinforced top handles, smooth glide zips, and bespoke brushed gold hardware. Perfect for daily commutes, weekend brunches, and evening outings.",
    "category_slug": "sling-bags",
    "category_id": "cat-sling-bags",
    "base_price": 2995,
    "sale_price": 2096,
    "is_new": false,
    "is_bestseller": false,
    "is_featured": false,
    "is_published": true,
    "rating": 4.6,
    "review_count": 254,
    "primary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573_BROWN-1.webp?v=1788159103",
    "secondary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573BROWN-2.jpg?v=1787131214",
    "images": [
      {
        "id": "img-12-1",
        "product_id": "prod-dnora-12",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573_BROWN-1.webp?v=1788159103",
        "alt_text": "Ella Lyla Brown Sling Bag - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-12-2",
        "product_id": "prod-dnora-12",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573BROWN-2.jpg?v=1787131214",
        "alt_text": "Ella Lyla Brown Sling Bag - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-12-3",
        "product_id": "prod-dnora-12",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573BROWN-3.jpg?v=1787131214",
        "alt_text": "Ella Lyla Brown Sling Bag - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-12-4",
        "product_id": "prod-dnora-12",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573BROWN-4.jpg?v=1787131214",
        "alt_text": "Ella Lyla Brown Sling Bag - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-12-5",
        "product_id": "prod-dnora-12",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573BROWN-5.jpg?v=1787131214",
        "alt_text": "Ella Lyla Brown Sling Bag - View 5",
        "display_order": 5,
        "is_primary": false
      },
      {
        "id": "img-12-6",
        "product_id": "prod-dnora-12",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573BROWN-6.jpg?v=1787131214",
        "alt_text": "Ella Lyla Brown Sling Bag - View 6",
        "display_order": 6,
        "is_primary": false
      },
      {
        "id": "img-12-7",
        "product_id": "prod-dnora-12",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573BROWN-7.jpg?v=1787131214",
        "alt_text": "Ella Lyla Brown Sling Bag - View 7",
        "display_order": 7,
        "is_primary": false
      },
      {
        "id": "img-12-8",
        "product_id": "prod-dnora-12",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573BROWN-8.jpg?v=1787131214",
        "alt_text": "Ella Lyla Brown Sling Bag - View 8",
        "display_order": 8,
        "is_primary": false
      }
    ],
    "variants": [
      {
        "id": "var-12-std",
        "product_id": "prod-dnora-12",
        "sku": "DNR-ELLA-LYLA--12",
        "color_name": "Brown",
        "size": "One Size",
        "price_adjustment": 0,
        "stock": 36,
        "in_stock": true
      }
    ],
    "details": [
      "Crafted with signature premium vegan leather with supple pebble grain",
      "Reinforced top handles and adjustable/detachable shoulder strap",
      "Spacious main compartment with internal zippered organizer pocket",
      "Signature brushed gold metal accents and engraved DNORA logo emblem",
      "Water-resistant protective inner fabric lining"
    ],
    "care_instructions": "Wipe clean with a soft dry cloth. Keep away from direct sunlight and extreme moisture. Store in provided protective dust bag.",
    "shipping_info": "Dispatched within 24 hours. Free express delivery across India. 7-day hassle-free return window.",
    "stock_quantity": 45,
    "sku": "DNR-ELLA-LYLA--12",
    "created_at": "2026-08-31T13:29:19.422Z",
    "tags": [
      "bestseller",
      "handbag",
      "luxury",
      "dnora",
      "sling-bags"
    ]
  },
  {
    "id": "prod-dnora-13",
    "slug": "ella-lyla-white-sling-bag",
    "name": "Ella Lyla White Sling Bag",
    "subtitle": "Crossbody Sling",
    "short_description": "Exquisitely tailored ella lyla white sling bag with signature hardware and spacious interior.",
    "full_description": "Designed for modern versatility, the Ella Lyla White Sling Bag combines minimalist poise with thoughtful utility. Crafted from premium vegan textured leather with reinforced top handles, smooth glide zips, and bespoke brushed gold hardware. Perfect for daily commutes, weekend brunches, and evening outings.",
    "category_slug": "sling-bags",
    "category_id": "cat-sling-bags",
    "base_price": 2995,
    "sale_price": 2096,
    "is_new": false,
    "is_bestseller": true,
    "is_featured": true,
    "is_published": true,
    "rating": 4.7,
    "review_count": 273,
    "primary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573_WHITE-1.webp?v=1788159103",
    "secondary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573WHITE-2.jpg?v=1787131253",
    "images": [
      {
        "id": "img-13-1",
        "product_id": "prod-dnora-13",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573_WHITE-1.webp?v=1788159103",
        "alt_text": "Ella Lyla White Sling Bag - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-13-2",
        "product_id": "prod-dnora-13",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573WHITE-2.jpg?v=1787131253",
        "alt_text": "Ella Lyla White Sling Bag - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-13-3",
        "product_id": "prod-dnora-13",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573WHITE-3.jpg?v=1787131253",
        "alt_text": "Ella Lyla White Sling Bag - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-13-4",
        "product_id": "prod-dnora-13",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573WHITE-4.jpg?v=1787131253",
        "alt_text": "Ella Lyla White Sling Bag - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-13-5",
        "product_id": "prod-dnora-13",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573WHITE-5.jpg?v=1787131253",
        "alt_text": "Ella Lyla White Sling Bag - View 5",
        "display_order": 5,
        "is_primary": false
      },
      {
        "id": "img-13-6",
        "product_id": "prod-dnora-13",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573WHITE-6.jpg?v=1787131253",
        "alt_text": "Ella Lyla White Sling Bag - View 6",
        "display_order": 6,
        "is_primary": false
      },
      {
        "id": "img-13-7",
        "product_id": "prod-dnora-13",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573WHITE-7.jpg?v=1787131253",
        "alt_text": "Ella Lyla White Sling Bag - View 7",
        "display_order": 7,
        "is_primary": false
      },
      {
        "id": "img-13-8",
        "product_id": "prod-dnora-13",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00573WHITE-8.jpg?v=1787131253",
        "alt_text": "Ella Lyla White Sling Bag - View 8",
        "display_order": 8,
        "is_primary": false
      }
    ],
    "variants": [
      {
        "id": "var-13-std",
        "product_id": "prod-dnora-13",
        "sku": "DNR-ELLA-LYLA--13",
        "color_name": "Classic",
        "size": "One Size",
        "price_adjustment": 0,
        "stock": 37,
        "in_stock": true
      }
    ],
    "details": [
      "Crafted with signature premium vegan leather with supple pebble grain",
      "Reinforced top handles and adjustable/detachable shoulder strap",
      "Spacious main compartment with internal zippered organizer pocket",
      "Signature brushed gold metal accents and engraved DNORA logo emblem",
      "Water-resistant protective inner fabric lining"
    ],
    "care_instructions": "Wipe clean with a soft dry cloth. Keep away from direct sunlight and extreme moisture. Store in provided protective dust bag.",
    "shipping_info": "Dispatched within 24 hours. Free express delivery across India. 7-day hassle-free return window.",
    "stock_quantity": 45,
    "sku": "DNR-ELLA-LYLA--13",
    "created_at": "2026-08-30T13:29:19.422Z",
    "tags": [
      "bestseller",
      "handbag",
      "luxury",
      "dnora",
      "sling-bags"
    ]
  },
  {
    "id": "prod-dnora-14",
    "slug": "voyage-lily-off-white-sling-bag",
    "name": "Voyage Lily Off-White Sling Bag",
    "subtitle": "Crossbody Sling",
    "short_description": "Exquisitely tailored voyage lily off-white sling bag with signature hardware and spacious interior.",
    "full_description": "Designed for modern versatility, the Voyage Lily Off-White Sling Bag combines minimalist poise with thoughtful utility. Crafted from premium vegan textured leather with reinforced top handles, smooth glide zips, and bespoke brushed gold hardware. Perfect for daily commutes, weekend brunches, and evening outings.",
    "category_slug": "sling-bags",
    "category_id": "cat-sling-bags",
    "base_price": 2000,
    "sale_price": 1400,
    "is_new": false,
    "is_bestseller": false,
    "is_featured": false,
    "is_published": true,
    "rating": 4.8,
    "review_count": 292,
    "primary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00559OFFWHITE-1.webp?v=1787131002",
    "secondary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00559OFFWHITE-2.webp?v=1787131002",
    "images": [
      {
        "id": "img-14-1",
        "product_id": "prod-dnora-14",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00559OFFWHITE-1.webp?v=1787131002",
        "alt_text": "Voyage Lily Off-White Sling Bag - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-14-2",
        "product_id": "prod-dnora-14",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00559OFFWHITE-2.webp?v=1787131002",
        "alt_text": "Voyage Lily Off-White Sling Bag - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-14-3",
        "product_id": "prod-dnora-14",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00559OFFWHITE-3.webp?v=1787131002",
        "alt_text": "Voyage Lily Off-White Sling Bag - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-14-4",
        "product_id": "prod-dnora-14",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00559OFFWHITE-4.webp?v=1787131002",
        "alt_text": "Voyage Lily Off-White Sling Bag - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-14-5",
        "product_id": "prod-dnora-14",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00559OFFWHITE-5.webp?v=1787131002",
        "alt_text": "Voyage Lily Off-White Sling Bag - View 5",
        "display_order": 5,
        "is_primary": false
      },
      {
        "id": "img-14-6",
        "product_id": "prod-dnora-14",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00559OFFWHITE-6.webp?v=1787131002",
        "alt_text": "Voyage Lily Off-White Sling Bag - View 6",
        "display_order": 6,
        "is_primary": false
      },
      {
        "id": "img-14-7",
        "product_id": "prod-dnora-14",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00559OFFWHITE-7.webp?v=1787131002",
        "alt_text": "Voyage Lily Off-White Sling Bag - View 7",
        "display_order": 7,
        "is_primary": false
      }
    ],
    "variants": [
      {
        "id": "var-14-std",
        "product_id": "prod-dnora-14",
        "sku": "DNR-VOYAGE-LIL-14",
        "color_name": "Off-White",
        "size": "One Size",
        "price_adjustment": 0,
        "stock": 38,
        "in_stock": true
      }
    ],
    "details": [
      "Crafted with signature premium vegan leather with supple pebble grain",
      "Reinforced top handles and adjustable/detachable shoulder strap",
      "Spacious main compartment with internal zippered organizer pocket",
      "Signature brushed gold metal accents and engraved DNORA logo emblem",
      "Water-resistant protective inner fabric lining"
    ],
    "care_instructions": "Wipe clean with a soft dry cloth. Keep away from direct sunlight and extreme moisture. Store in provided protective dust bag.",
    "shipping_info": "Dispatched within 24 hours. Free express delivery across India. 7-day hassle-free return window.",
    "stock_quantity": 45,
    "sku": "DNR-VOYAGE-LIL-14",
    "created_at": "2026-08-29T13:29:19.422Z",
    "tags": [
      "bestseller",
      "handbag",
      "luxury",
      "dnora",
      "sling-bags"
    ]
  },
  {
    "id": "prod-dnora-15",
    "slug": "voyage-lily-taupe-sling-bag",
    "name": "Voyage Lily Taupe Sling Bag",
    "subtitle": "Crossbody Sling",
    "short_description": "Exquisitely tailored voyage lily taupe sling bag with signature hardware and spacious interior.",
    "full_description": "Designed for modern versatility, the Voyage Lily Taupe Sling Bag combines minimalist poise with thoughtful utility. Crafted from premium vegan textured leather with reinforced top handles, smooth glide zips, and bespoke brushed gold hardware. Perfect for daily commutes, weekend brunches, and evening outings.",
    "category_slug": "sling-bags",
    "category_id": "cat-sling-bags",
    "base_price": 2000,
    "sale_price": 1400,
    "is_new": false,
    "is_bestseller": false,
    "is_featured": false,
    "is_published": true,
    "rating": 4.9,
    "review_count": 311,
    "primary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00559TAUPE-1.webp?v=1787131023",
    "secondary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00559TAUPE-2.webp?v=1787131023",
    "images": [
      {
        "id": "img-15-1",
        "product_id": "prod-dnora-15",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00559TAUPE-1.webp?v=1787131023",
        "alt_text": "Voyage Lily Taupe Sling Bag - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-15-2",
        "product_id": "prod-dnora-15",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00559TAUPE-2.webp?v=1787131023",
        "alt_text": "Voyage Lily Taupe Sling Bag - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-15-3",
        "product_id": "prod-dnora-15",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00559TAUPE-3.webp?v=1787131023",
        "alt_text": "Voyage Lily Taupe Sling Bag - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-15-4",
        "product_id": "prod-dnora-15",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00559TAUPE-4.webp?v=1787131023",
        "alt_text": "Voyage Lily Taupe Sling Bag - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-15-5",
        "product_id": "prod-dnora-15",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00559TAUPE-5.webp?v=1787131023",
        "alt_text": "Voyage Lily Taupe Sling Bag - View 5",
        "display_order": 5,
        "is_primary": false
      },
      {
        "id": "img-15-6",
        "product_id": "prod-dnora-15",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00559TAUPE-6.webp?v=1787131023",
        "alt_text": "Voyage Lily Taupe Sling Bag - View 6",
        "display_order": 6,
        "is_primary": false
      },
      {
        "id": "img-15-7",
        "product_id": "prod-dnora-15",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00559TAUPE-7.webp?v=1787131023",
        "alt_text": "Voyage Lily Taupe Sling Bag - View 7",
        "display_order": 7,
        "is_primary": false
      }
    ],
    "variants": [
      {
        "id": "var-15-std",
        "product_id": "prod-dnora-15",
        "sku": "DNR-VOYAGE-LIL-15",
        "color_name": "Classic",
        "size": "One Size",
        "price_adjustment": 0,
        "stock": 39,
        "in_stock": true
      }
    ],
    "details": [
      "Crafted with signature premium vegan leather with supple pebble grain",
      "Reinforced top handles and adjustable/detachable shoulder strap",
      "Spacious main compartment with internal zippered organizer pocket",
      "Signature brushed gold metal accents and engraved DNORA logo emblem",
      "Water-resistant protective inner fabric lining"
    ],
    "care_instructions": "Wipe clean with a soft dry cloth. Keep away from direct sunlight and extreme moisture. Store in provided protective dust bag.",
    "shipping_info": "Dispatched within 24 hours. Free express delivery across India. 7-day hassle-free return window.",
    "stock_quantity": 45,
    "sku": "DNR-VOYAGE-LIL-15",
    "created_at": "2026-08-28T13:29:19.422Z",
    "tags": [
      "bestseller",
      "handbag",
      "luxury",
      "dnora",
      "sling-bags"
    ]
  },
  {
    "id": "prod-dnora-16",
    "slug": "texas-grace-gold-shoulder-bag",
    "name": "Texas Grace Gold Shoulder Bag",
    "subtitle": "Classic Shoulder Bag",
    "short_description": "Exquisitely tailored texas grace gold shoulder bag with signature hardware and spacious interior.",
    "full_description": "Designed for modern versatility, the Texas Grace Gold Shoulder Bag combines minimalist poise with thoughtful utility. Crafted from premium vegan textured leather with reinforced top handles, smooth glide zips, and bespoke brushed gold hardware. Perfect for daily commutes, weekend brunches, and evening outings.",
    "category_slug": "handbags",
    "category_id": "cat-handbags",
    "base_price": 3495,
    "sale_price": 2446,
    "is_new": false,
    "is_bestseller": true,
    "is_featured": false,
    "is_published": true,
    "rating": 4.5,
    "review_count": 330,
    "primary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02804GOLD-1.webp?v=1787130830",
    "secondary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02804GOLD-2.webp?v=1787130830",
    "images": [
      {
        "id": "img-16-1",
        "product_id": "prod-dnora-16",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02804GOLD-1.webp?v=1787130830",
        "alt_text": "Texas Grace Gold Shoulder Bag - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-16-2",
        "product_id": "prod-dnora-16",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02804GOLD-2.webp?v=1787130830",
        "alt_text": "Texas Grace Gold Shoulder Bag - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-16-3",
        "product_id": "prod-dnora-16",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02804GOLD-3.webp?v=1787130830",
        "alt_text": "Texas Grace Gold Shoulder Bag - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-16-4",
        "product_id": "prod-dnora-16",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02804GOLD-4.webp?v=1787130831",
        "alt_text": "Texas Grace Gold Shoulder Bag - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-16-5",
        "product_id": "prod-dnora-16",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02804GOLD-5.webp?v=1787130830",
        "alt_text": "Texas Grace Gold Shoulder Bag - View 5",
        "display_order": 5,
        "is_primary": false
      },
      {
        "id": "img-16-6",
        "product_id": "prod-dnora-16",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02804GOLD-6.webp?v=1787130831",
        "alt_text": "Texas Grace Gold Shoulder Bag - View 6",
        "display_order": 6,
        "is_primary": false
      },
      {
        "id": "img-16-7",
        "product_id": "prod-dnora-16",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02804GOLD-7.webp?v=1787130830",
        "alt_text": "Texas Grace Gold Shoulder Bag - View 7",
        "display_order": 7,
        "is_primary": false
      }
    ],
    "variants": [
      {
        "id": "var-16-std",
        "product_id": "prod-dnora-16",
        "sku": "DNR-TEXAS-GRAC-16",
        "color_name": "Classic",
        "size": "One Size",
        "price_adjustment": 0,
        "stock": 25,
        "in_stock": true
      }
    ],
    "details": [
      "Crafted with signature premium vegan leather with supple pebble grain",
      "Reinforced top handles and adjustable/detachable shoulder strap",
      "Spacious main compartment with internal zippered organizer pocket",
      "Signature brushed gold metal accents and engraved DNORA logo emblem",
      "Water-resistant protective inner fabric lining"
    ],
    "care_instructions": "Wipe clean with a soft dry cloth. Keep away from direct sunlight and extreme moisture. Store in provided protective dust bag.",
    "shipping_info": "Dispatched within 24 hours. Free express delivery across India. 7-day hassle-free return window.",
    "stock_quantity": 45,
    "sku": "DNR-TEXAS-GRAC-16",
    "created_at": "2026-08-27T13:29:19.422Z",
    "tags": [
      "bestseller",
      "handbag",
      "luxury",
      "dnora",
      "handbags"
    ]
  },
  {
    "id": "prod-dnora-17",
    "slug": "texas-grace-black-shoulder-bag",
    "name": "Texas Grace Black Shoulder Bag",
    "subtitle": "Classic Shoulder Bag",
    "short_description": "Exquisitely tailored texas grace black shoulder bag with signature hardware and spacious interior.",
    "full_description": "Designed for modern versatility, the Texas Grace Black Shoulder Bag combines minimalist poise with thoughtful utility. Crafted from premium vegan textured leather with reinforced top handles, smooth glide zips, and bespoke brushed gold hardware. Perfect for daily commutes, weekend brunches, and evening outings.",
    "category_slug": "handbags",
    "category_id": "cat-handbags",
    "base_price": 3495,
    "sale_price": 2446,
    "is_new": false,
    "is_bestseller": false,
    "is_featured": true,
    "is_published": true,
    "rating": 4.6,
    "review_count": 349,
    "primary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02804BLACK-1.webp?v=1787130820",
    "secondary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02804BLACK-2.webp?v=1787130820",
    "images": [
      {
        "id": "img-17-1",
        "product_id": "prod-dnora-17",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02804BLACK-1.webp?v=1787130820",
        "alt_text": "Texas Grace Black Shoulder Bag - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-17-2",
        "product_id": "prod-dnora-17",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02804BLACK-2.webp?v=1787130820",
        "alt_text": "Texas Grace Black Shoulder Bag - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-17-3",
        "product_id": "prod-dnora-17",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02804BLACK-3.webp?v=1787130820",
        "alt_text": "Texas Grace Black Shoulder Bag - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-17-4",
        "product_id": "prod-dnora-17",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02804BLACK-4.webp?v=1787130820",
        "alt_text": "Texas Grace Black Shoulder Bag - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-17-5",
        "product_id": "prod-dnora-17",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02804BLACK-5.webp?v=1787130820",
        "alt_text": "Texas Grace Black Shoulder Bag - View 5",
        "display_order": 5,
        "is_primary": false
      },
      {
        "id": "img-17-6",
        "product_id": "prod-dnora-17",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02804BLACK-6.webp?v=1787130820",
        "alt_text": "Texas Grace Black Shoulder Bag - View 6",
        "display_order": 6,
        "is_primary": false
      },
      {
        "id": "img-17-7",
        "product_id": "prod-dnora-17",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02804BLACK-7.webp?v=1787130820",
        "alt_text": "Texas Grace Black Shoulder Bag - View 7",
        "display_order": 7,
        "is_primary": false
      }
    ],
    "variants": [
      {
        "id": "var-17-std",
        "product_id": "prod-dnora-17",
        "sku": "DNR-TEXAS-GRAC-17",
        "color_name": "Black",
        "size": "One Size",
        "price_adjustment": 0,
        "stock": 26,
        "in_stock": true
      }
    ],
    "details": [
      "Crafted with signature premium vegan leather with supple pebble grain",
      "Reinforced top handles and adjustable/detachable shoulder strap",
      "Spacious main compartment with internal zippered organizer pocket",
      "Signature brushed gold metal accents and engraved DNORA logo emblem",
      "Water-resistant protective inner fabric lining"
    ],
    "care_instructions": "Wipe clean with a soft dry cloth. Keep away from direct sunlight and extreme moisture. Store in provided protective dust bag.",
    "shipping_info": "Dispatched within 24 hours. Free express delivery across India. 7-day hassle-free return window.",
    "stock_quantity": 45,
    "sku": "DNR-TEXAS-GRAC-17",
    "created_at": "2026-08-26T13:29:19.422Z",
    "tags": [
      "bestseller",
      "handbag",
      "luxury",
      "dnora",
      "handbags"
    ]
  },
  {
    "id": "prod-dnora-18",
    "slug": "voyage-leia-coffee-satchel-bag",
    "name": "Voyage Leia Coffee Satchel Bag",
    "subtitle": "Structured Satchel Bag",
    "short_description": "Exquisitely tailored voyage leia coffee satchel bag with signature hardware and spacious interior.",
    "full_description": "Designed for modern versatility, the Voyage Leia Coffee Satchel Bag combines minimalist poise with thoughtful utility. Crafted from premium vegan textured leather with reinforced top handles, smooth glide zips, and bespoke brushed gold hardware. Perfect for daily commutes, weekend brunches, and evening outings.",
    "category_slug": "satchels",
    "category_id": "cat-satchels",
    "base_price": 4495,
    "sale_price": 3146,
    "is_new": false,
    "is_bestseller": false,
    "is_featured": false,
    "is_published": true,
    "rating": 4.7,
    "review_count": 58,
    "primary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02803COFFEE-1_15fbd79f-7edb-4d82-8e01-981ef78a9b92.webp?v=1787130430",
    "secondary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02803COFFEE-2_d36d8d9c-10c0-42d9-b171-1ad5d5bc9add.webp?v=1787130429",
    "images": [
      {
        "id": "img-18-1",
        "product_id": "prod-dnora-18",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02803COFFEE-1_15fbd79f-7edb-4d82-8e01-981ef78a9b92.webp?v=1787130430",
        "alt_text": "Voyage Leia Coffee Satchel Bag - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-18-2",
        "product_id": "prod-dnora-18",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02803COFFEE-2_d36d8d9c-10c0-42d9-b171-1ad5d5bc9add.webp?v=1787130429",
        "alt_text": "Voyage Leia Coffee Satchel Bag - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-18-3",
        "product_id": "prod-dnora-18",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02803COFFEE-3_12751e85-f189-4faf-933e-820bc8013426.webp?v=1787130429",
        "alt_text": "Voyage Leia Coffee Satchel Bag - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-18-4",
        "product_id": "prod-dnora-18",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02803COFFEE-4_06e56de4-193b-44d7-b9ce-883c3002c415.webp?v=1787130430",
        "alt_text": "Voyage Leia Coffee Satchel Bag - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-18-5",
        "product_id": "prod-dnora-18",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02803COFFEE-5_44765374-b0ff-4603-bacb-5955c1e0f501.webp?v=1787130429",
        "alt_text": "Voyage Leia Coffee Satchel Bag - View 5",
        "display_order": 5,
        "is_primary": false
      },
      {
        "id": "img-18-6",
        "product_id": "prod-dnora-18",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02803COFFEE-6_47025a78-78ec-40fc-8809-9a9627bc647e.webp?v=1787130430",
        "alt_text": "Voyage Leia Coffee Satchel Bag - View 6",
        "display_order": 6,
        "is_primary": false
      },
      {
        "id": "img-18-7",
        "product_id": "prod-dnora-18",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02803COFFEE-7_85028344-7e67-434b-a922-e6899f440273.webp?v=1787130430",
        "alt_text": "Voyage Leia Coffee Satchel Bag - View 7",
        "display_order": 7,
        "is_primary": false
      }
    ],
    "variants": [
      {
        "id": "var-18-std",
        "product_id": "prod-dnora-18",
        "sku": "DNR-VOYAGE-LEI-18",
        "color_name": "Coffee",
        "size": "One Size",
        "price_adjustment": 0,
        "stock": 27,
        "in_stock": true
      }
    ],
    "details": [
      "Crafted with signature premium vegan leather with supple pebble grain",
      "Reinforced top handles and adjustable/detachable shoulder strap",
      "Spacious main compartment with internal zippered organizer pocket",
      "Signature brushed gold metal accents and engraved DNORA logo emblem",
      "Water-resistant protective inner fabric lining"
    ],
    "care_instructions": "Wipe clean with a soft dry cloth. Keep away from direct sunlight and extreme moisture. Store in provided protective dust bag.",
    "shipping_info": "Dispatched within 24 hours. Free express delivery across India. 7-day hassle-free return window.",
    "stock_quantity": 45,
    "sku": "DNR-VOYAGE-LEI-18",
    "created_at": "2026-08-25T13:29:19.422Z",
    "tags": [
      "bestseller",
      "handbag",
      "luxury",
      "dnora",
      "satchels"
    ]
  },
  {
    "id": "prod-dnora-19",
    "slug": "voyage-leia-off-white-satchel-bag",
    "name": "Voyage Leia Off-White Satchel Bag",
    "subtitle": "Structured Satchel Bag",
    "short_description": "Exquisitely tailored voyage leia off-white satchel bag with signature hardware and spacious interior.",
    "full_description": "Designed for modern versatility, the Voyage Leia Off-White Satchel Bag combines minimalist poise with thoughtful utility. Crafted from premium vegan textured leather with reinforced top handles, smooth glide zips, and bespoke brushed gold hardware. Perfect for daily commutes, weekend brunches, and evening outings.",
    "category_slug": "satchels",
    "category_id": "cat-satchels",
    "base_price": 4495,
    "sale_price": 3146,
    "is_new": false,
    "is_bestseller": true,
    "is_featured": false,
    "is_published": true,
    "rating": 4.8,
    "review_count": 77,
    "primary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02803OFFWHITE-1.webp?v=1787130459",
    "secondary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02803OFFWHITE-2.webp?v=1787130459",
    "images": [
      {
        "id": "img-19-1",
        "product_id": "prod-dnora-19",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02803OFFWHITE-1.webp?v=1787130459",
        "alt_text": "Voyage Leia Off-White Satchel Bag - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-19-2",
        "product_id": "prod-dnora-19",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02803OFFWHITE-2.webp?v=1787130459",
        "alt_text": "Voyage Leia Off-White Satchel Bag - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-19-3",
        "product_id": "prod-dnora-19",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02803OFFWHITE-3.webp?v=1787130459",
        "alt_text": "Voyage Leia Off-White Satchel Bag - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-19-4",
        "product_id": "prod-dnora-19",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02803OFFWHITE-4.webp?v=1787130459",
        "alt_text": "Voyage Leia Off-White Satchel Bag - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-19-5",
        "product_id": "prod-dnora-19",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02803OFFWHITE-5.webp?v=1787130459",
        "alt_text": "Voyage Leia Off-White Satchel Bag - View 5",
        "display_order": 5,
        "is_primary": false
      },
      {
        "id": "img-19-6",
        "product_id": "prod-dnora-19",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02803OFFWHITE-6.webp?v=1787130459",
        "alt_text": "Voyage Leia Off-White Satchel Bag - View 6",
        "display_order": 6,
        "is_primary": false
      },
      {
        "id": "img-19-7",
        "product_id": "prod-dnora-19",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02803OFFWHITE-7.webp?v=1787130459",
        "alt_text": "Voyage Leia Off-White Satchel Bag - View 7",
        "display_order": 7,
        "is_primary": false
      }
    ],
    "variants": [
      {
        "id": "var-19-std",
        "product_id": "prod-dnora-19",
        "sku": "DNR-VOYAGE-LEI-19",
        "color_name": "Off-White",
        "size": "One Size",
        "price_adjustment": 0,
        "stock": 28,
        "in_stock": true
      }
    ],
    "details": [
      "Crafted with signature premium vegan leather with supple pebble grain",
      "Reinforced top handles and adjustable/detachable shoulder strap",
      "Spacious main compartment with internal zippered organizer pocket",
      "Signature brushed gold metal accents and engraved DNORA logo emblem",
      "Water-resistant protective inner fabric lining"
    ],
    "care_instructions": "Wipe clean with a soft dry cloth. Keep away from direct sunlight and extreme moisture. Store in provided protective dust bag.",
    "shipping_info": "Dispatched within 24 hours. Free express delivery across India. 7-day hassle-free return window.",
    "stock_quantity": 45,
    "sku": "DNR-VOYAGE-LEI-19",
    "created_at": "2026-08-24T13:29:19.422Z",
    "tags": [
      "bestseller",
      "handbag",
      "luxury",
      "dnora",
      "satchels"
    ]
  },
  {
    "id": "prod-dnora-20",
    "slug": "ella-myra-coffee-satchel-bag",
    "name": "Ella Myra Coffee Satchel Bag",
    "subtitle": "Structured Satchel Bag",
    "short_description": "Exquisitely tailored ella myra coffee satchel bag with signature hardware and spacious interior.",
    "full_description": "Designed for modern versatility, the Ella Myra Coffee Satchel Bag combines minimalist poise with thoughtful utility. Crafted from premium vegan textured leather with reinforced top handles, smooth glide zips, and bespoke brushed gold hardware. Perfect for daily commutes, weekend brunches, and evening outings.",
    "category_slug": "satchels",
    "category_id": "cat-satchels",
    "base_price": 3995,
    "sale_price": 2796,
    "is_new": false,
    "is_bestseller": false,
    "is_featured": false,
    "is_published": true,
    "rating": 4.9,
    "review_count": 96,
    "primary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02802COFFEE-1.webp?v=1787130102",
    "secondary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02802COFFEE-2.webp?v=1787130102",
    "images": [
      {
        "id": "img-20-1",
        "product_id": "prod-dnora-20",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02802COFFEE-1.webp?v=1787130102",
        "alt_text": "Ella Myra Coffee Satchel Bag - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-20-2",
        "product_id": "prod-dnora-20",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02802COFFEE-2.webp?v=1787130102",
        "alt_text": "Ella Myra Coffee Satchel Bag - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-20-3",
        "product_id": "prod-dnora-20",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02802COFFEE-3.webp?v=1787130102",
        "alt_text": "Ella Myra Coffee Satchel Bag - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-20-4",
        "product_id": "prod-dnora-20",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02802COFFEE-4.webp?v=1787130102",
        "alt_text": "Ella Myra Coffee Satchel Bag - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-20-5",
        "product_id": "prod-dnora-20",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02802COFFEE-5.webp?v=1787130102",
        "alt_text": "Ella Myra Coffee Satchel Bag - View 5",
        "display_order": 5,
        "is_primary": false
      },
      {
        "id": "img-20-6",
        "product_id": "prod-dnora-20",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02802COFFEE-6.webp?v=1787130102",
        "alt_text": "Ella Myra Coffee Satchel Bag - View 6",
        "display_order": 6,
        "is_primary": false
      },
      {
        "id": "img-20-7",
        "product_id": "prod-dnora-20",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02802COFFEE-7.webp?v=1787130102",
        "alt_text": "Ella Myra Coffee Satchel Bag - View 7",
        "display_order": 7,
        "is_primary": false
      }
    ],
    "variants": [
      {
        "id": "var-20-std",
        "product_id": "prod-dnora-20",
        "sku": "DNR-ELLA-MYRA--20",
        "color_name": "Coffee",
        "size": "One Size",
        "price_adjustment": 0,
        "stock": 29,
        "in_stock": true
      }
    ],
    "details": [
      "Crafted with signature premium vegan leather with supple pebble grain",
      "Reinforced top handles and adjustable/detachable shoulder strap",
      "Spacious main compartment with internal zippered organizer pocket",
      "Signature brushed gold metal accents and engraved DNORA logo emblem",
      "Water-resistant protective inner fabric lining"
    ],
    "care_instructions": "Wipe clean with a soft dry cloth. Keep away from direct sunlight and extreme moisture. Store in provided protective dust bag.",
    "shipping_info": "Dispatched within 24 hours. Free express delivery across India. 7-day hassle-free return window.",
    "stock_quantity": 45,
    "sku": "DNR-ELLA-MYRA--20",
    "created_at": "2026-08-23T13:29:19.422Z",
    "tags": [
      "bestseller",
      "handbag",
      "luxury",
      "dnora",
      "satchels"
    ]
  },
  {
    "id": "prod-dnora-21",
    "slug": "ella-myra-beige-satchel-bag",
    "name": "Ella Myra Beige Satchel Bag",
    "subtitle": "Structured Satchel Bag",
    "short_description": "Exquisitely tailored ella myra beige satchel bag with signature hardware and spacious interior.",
    "full_description": "Designed for modern versatility, the Ella Myra Beige Satchel Bag combines minimalist poise with thoughtful utility. Crafted from premium vegan textured leather with reinforced top handles, smooth glide zips, and bespoke brushed gold hardware. Perfect for daily commutes, weekend brunches, and evening outings.",
    "category_slug": "satchels",
    "category_id": "cat-satchels",
    "base_price": 3995,
    "sale_price": 2796,
    "is_new": false,
    "is_bestseller": false,
    "is_featured": true,
    "is_published": true,
    "rating": 4.5,
    "review_count": 115,
    "primary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02802BEIGE-1.webp?v=1787130070",
    "secondary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02802BEIGE-2.webp?v=1787130070",
    "images": [
      {
        "id": "img-21-1",
        "product_id": "prod-dnora-21",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02802BEIGE-1.webp?v=1787130070",
        "alt_text": "Ella Myra Beige Satchel Bag - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-21-2",
        "product_id": "prod-dnora-21",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02802BEIGE-2.webp?v=1787130070",
        "alt_text": "Ella Myra Beige Satchel Bag - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-21-3",
        "product_id": "prod-dnora-21",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02802BEIGE-3.webp?v=1787130070",
        "alt_text": "Ella Myra Beige Satchel Bag - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-21-4",
        "product_id": "prod-dnora-21",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02802BEIGE-4.webp?v=1787130070",
        "alt_text": "Ella Myra Beige Satchel Bag - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-21-5",
        "product_id": "prod-dnora-21",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02802BEIGE-5.webp?v=1787130070",
        "alt_text": "Ella Myra Beige Satchel Bag - View 5",
        "display_order": 5,
        "is_primary": false
      },
      {
        "id": "img-21-6",
        "product_id": "prod-dnora-21",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02802BEIGE-6.webp?v=1787130071",
        "alt_text": "Ella Myra Beige Satchel Bag - View 6",
        "display_order": 6,
        "is_primary": false
      },
      {
        "id": "img-21-7",
        "product_id": "prod-dnora-21",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02802BEIGE-7.webp?v=1787130070",
        "alt_text": "Ella Myra Beige Satchel Bag - View 7",
        "display_order": 7,
        "is_primary": false
      }
    ],
    "variants": [
      {
        "id": "var-21-std",
        "product_id": "prod-dnora-21",
        "sku": "DNR-ELLA-MYRA--21",
        "color_name": "Beige",
        "size": "One Size",
        "price_adjustment": 0,
        "stock": 30,
        "in_stock": true
      }
    ],
    "details": [
      "Crafted with signature premium vegan leather with supple pebble grain",
      "Reinforced top handles and adjustable/detachable shoulder strap",
      "Spacious main compartment with internal zippered organizer pocket",
      "Signature brushed gold metal accents and engraved DNORA logo emblem",
      "Water-resistant protective inner fabric lining"
    ],
    "care_instructions": "Wipe clean with a soft dry cloth. Keep away from direct sunlight and extreme moisture. Store in provided protective dust bag.",
    "shipping_info": "Dispatched within 24 hours. Free express delivery across India. 7-day hassle-free return window.",
    "stock_quantity": 45,
    "sku": "DNR-ELLA-MYRA--21",
    "created_at": "2026-08-22T13:29:19.423Z",
    "tags": [
      "bestseller",
      "handbag",
      "luxury",
      "dnora",
      "satchels"
    ]
  },
  {
    "id": "prod-dnora-22",
    "slug": "voyage-mila-black-hobo-bag",
    "name": "Voyage Mila Black Hobo Bag",
    "subtitle": "Premium Leather Handbag",
    "short_description": "Exquisitely tailored voyage mila black hobo bag with signature hardware and spacious interior.",
    "full_description": "Designed for modern versatility, the Voyage Mila Black Hobo Bag combines minimalist poise with thoughtful utility. Crafted from premium vegan textured leather with reinforced top handles, smooth glide zips, and bespoke brushed gold hardware. Perfect for daily commutes, weekend brunches, and evening outings.",
    "category_slug": "handbags",
    "category_id": "cat-handbags",
    "base_price": 4495,
    "sale_price": 3146,
    "is_new": false,
    "is_bestseller": true,
    "is_featured": false,
    "is_published": true,
    "rating": 4.6,
    "review_count": 134,
    "primary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02801BLACK-1.webp?v=1787129765",
    "secondary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02801BLACK-2.webp?v=1787129765",
    "images": [
      {
        "id": "img-22-1",
        "product_id": "prod-dnora-22",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02801BLACK-1.webp?v=1787129765",
        "alt_text": "Voyage Mila Black Hobo Bag - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-22-2",
        "product_id": "prod-dnora-22",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02801BLACK-2.webp?v=1787129765",
        "alt_text": "Voyage Mila Black Hobo Bag - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-22-3",
        "product_id": "prod-dnora-22",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02801BLACK-3.webp?v=1787129765",
        "alt_text": "Voyage Mila Black Hobo Bag - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-22-4",
        "product_id": "prod-dnora-22",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02801BLACK-4.webp?v=1787129765",
        "alt_text": "Voyage Mila Black Hobo Bag - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-22-5",
        "product_id": "prod-dnora-22",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02801BLACK-5.webp?v=1787129765",
        "alt_text": "Voyage Mila Black Hobo Bag - View 5",
        "display_order": 5,
        "is_primary": false
      },
      {
        "id": "img-22-6",
        "product_id": "prod-dnora-22",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02801BLACK-6.webp?v=1787129765",
        "alt_text": "Voyage Mila Black Hobo Bag - View 6",
        "display_order": 6,
        "is_primary": false
      },
      {
        "id": "img-22-7",
        "product_id": "prod-dnora-22",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02801BLACK-7.webp?v=1787129765",
        "alt_text": "Voyage Mila Black Hobo Bag - View 7",
        "display_order": 7,
        "is_primary": false
      }
    ],
    "variants": [
      {
        "id": "var-22-std",
        "product_id": "prod-dnora-22",
        "sku": "DNR-VOYAGE-MIL-22",
        "color_name": "Black",
        "size": "One Size",
        "price_adjustment": 0,
        "stock": 31,
        "in_stock": true
      }
    ],
    "details": [
      "Crafted with signature premium vegan leather with supple pebble grain",
      "Reinforced top handles and adjustable/detachable shoulder strap",
      "Spacious main compartment with internal zippered organizer pocket",
      "Signature brushed gold metal accents and engraved DNORA logo emblem",
      "Water-resistant protective inner fabric lining"
    ],
    "care_instructions": "Wipe clean with a soft dry cloth. Keep away from direct sunlight and extreme moisture. Store in provided protective dust bag.",
    "shipping_info": "Dispatched within 24 hours. Free express delivery across India. 7-day hassle-free return window.",
    "stock_quantity": 45,
    "sku": "DNR-VOYAGE-MIL-22",
    "created_at": "2026-08-21T13:29:19.423Z",
    "tags": [
      "bestseller",
      "handbag",
      "luxury",
      "dnora",
      "handbags"
    ]
  },
  {
    "id": "prod-dnora-23",
    "slug": "voyage-mila-tan-hobo-bag",
    "name": "Voyage Mila Tan Hobo Bag",
    "subtitle": "Premium Leather Handbag",
    "short_description": "Exquisitely tailored voyage mila tan hobo bag with signature hardware and spacious interior.",
    "full_description": "Designed for modern versatility, the Voyage Mila Tan Hobo Bag combines minimalist poise with thoughtful utility. Crafted from premium vegan textured leather with reinforced top handles, smooth glide zips, and bespoke brushed gold hardware. Perfect for daily commutes, weekend brunches, and evening outings.",
    "category_slug": "handbags",
    "category_id": "cat-handbags",
    "base_price": 4495,
    "sale_price": 3146,
    "is_new": false,
    "is_bestseller": false,
    "is_featured": false,
    "is_published": true,
    "rating": 4.7,
    "review_count": 153,
    "primary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02801TAN-1.webp?v=1787129797",
    "secondary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02801TAN-2.webp?v=1787129797",
    "images": [
      {
        "id": "img-23-1",
        "product_id": "prod-dnora-23",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02801TAN-1.webp?v=1787129797",
        "alt_text": "Voyage Mila Tan Hobo Bag - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-23-2",
        "product_id": "prod-dnora-23",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02801TAN-2.webp?v=1787129797",
        "alt_text": "Voyage Mila Tan Hobo Bag - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-23-3",
        "product_id": "prod-dnora-23",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02801TAN-3.webp?v=1787129797",
        "alt_text": "Voyage Mila Tan Hobo Bag - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-23-4",
        "product_id": "prod-dnora-23",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02801TAN-4.webp?v=1787129797",
        "alt_text": "Voyage Mila Tan Hobo Bag - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-23-5",
        "product_id": "prod-dnora-23",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02801TAN-5.webp?v=1787129797",
        "alt_text": "Voyage Mila Tan Hobo Bag - View 5",
        "display_order": 5,
        "is_primary": false
      },
      {
        "id": "img-23-6",
        "product_id": "prod-dnora-23",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02801TAN-6.webp?v=1787129797",
        "alt_text": "Voyage Mila Tan Hobo Bag - View 6",
        "display_order": 6,
        "is_primary": false
      },
      {
        "id": "img-23-7",
        "product_id": "prod-dnora-23",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02801TAN-7.webp?v=1787129797",
        "alt_text": "Voyage Mila Tan Hobo Bag - View 7",
        "display_order": 7,
        "is_primary": false
      }
    ],
    "variants": [
      {
        "id": "var-23-std",
        "product_id": "prod-dnora-23",
        "sku": "DNR-VOYAGE-MIL-23",
        "color_name": "Tan",
        "size": "One Size",
        "price_adjustment": 0,
        "stock": 32,
        "in_stock": true
      }
    ],
    "details": [
      "Crafted with signature premium vegan leather with supple pebble grain",
      "Reinforced top handles and adjustable/detachable shoulder strap",
      "Spacious main compartment with internal zippered organizer pocket",
      "Signature brushed gold metal accents and engraved DNORA logo emblem",
      "Water-resistant protective inner fabric lining"
    ],
    "care_instructions": "Wipe clean with a soft dry cloth. Keep away from direct sunlight and extreme moisture. Store in provided protective dust bag.",
    "shipping_info": "Dispatched within 24 hours. Free express delivery across India. 7-day hassle-free return window.",
    "stock_quantity": 45,
    "sku": "DNR-VOYAGE-MIL-23",
    "created_at": "2026-08-20T13:29:19.423Z",
    "tags": [
      "bestseller",
      "handbag",
      "luxury",
      "dnora",
      "handbags"
    ]
  },
  {
    "id": "prod-dnora-24",
    "slug": "voyage-mila-beige-hobo-bag",
    "name": "Voyage Mila Beige Hobo Bag",
    "subtitle": "Premium Leather Handbag",
    "short_description": "Exquisitely tailored voyage mila beige hobo bag with signature hardware and spacious interior.",
    "full_description": "Designed for modern versatility, the Voyage Mila Beige Hobo Bag combines minimalist poise with thoughtful utility. Crafted from premium vegan textured leather with reinforced top handles, smooth glide zips, and bespoke brushed gold hardware. Perfect for daily commutes, weekend brunches, and evening outings.",
    "category_slug": "handbags",
    "category_id": "cat-handbags",
    "base_price": 4495,
    "sale_price": 3146,
    "is_new": false,
    "is_bestseller": false,
    "is_featured": false,
    "is_published": true,
    "rating": 4.8,
    "review_count": 172,
    "primary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02801BEIGE-1.webp?v=1787129705",
    "secondary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02801BEIGE-2.webp?v=1787129705",
    "images": [
      {
        "id": "img-24-1",
        "product_id": "prod-dnora-24",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02801BEIGE-1.webp?v=1787129705",
        "alt_text": "Voyage Mila Beige Hobo Bag - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-24-2",
        "product_id": "prod-dnora-24",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02801BEIGE-2.webp?v=1787129705",
        "alt_text": "Voyage Mila Beige Hobo Bag - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-24-3",
        "product_id": "prod-dnora-24",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02801BEIGE-3.webp?v=1787129705",
        "alt_text": "Voyage Mila Beige Hobo Bag - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-24-4",
        "product_id": "prod-dnora-24",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02801BEIGE-4.webp?v=1787129705",
        "alt_text": "Voyage Mila Beige Hobo Bag - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-24-5",
        "product_id": "prod-dnora-24",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02801BEIGE-5.webp?v=1787129705",
        "alt_text": "Voyage Mila Beige Hobo Bag - View 5",
        "display_order": 5,
        "is_primary": false
      },
      {
        "id": "img-24-6",
        "product_id": "prod-dnora-24",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02801BEIGE-6.webp?v=1787129705",
        "alt_text": "Voyage Mila Beige Hobo Bag - View 6",
        "display_order": 6,
        "is_primary": false
      },
      {
        "id": "img-24-7",
        "product_id": "prod-dnora-24",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02801BEIGE-7.webp?v=1787129705",
        "alt_text": "Voyage Mila Beige Hobo Bag - View 7",
        "display_order": 7,
        "is_primary": false
      }
    ],
    "variants": [
      {
        "id": "var-24-std",
        "product_id": "prod-dnora-24",
        "sku": "DNR-VOYAGE-MIL-24",
        "color_name": "Beige",
        "size": "One Size",
        "price_adjustment": 0,
        "stock": 33,
        "in_stock": true
      }
    ],
    "details": [
      "Crafted with signature premium vegan leather with supple pebble grain",
      "Reinforced top handles and adjustable/detachable shoulder strap",
      "Spacious main compartment with internal zippered organizer pocket",
      "Signature brushed gold metal accents and engraved DNORA logo emblem",
      "Water-resistant protective inner fabric lining"
    ],
    "care_instructions": "Wipe clean with a soft dry cloth. Keep away from direct sunlight and extreme moisture. Store in provided protective dust bag.",
    "shipping_info": "Dispatched within 24 hours. Free express delivery across India. 7-day hassle-free return window.",
    "stock_quantity": 45,
    "sku": "DNR-VOYAGE-MIL-24",
    "created_at": "2026-08-19T13:29:19.423Z",
    "tags": [
      "bestseller",
      "handbag",
      "luxury",
      "dnora",
      "handbags"
    ]
  },
  {
    "id": "prod-dnora-25",
    "slug": "texas-elan-coffee-shoulder-bag",
    "name": "Texas Elan Coffee Shoulder Bag",
    "subtitle": "Classic Shoulder Bag",
    "short_description": "Exquisitely tailored texas elan coffee shoulder bag with signature hardware and spacious interior.",
    "full_description": "Designed for modern versatility, the Texas Elan Coffee Shoulder Bag combines minimalist poise with thoughtful utility. Crafted from premium vegan textured leather with reinforced top handles, smooth glide zips, and bespoke brushed gold hardware. Perfect for daily commutes, weekend brunches, and evening outings.",
    "category_slug": "handbags",
    "category_id": "cat-handbags",
    "base_price": 3995,
    "sale_price": 2796,
    "is_new": false,
    "is_bestseller": true,
    "is_featured": true,
    "is_published": true,
    "rating": 4.9,
    "review_count": 191,
    "primary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02800COFFEE-1.webp?v=1787129343",
    "secondary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02800COFFEE-2.webp?v=1787129343",
    "images": [
      {
        "id": "img-25-1",
        "product_id": "prod-dnora-25",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02800COFFEE-1.webp?v=1787129343",
        "alt_text": "Texas Elan Coffee Shoulder Bag - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-25-2",
        "product_id": "prod-dnora-25",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02800COFFEE-2.webp?v=1787129343",
        "alt_text": "Texas Elan Coffee Shoulder Bag - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-25-3",
        "product_id": "prod-dnora-25",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02800COFFEE-3.webp?v=1787129343",
        "alt_text": "Texas Elan Coffee Shoulder Bag - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-25-4",
        "product_id": "prod-dnora-25",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02800COFFEE-4.webp?v=1787129343",
        "alt_text": "Texas Elan Coffee Shoulder Bag - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-25-5",
        "product_id": "prod-dnora-25",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02800COFFEE-5.webp?v=1787129343",
        "alt_text": "Texas Elan Coffee Shoulder Bag - View 5",
        "display_order": 5,
        "is_primary": false
      },
      {
        "id": "img-25-6",
        "product_id": "prod-dnora-25",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02800COFFEE-6.webp?v=1787129343",
        "alt_text": "Texas Elan Coffee Shoulder Bag - View 6",
        "display_order": 6,
        "is_primary": false
      },
      {
        "id": "img-25-7",
        "product_id": "prod-dnora-25",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02800COFFEE-7.webp?v=1787129343",
        "alt_text": "Texas Elan Coffee Shoulder Bag - View 7",
        "display_order": 7,
        "is_primary": false
      }
    ],
    "variants": [
      {
        "id": "var-25-std",
        "product_id": "prod-dnora-25",
        "sku": "DNR-TEXAS-ELAN-25",
        "color_name": "Coffee",
        "size": "One Size",
        "price_adjustment": 0,
        "stock": 34,
        "in_stock": true
      }
    ],
    "details": [
      "Crafted with signature premium vegan leather with supple pebble grain",
      "Reinforced top handles and adjustable/detachable shoulder strap",
      "Spacious main compartment with internal zippered organizer pocket",
      "Signature brushed gold metal accents and engraved DNORA logo emblem",
      "Water-resistant protective inner fabric lining"
    ],
    "care_instructions": "Wipe clean with a soft dry cloth. Keep away from direct sunlight and extreme moisture. Store in provided protective dust bag.",
    "shipping_info": "Dispatched within 24 hours. Free express delivery across India. 7-day hassle-free return window.",
    "stock_quantity": 45,
    "sku": "DNR-TEXAS-ELAN-25",
    "created_at": "2026-08-18T13:29:19.423Z",
    "tags": [
      "bestseller",
      "handbag",
      "luxury",
      "dnora",
      "handbags"
    ]
  },
  {
    "id": "prod-dnora-26",
    "slug": "texas-elan-off-white-shoulder-bag",
    "name": "Texas Elan Off-White Shoulder Bag",
    "subtitle": "Classic Shoulder Bag",
    "short_description": "Exquisitely tailored texas elan off-white shoulder bag with signature hardware and spacious interior.",
    "full_description": "Designed for modern versatility, the Texas Elan Off-White Shoulder Bag combines minimalist poise with thoughtful utility. Crafted from premium vegan textured leather with reinforced top handles, smooth glide zips, and bespoke brushed gold hardware. Perfect for daily commutes, weekend brunches, and evening outings.",
    "category_slug": "handbags",
    "category_id": "cat-handbags",
    "base_price": 3995,
    "sale_price": 2796,
    "is_new": false,
    "is_bestseller": false,
    "is_featured": false,
    "is_published": true,
    "rating": 4.5,
    "review_count": 210,
    "primary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02800OFFWHITE-1.webp?v=1787129370",
    "secondary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02800OFFWHITE-2.webp?v=1787129370",
    "images": [
      {
        "id": "img-26-1",
        "product_id": "prod-dnora-26",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02800OFFWHITE-1.webp?v=1787129370",
        "alt_text": "Texas Elan Off-White Shoulder Bag - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-26-2",
        "product_id": "prod-dnora-26",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02800OFFWHITE-2.webp?v=1787129370",
        "alt_text": "Texas Elan Off-White Shoulder Bag - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-26-3",
        "product_id": "prod-dnora-26",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02800OFFWHITE-3.webp?v=1787129370",
        "alt_text": "Texas Elan Off-White Shoulder Bag - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-26-4",
        "product_id": "prod-dnora-26",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02800OFFWHITE-4.webp?v=1787129370",
        "alt_text": "Texas Elan Off-White Shoulder Bag - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-26-5",
        "product_id": "prod-dnora-26",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02800OFFWHITE-5.webp?v=1787129370",
        "alt_text": "Texas Elan Off-White Shoulder Bag - View 5",
        "display_order": 5,
        "is_primary": false
      },
      {
        "id": "img-26-6",
        "product_id": "prod-dnora-26",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02800OFFWHITE-6.webp?v=1787129370",
        "alt_text": "Texas Elan Off-White Shoulder Bag - View 6",
        "display_order": 6,
        "is_primary": false
      },
      {
        "id": "img-26-7",
        "product_id": "prod-dnora-26",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02800OFFWHITE-7.webp?v=1787129370",
        "alt_text": "Texas Elan Off-White Shoulder Bag - View 7",
        "display_order": 7,
        "is_primary": false
      }
    ],
    "variants": [
      {
        "id": "var-26-std",
        "product_id": "prod-dnora-26",
        "sku": "DNR-TEXAS-ELAN-26",
        "color_name": "Off-White",
        "size": "One Size",
        "price_adjustment": 0,
        "stock": 35,
        "in_stock": true
      }
    ],
    "details": [
      "Crafted with signature premium vegan leather with supple pebble grain",
      "Reinforced top handles and adjustable/detachable shoulder strap",
      "Spacious main compartment with internal zippered organizer pocket",
      "Signature brushed gold metal accents and engraved DNORA logo emblem",
      "Water-resistant protective inner fabric lining"
    ],
    "care_instructions": "Wipe clean with a soft dry cloth. Keep away from direct sunlight and extreme moisture. Store in provided protective dust bag.",
    "shipping_info": "Dispatched within 24 hours. Free express delivery across India. 7-day hassle-free return window.",
    "stock_quantity": 45,
    "sku": "DNR-TEXAS-ELAN-26",
    "created_at": "2026-08-17T13:29:19.423Z",
    "tags": [
      "bestseller",
      "handbag",
      "luxury",
      "dnora",
      "handbags"
    ]
  },
  {
    "id": "prod-dnora-27",
    "slug": "voyage-eleanor-off-white-satchel-bag",
    "name": "Voyage Eleanor Off-White Satchel Bag",
    "subtitle": "Structured Satchel Bag",
    "short_description": "Exquisitely tailored voyage eleanor off-white satchel bag with signature hardware and spacious interior.",
    "full_description": "Designed for modern versatility, the Voyage Eleanor Off-White Satchel Bag combines minimalist poise with thoughtful utility. Crafted from premium vegan textured leather with reinforced top handles, smooth glide zips, and bespoke brushed gold hardware. Perfect for daily commutes, weekend brunches, and evening outings.",
    "category_slug": "satchels",
    "category_id": "cat-satchels",
    "base_price": 4495,
    "sale_price": 3146,
    "is_new": false,
    "is_bestseller": false,
    "is_featured": false,
    "is_published": true,
    "rating": 4.6,
    "review_count": 229,
    "primary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02799OFFWHITE-1.webp?v=1787126811",
    "secondary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02799OFFWHITE-2.webp?v=1787126811",
    "images": [
      {
        "id": "img-27-1",
        "product_id": "prod-dnora-27",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02799OFFWHITE-1.webp?v=1787126811",
        "alt_text": "Voyage Eleanor Off-White Satchel Bag - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-27-2",
        "product_id": "prod-dnora-27",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02799OFFWHITE-2.webp?v=1787126811",
        "alt_text": "Voyage Eleanor Off-White Satchel Bag - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-27-3",
        "product_id": "prod-dnora-27",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02799OFFWHITE-3.webp?v=1787126811",
        "alt_text": "Voyage Eleanor Off-White Satchel Bag - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-27-4",
        "product_id": "prod-dnora-27",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02799OFFWHITE-4.webp?v=1787126811",
        "alt_text": "Voyage Eleanor Off-White Satchel Bag - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-27-5",
        "product_id": "prod-dnora-27",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02799OFFWHITE-5.webp?v=1787126811",
        "alt_text": "Voyage Eleanor Off-White Satchel Bag - View 5",
        "display_order": 5,
        "is_primary": false
      },
      {
        "id": "img-27-6",
        "product_id": "prod-dnora-27",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02799OFFWHITE-6.webp?v=1787126811",
        "alt_text": "Voyage Eleanor Off-White Satchel Bag - View 6",
        "display_order": 6,
        "is_primary": false
      },
      {
        "id": "img-27-7",
        "product_id": "prod-dnora-27",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02799OFFWHITE-7.webp?v=1787126811",
        "alt_text": "Voyage Eleanor Off-White Satchel Bag - View 7",
        "display_order": 7,
        "is_primary": false
      }
    ],
    "variants": [
      {
        "id": "var-27-std",
        "product_id": "prod-dnora-27",
        "sku": "DNR-VOYAGE-ELE-27",
        "color_name": "Off-White",
        "size": "One Size",
        "price_adjustment": 0,
        "stock": 36,
        "in_stock": true
      }
    ],
    "details": [
      "Crafted with signature premium vegan leather with supple pebble grain",
      "Reinforced top handles and adjustable/detachable shoulder strap",
      "Spacious main compartment with internal zippered organizer pocket",
      "Signature brushed gold metal accents and engraved DNORA logo emblem",
      "Water-resistant protective inner fabric lining"
    ],
    "care_instructions": "Wipe clean with a soft dry cloth. Keep away from direct sunlight and extreme moisture. Store in provided protective dust bag.",
    "shipping_info": "Dispatched within 24 hours. Free express delivery across India. 7-day hassle-free return window.",
    "stock_quantity": 45,
    "sku": "DNR-VOYAGE-ELE-27",
    "created_at": "2026-08-16T13:29:19.423Z",
    "tags": [
      "bestseller",
      "handbag",
      "luxury",
      "dnora",
      "satchels"
    ]
  },
  {
    "id": "prod-dnora-28",
    "slug": "voyage-eleanor-coffee-satchel-bag",
    "name": "Voyage Eleanor Coffee Satchel Bag",
    "subtitle": "Structured Satchel Bag",
    "short_description": "Exquisitely tailored voyage eleanor coffee satchel bag with signature hardware and spacious interior.",
    "full_description": "Designed for modern versatility, the Voyage Eleanor Coffee Satchel Bag combines minimalist poise with thoughtful utility. Crafted from premium vegan textured leather with reinforced top handles, smooth glide zips, and bespoke brushed gold hardware. Perfect for daily commutes, weekend brunches, and evening outings.",
    "category_slug": "satchels",
    "category_id": "cat-satchels",
    "base_price": 4495,
    "sale_price": 3146,
    "is_new": false,
    "is_bestseller": true,
    "is_featured": false,
    "is_published": true,
    "rating": 4.7,
    "review_count": 248,
    "primary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02799COFFEE-1.webp?v=1787126804",
    "secondary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02799COFFEE-2.webp?v=1787126804",
    "images": [
      {
        "id": "img-28-1",
        "product_id": "prod-dnora-28",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02799COFFEE-1.webp?v=1787126804",
        "alt_text": "Voyage Eleanor Coffee Satchel Bag - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-28-2",
        "product_id": "prod-dnora-28",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02799COFFEE-2.webp?v=1787126804",
        "alt_text": "Voyage Eleanor Coffee Satchel Bag - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-28-3",
        "product_id": "prod-dnora-28",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02799COFFEE-3.webp?v=1787126803",
        "alt_text": "Voyage Eleanor Coffee Satchel Bag - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-28-4",
        "product_id": "prod-dnora-28",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02799COFFEE-4.webp?v=1787126804",
        "alt_text": "Voyage Eleanor Coffee Satchel Bag - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-28-5",
        "product_id": "prod-dnora-28",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02799COFFEE-5.webp?v=1787126804",
        "alt_text": "Voyage Eleanor Coffee Satchel Bag - View 5",
        "display_order": 5,
        "is_primary": false
      },
      {
        "id": "img-28-6",
        "product_id": "prod-dnora-28",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02799COFFEE-6.webp?v=1787126804",
        "alt_text": "Voyage Eleanor Coffee Satchel Bag - View 6",
        "display_order": 6,
        "is_primary": false
      },
      {
        "id": "img-28-7",
        "product_id": "prod-dnora-28",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02799COFFEE-7.webp?v=1787126804",
        "alt_text": "Voyage Eleanor Coffee Satchel Bag - View 7",
        "display_order": 7,
        "is_primary": false
      }
    ],
    "variants": [
      {
        "id": "var-28-std",
        "product_id": "prod-dnora-28",
        "sku": "DNR-VOYAGE-ELE-28",
        "color_name": "Coffee",
        "size": "One Size",
        "price_adjustment": 0,
        "stock": 37,
        "in_stock": true
      }
    ],
    "details": [
      "Crafted with signature premium vegan leather with supple pebble grain",
      "Reinforced top handles and adjustable/detachable shoulder strap",
      "Spacious main compartment with internal zippered organizer pocket",
      "Signature brushed gold metal accents and engraved DNORA logo emblem",
      "Water-resistant protective inner fabric lining"
    ],
    "care_instructions": "Wipe clean with a soft dry cloth. Keep away from direct sunlight and extreme moisture. Store in provided protective dust bag.",
    "shipping_info": "Dispatched within 24 hours. Free express delivery across India. 7-day hassle-free return window.",
    "stock_quantity": 45,
    "sku": "DNR-VOYAGE-ELE-28",
    "created_at": "2026-08-15T13:29:19.423Z",
    "tags": [
      "bestseller",
      "handbag",
      "luxury",
      "dnora",
      "satchels"
    ]
  },
  {
    "id": "prod-dnora-29",
    "slug": "ella-charlotte-coffee-satchel-bag",
    "name": "Ella Charlotte Coffee Satchel Bag",
    "subtitle": "Structured Satchel Bag",
    "short_description": "Exquisitely tailored ella charlotte coffee satchel bag with signature hardware and spacious interior.",
    "full_description": "Designed for modern versatility, the Ella Charlotte Coffee Satchel Bag combines minimalist poise with thoughtful utility. Crafted from premium vegan textured leather with reinforced top handles, smooth glide zips, and bespoke brushed gold hardware. Perfect for daily commutes, weekend brunches, and evening outings.",
    "category_slug": "satchels",
    "category_id": "cat-satchels",
    "base_price": 3995,
    "sale_price": 2796,
    "is_new": false,
    "is_bestseller": false,
    "is_featured": true,
    "is_published": true,
    "rating": 4.8,
    "review_count": 267,
    "primary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02798COFFEE-1_2b9b4dd0-927b-4158-86f3-76315421231d.webp?v=1787125827",
    "secondary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02798COFFEE-2_adbf7585-deeb-4819-847b-013cb62060dc.webp?v=1787125827",
    "images": [
      {
        "id": "img-29-1",
        "product_id": "prod-dnora-29",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02798COFFEE-1_2b9b4dd0-927b-4158-86f3-76315421231d.webp?v=1787125827",
        "alt_text": "Ella Charlotte Coffee Satchel Bag - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-29-2",
        "product_id": "prod-dnora-29",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02798COFFEE-2_adbf7585-deeb-4819-847b-013cb62060dc.webp?v=1787125827",
        "alt_text": "Ella Charlotte Coffee Satchel Bag - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-29-3",
        "product_id": "prod-dnora-29",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02798COFFEE-3_0b82f653-a3e8-4b1c-b608-79b21e928bc7.webp?v=1787125827",
        "alt_text": "Ella Charlotte Coffee Satchel Bag - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-29-4",
        "product_id": "prod-dnora-29",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02798COFFEE-4_c12254aa-7555-4888-aa8a-6d9a2aa033d7.webp?v=1787125827",
        "alt_text": "Ella Charlotte Coffee Satchel Bag - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-29-5",
        "product_id": "prod-dnora-29",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02798COFFEE-5_c68b86c5-9285-488e-b9e4-6594dc77aa2f.webp?v=1787125827",
        "alt_text": "Ella Charlotte Coffee Satchel Bag - View 5",
        "display_order": 5,
        "is_primary": false
      },
      {
        "id": "img-29-6",
        "product_id": "prod-dnora-29",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02798COFFEE-6_9f61777e-db3c-49c2-9b0a-00344902b9ff.webp?v=1787125827",
        "alt_text": "Ella Charlotte Coffee Satchel Bag - View 6",
        "display_order": 6,
        "is_primary": false
      },
      {
        "id": "img-29-7",
        "product_id": "prod-dnora-29",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02798COFFEE-7_fc218af3-e2d0-413e-a444-c7402a22f8ec.webp?v=1787125827",
        "alt_text": "Ella Charlotte Coffee Satchel Bag - View 7",
        "display_order": 7,
        "is_primary": false
      }
    ],
    "variants": [
      {
        "id": "var-29-std",
        "product_id": "prod-dnora-29",
        "sku": "DNR-ELLA-CHARL-29",
        "color_name": "Coffee",
        "size": "One Size",
        "price_adjustment": 0,
        "stock": 38,
        "in_stock": true
      }
    ],
    "details": [
      "Crafted with signature premium vegan leather with supple pebble grain",
      "Reinforced top handles and adjustable/detachable shoulder strap",
      "Spacious main compartment with internal zippered organizer pocket",
      "Signature brushed gold metal accents and engraved DNORA logo emblem",
      "Water-resistant protective inner fabric lining"
    ],
    "care_instructions": "Wipe clean with a soft dry cloth. Keep away from direct sunlight and extreme moisture. Store in provided protective dust bag.",
    "shipping_info": "Dispatched within 24 hours. Free express delivery across India. 7-day hassle-free return window.",
    "stock_quantity": 45,
    "sku": "DNR-ELLA-CHARL-29",
    "created_at": "2026-08-14T13:29:19.423Z",
    "tags": [
      "bestseller",
      "handbag",
      "luxury",
      "dnora",
      "satchels"
    ]
  },
  {
    "id": "prod-dnora-30",
    "slug": "ella-sara-coffee-shoulder-bag",
    "name": "Ella Sara Coffee Shoulder Bag",
    "subtitle": "Classic Shoulder Bag",
    "short_description": "Exquisitely tailored ella sara coffee shoulder bag with signature hardware and spacious interior.",
    "full_description": "Designed for modern versatility, the Ella Sara Coffee Shoulder Bag combines minimalist poise with thoughtful utility. Crafted from premium vegan textured leather with reinforced top handles, smooth glide zips, and bespoke brushed gold hardware. Perfect for daily commutes, weekend brunches, and evening outings.",
    "category_slug": "handbags",
    "category_id": "cat-handbags",
    "base_price": 3495,
    "sale_price": 2446,
    "is_new": false,
    "is_bestseller": false,
    "is_featured": false,
    "is_published": true,
    "rating": 4.9,
    "review_count": 286,
    "primary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02797COFFEE-1.webp?v=1787125033",
    "secondary_image": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02797COFFEE-2.webp?v=1787125033",
    "images": [
      {
        "id": "img-30-1",
        "product_id": "prod-dnora-30",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02797COFFEE-1.webp?v=1787125033",
        "alt_text": "Ella Sara Coffee Shoulder Bag - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-30-2",
        "product_id": "prod-dnora-30",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02797COFFEE-2.webp?v=1787125033",
        "alt_text": "Ella Sara Coffee Shoulder Bag - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-30-3",
        "product_id": "prod-dnora-30",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02797COFFEE-3.webp?v=1787125033",
        "alt_text": "Ella Sara Coffee Shoulder Bag - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-30-4",
        "product_id": "prod-dnora-30",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02797COFFEE-4.webp?v=1787125033",
        "alt_text": "Ella Sara Coffee Shoulder Bag - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-30-5",
        "product_id": "prod-dnora-30",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02797COFFEE-5.webp?v=1787125033",
        "alt_text": "Ella Sara Coffee Shoulder Bag - View 5",
        "display_order": 5,
        "is_primary": false
      },
      {
        "id": "img-30-6",
        "product_id": "prod-dnora-30",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02797COFFEE-6.webp?v=1787125033",
        "alt_text": "Ella Sara Coffee Shoulder Bag - View 6",
        "display_order": 6,
        "is_primary": false
      },
      {
        "id": "img-30-7",
        "product_id": "prod-dnora-30",
        "url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWHB02797COFFEE-7.webp?v=1787125033",
        "alt_text": "Ella Sara Coffee Shoulder Bag - View 7",
        "display_order": 7,
        "is_primary": false
      }
    ],
    "variants": [
      {
        "id": "var-30-std",
        "product_id": "prod-dnora-30",
        "sku": "DNR-ELLA-SARA--30",
        "color_name": "Coffee",
        "size": "One Size",
        "price_adjustment": 0,
        "stock": 39,
        "in_stock": true
      }
    ],
    "details": [
      "Crafted with signature premium vegan leather with supple pebble grain",
      "Reinforced top handles and adjustable/detachable shoulder strap",
      "Spacious main compartment with internal zippered organizer pocket",
      "Signature brushed gold metal accents and engraved DNORA logo emblem",
      "Water-resistant protective inner fabric lining"
    ],
    "care_instructions": "Wipe clean with a soft dry cloth. Keep away from direct sunlight and extreme moisture. Store in provided protective dust bag.",
    "shipping_info": "Dispatched within 24 hours. Free express delivery across India. 7-day hassle-free return window.",
    "stock_quantity": 45,
    "sku": "DNR-ELLA-SARA--30",
    "created_at": "2026-08-13T13:29:19.423Z",
    "tags": [
      "bestseller",
      "handbag",
      "luxury",
      "dnora",
      "handbags"
    ]
  },
  {
    "id": "prod-oud-royale",
    "slug": "oud-royale-extrait-de-parfum",
    "name": "Oud Royale Extrait de Parfum",
    "subtitle": "Assam Agarwood, Damascena Rose & Smoked Amber",
    "short_description": "A transcendental 30% concentration extrait honoring Mughal perfumery heritage.",
    "full_description": "Oud Royale is an ode to regal nocturnal journeys. Sourced from 80-year-old sustainably cultivated Aquilaria agallocha trees in Assam, aged in French oak for six months, and blended with Taif rose and Mysore sandalwood.",
    "category_slug": "perfumes",
    "category_id": "cat-perfumes",
    "base_price": 12500,
    "sale_price": 9999,
    "is_new": false,
    "is_bestseller": true,
    "is_featured": true,
    "is_published": true,
    "rating": 4.9,
    "review_count": 88,
    "primary_image": "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80",
    "secondary_image": "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=80",
    "images": [
      {
        "id": "img-oud-1",
        "product_id": "prod-oud-royale",
        "url": "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80",
        "alt_text": "Oud Royale bottle",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-oud-2",
        "product_id": "prod-oud-royale",
        "url": "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=80",
        "alt_text": "Oud Royale packaging",
        "display_order": 2,
        "is_primary": false
      }
    ],
    "variants": [
      {
        "id": "var-oud-50",
        "product_id": "prod-oud-royale",
        "sku": "DNR-PER-OUD-50",
        "volume_ml": 50,
        "stock": 30,
        "in_stock": true
      }
    ],
    "details": [
      "30% Extrait de Parfum concentration",
      "Triple-distilled organic cane alcohol base",
      "Bespoke heavy fluted crystal flacon",
      "Hand-numbered batch certificate"
    ],
    "care_instructions": "Store in a cool dry space away from direct sunlight.",
    "shipping_info": "Dispatched via temperature-controlled express air.",
    "stock_quantity": 30,
    "sku": "DNR-PER-OUD-50",
    "created_at": "2026-09-11T13:30:52.669Z",
    "tags": [
      "perfume",
      "extrait",
      "oud",
      "luxury",
      "bestseller"
    ]
  },
  {
    "id": "prod-lotus-charm",
    "slug": "padma-gilded-lotus-purse-charm",
    "name": "The Padma Lotus Purse Charm",
    "subtitle": "24K Gold Plated Brass with Natural Basra Seed Pearl",
    "short_description": "A talisman of rebirth, sculpted in lost-wax cast brass with an heirloom pearl.",
    "full_description": "The Padma Lotus Charm converts any handbag into a customized statement of heritage. Featuring eight blossoming petals cast in heavyweight jewelers brass and finished in thick 24k champagne gold vermeil.",
    "category_slug": "purse-charms",
    "category_id": "cat-purse-charms",
    "base_price": 3499,
    "sale_price": 2499,
    "is_new": false,
    "is_bestseller": true,
    "is_featured": false,
    "is_published": true,
    "rating": 4.8,
    "review_count": 42,
    "primary_image": "https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=1200&q=80",
    "secondary_image": "https://images.unsplash.com/photo-1608042314453-ae338d80c427?auto=format&fit=crop&w=1200&q=80",
    "images": [
      {
        "id": "img-charm-1",
        "product_id": "prod-lotus-charm",
        "url": "https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=1200&q=80",
        "alt_text": "Lotus charm view 1",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-charm-gold",
        "product_id": "prod-lotus-charm",
        "sku": "DNR-CHM-PAD-01",
        "color_name": "Champagne Gold",
        "stock": 40,
        "in_stock": true
      }
    ],
    "details": [
      "24K Champagne gold vermeil on solid brass",
      "Natural Basra baroque seed pearl drop",
      "Universal high-tensile spring snap hook"
    ],
    "care_instructions": "Keep dry. Polish with micro-fiber cloth.",
    "shipping_info": "Dispatched within 24 hours.",
    "stock_quantity": 40,
    "sku": "DNR-CHM-PAD-01",
    "created_at": "2026-09-11T13:30:52.670Z",
    "tags": [
      "charm",
      "gold",
      "lotus",
      "bestseller"
    ]
  }
];

export const INITIAL_COLLECTIONS: Collection[] = [
  {
    "id": "col-bestsellers",
    "slug": "bestsellers",
    "name": "Most Loved Bestsellers",
    "tagline": "Our most coveted handbags, totes, and slings",
    "description": "Curated collection of our highest-rated creations designed for effortless everyday luxury.",
    "image_url": "https://www.linoperros.com/cdn/shop/files/Homepage_Banner_Web_8ac65c1d-2f25-4ffe-ad2c-a9423388431e.webp?v=1788195269&width=1920",
    "product_ids": [
      "prod-dnora-1",
      "prod-dnora-4",
      "prod-dnora-7",
      "prod-dnora-10",
      "prod-dnora-13",
      "prod-dnora-16",
      "prod-dnora-19",
      "prod-dnora-22",
      "prod-dnora-25",
      "prod-dnora-28",
      "prod-oud-royale",
      "prod-lotus-charm"
    ],
    "is_active": true
  },
  {
    "id": "col-new-arrivals",
    "slug": "new-arrivals",
    "name": "Fresh Arrivals",
    "tagline": "The newest styles just released this season",
    "description": "Explore the latest color palettes, architectural silhouettes, and modern finishes.",
    "image_url": "https://www.linoperros.com/cdn/shop/files/Circular_512_X_512_Icon_Webp_1.jpg?v=1786340044&width=600",
    "product_ids": [
      "prod-dnora-1",
      "prod-dnora-2",
      "prod-dnora-3",
      "prod-dnora-4",
      "prod-dnora-5",
      "prod-dnora-6",
      "prod-dnora-7",
      "prod-dnora-8"
    ],
    "is_active": true
  }
];

export const INITIAL_BANNERS: Banner[] = [
  {
    "id": "ban-hero-main",
    "title": "ELEVATE YOUR EVERYDAY ESSENTIALS",
    "subtitle": "PREMIUM HANDBAGS & ACCESSORIES",
    "cta_text": "EXPLORE COLLECTION",
    "cta_link": "/shop",
    "desktop_image_url": "https://www.linoperros.com/cdn/shop/files/Homepage_Banner_Web_8ac65c1d-2f25-4ffe-ad2c-a9423388431e.webp?v=1788195269&width=1920",
    "mobile_image_url": "https://www.linoperros.com/cdn/shop/files/Homepage_Banner_Mobile_0c0da590-f14a-4822-af82-fcbf6d0da56f.webp?v=1788195269&width=640",
    "is_active": true,
    "display_order": 1,
    "type": "hero"
  },
  {
    "id": "ban-workwear-totes",
    "title": "STRUCTURED SOPHISTICATION",
    "subtitle": "TOTE & SATCHEL COLLECTION",
    "cta_text": "SHOP TOTES",
    "cta_link": "/shop/tote-bags",
    "desktop_image_url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00576BROWN-1.webp?v=1787132169",
    "mobile_image_url": "https://cdn.shopify.com/s/files/1/0685/2729/2705/files/LWSL00576BROWN-1.webp?v=1787132169",
    "is_active": true,
    "display_order": 2,
    "type": "editorial"
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    "id": "coup-dnora10",
    "code": "DNORA10",
    "description": "Extra 10% Off on orders above ₹1,499",
    "discount_type": "percentage",
    "discount_value": 10,
    "min_cart_value": 1499,
    "max_discount_amount": 1000,
    "start_date": "2025-01-01T00:00:00Z",
    "end_date": "2027-12-31T23:59:59Z",
    "usage_limit": 10000,
    "times_used": 342,
    "is_active": true
  },
  {
    "id": "coup-firstorder",
    "code": "WELCOME15",
    "description": "Welcome 15% Off on your first luxury order",
    "discount_type": "percentage",
    "discount_value": 15,
    "min_cart_value": 1999,
    "max_discount_amount": 1500,
    "start_date": "2025-01-01T00:00:00Z",
    "end_date": "2027-12-31T23:59:59Z",
    "usage_limit": 5000,
    "times_used": 812,
    "is_active": true
  }
];

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  "brand_name": "DNORA",
  "currency": "INR",
  "currency_symbol": "₹",
  "free_shipping_threshold": 999,
  "standard_shipping_fee": 99,
  "express_shipping_fee": 199,
  "tax_percentage": 18,
  "contact_email": "concierge@dnora.com",
  "concierge_phone": "+91 98765 43210",
  "announcement_text": "GET EXTRA 10% OFF ON PREPAID ORDERS | CODE: DNORA10"
};

export const INITIAL_STORE_SETTINGS = DEFAULT_STORE_SETTINGS;

export const INITIAL_REVIEWS: Review[] = [
  {
    "id": "rev-1",
    "product_id": "prod-dnora-1",
    "user_name": "Ananya Sharma",
    "user_email": "ananya.s@example.com",
    "rating": 5,
    "title": "Absolutely gorgeous bag!",
    "comment": "The finish and texture are beyond expectations. It feels so premium and sturdy. Fits my daily essentials with ease.",
    "verified_purchase": true,
    "status": "approved",
    "created_at": "2026-08-14T10:30:00Z"
  },
  {
    "id": "rev-2",
    "product_id": "prod-dnora-2",
    "user_name": "Rhea Kapoor",
    "user_email": "rhea.k@example.com",
    "rating": 5,
    "title": "Classy and modern look",
    "comment": "The off-white shade is so elegant. Gold hardware doesn't look cheap at all. DNORA has nailed the luxury aesthetic!",
    "verified_purchase": true,
    "status": "approved",
    "created_at": "2026-08-20T14:15:00Z"
  },
  {
    "id": "rev-3",
    "product_id": "prod-dnora-3",
    "user_name": "Pooja Mehta",
    "user_email": "pooja.m@example.com",
    "rating": 5,
    "title": "Perfect sling for travel and everyday outings",
    "comment": "Love the olive color and multiple pockets. Very lightweight and chic.",
    "verified_purchase": true,
    "status": "approved",
    "created_at": "2026-08-28T09:00:00Z"
  }
];
