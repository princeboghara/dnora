export type CategorySlug =
  | "handbags"
  | "bucket-bags"
  | "shoulder-bags"
  | "hobo-bags"
  | "crossbody-bags"
  | "tote-bags"
  | "sling-bags"
  | "satchels"
  | "clutches"
  | "backpacks"
  | "perfumes"
  | "jewellery"
  | "clothing"
  | "purse-charms"
  | "accessories"
  | string;

export interface Category {
  id: string;
  slug: CategorySlug;
  name: string;
  tagline: string;
  description: string;
  image_url: string;
  hero_image_url: string;
  display_order: number;
  is_active: boolean;
  seo_title?: string;
  seo_description?: string;
  product_count?: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  color_name?: string;
  color_hex?: string;
  size?: string;
  volume_ml?: number;
  price_adjustment?: number;
  stock: number;
  in_stock: boolean;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string;
  display_order: number;
  is_primary: boolean;
}

export interface HandbagAttributes {
  material: string;
  dimensions: string;
  color: string;
  strap_type: string;
  closure: string;
  interior_compartments: string;
  hardware_finish?: string;
  weight_grams?: number;
}

export interface PerfumeAttributes {
  fragrance_family: string;
  top_notes: string[];
  heart_notes: string[];
  base_notes: string[];
  volume: string;
  gender: "Unisex" | "Feminine" | "Masculine";
  concentration: "Eau de Parfum" | "Extrait de Parfum";
  sillage: string;
  ingredients: string;
}

export interface ClothingAttributes {
  size_range: string[];
  fabric: string;
  fit: string;
  color: string;
  care_instructions: string;
  model_height?: string;
  lining?: string;
}

export interface JewelleryAttributes {
  material: string;
  finish: string;
  stone_type?: string;
  dimensions: string;
  weight_grams?: string;
  hallmark?: string;
  care: string;
}

export interface PurseCharmAttributes {
  material: string;
  color: string;
  size: string;
  compatibility: string;
  hardware_finish: string;
  care?: string;
}

export interface AccessoryAttributes {
  material: string;
  dimensions: string;
  color: string;
  care: string;
  finish?: string;
}

export type ProductAttributes =
  | { type: "handbags"; data: HandbagAttributes }
  | { type: "perfumes"; data: PerfumeAttributes }
  | { type: "clothing"; data: ClothingAttributes }
  | { type: "jewellery"; data: JewelleryAttributes }
  | { type: "purse-charms"; data: PurseCharmAttributes }
  | { type: "accessories"; data: AccessoryAttributes };

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  short_description: string;
  full_description: string;
  category_slug: CategorySlug;
  category_id: string;
  base_price: number;
  sale_price?: number;
  is_new: boolean;
  is_bestseller: boolean;
  is_featured: boolean;
  is_published: boolean;
  rating: number;
  review_count: number;
  primary_image: string;
  secondary_image: string;
  images: ProductImage[];
  variants: ProductVariant[];
  attributes?: ProductAttributes;
  details: string[];
  care_instructions?: string;
  shipping_info?: string;
  stock_quantity: number;
  sku: string;
  created_at: string;
  tags?: string[];
  collections?: string[];
}

export interface Collection {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image_url: string;
  product_ids: string[];
  is_active: boolean;
}

export interface CartItem {
  id: string;
  product_id: string;
  product: Product;
  variant_id?: string;
  variant?: ProductVariant;
  quantity: number;
  price: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping_fee: number;
  tax: number;
  total: number;
  coupon_code?: string;
  free_shipping_threshold: number;
}

export interface WishlistItem {
  id: string;
  product_id: string;
  product: Product;
  added_at: string;
}

export interface Address {
  id: string;
  user_id?: string;
  full_name: string;
  phone: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  address_type: "shipping" | "billing";
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned";

export type PaymentStatus =
  | "pending"
  | "authorized"
  | "captured"
  | "failed"
  | "refunded";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  product_image: string;
  variant_id?: string;
  variant_title?: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: OrderItem[];
  shipping_address: Address;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string;
  subtotal: number;
  discount: number;
  shipping_fee: number;
  tax: number;
  total: number;
  coupon_code?: string;
  tracking_number?: string;
  courier?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_cart_value: number;
  max_discount_amount?: number;
  start_date: string;
  end_date: string;
  usage_limit: number;
  times_used: number;
  is_active: boolean;
}

export interface Review {
  id: string;
  product_id: string;
  user_name: string;
  user_email: string;
  rating: number;
  title: string;
  comment: string;
  verified_purchase: boolean;
  images?: string[];
  status: "approved" | "pending" | "hidden";
  created_at: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
  desktop_image_url: string;
  mobile_image_url?: string;
  is_active: boolean;
  display_order: number;
  type: "hero" | "promo" | "editorial";
}

export type AdminRole = "super_admin" | "admin" | "manager" | "staff";

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  created_at: string;
  last_login?: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  target_type: string;
  target_id: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface StoreSettings {
  brand_name: string;
  currency: string;
  currency_symbol: string;
  free_shipping_threshold: number;
  standard_shipping_fee: number;
  express_shipping_fee: number;
  tax_percentage: number;
  contact_email: string;
  concierge_phone: string;
  announcement_text: string;
}
