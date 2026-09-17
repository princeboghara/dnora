export type UserRole = "admin" | "customer";

export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type ProductStatus = "draft" | "active" | "archived";

export interface ProductImage {
  id?: string;
  product_id?: string;
  cloudinary_public_id: string;
  secure_url: string;
  alt_text: string;
  sort_order: number;
  created_at?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  description?: string;
  created_at?: string;
}

export interface ProductFlag {
  product_id: string;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  price: number;
  compare_at_price?: number | null;
  sku: string;
  stock: number;
  status: ProductStatus;
  images: ProductImage[];
  categories?: ProductCategory[];
  is_best_seller?: boolean;
  is_new_arrival?: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

export type HeroMediaType = "image" | "video";
export type HeroBannerStatus = "draft" | "published" | "archived";
export type HeroTextAlignment = "left" | "center" | "right";

export interface HeroBanner {
  id: string;
  title: string;
  subtitle?: string;
  media_type: HeroMediaType;
  cloudinary_public_id?: string;
  media_url: string;
  mobile_media_url?: string;
  button_text: string;
  button_link: string;
  duration_seconds: number; // default e.g. 5 for images, ignored or fallback for video
  sort_order: number;
  is_active: boolean;
  status: HeroBannerStatus;
  text_alignment?: HeroTextAlignment;
  created_at: string;
  updated_at: string;
}

export interface CustomerReview {
  id: string;
  customer_name: string;
  rating: number; // 1 to 5
  review: string;
  image_url?: string;
  verified_purchase?: boolean;
  product_name?: string;
  status: "active" | "hidden";
  created_at: string;
}

export interface SeenOnYouVideo {
  id: string;
  customer_name: string;
  video_url: string;
  thumbnail_url?: string;
  cloudinary_public_id?: string;
  caption: string;
  product_name?: string;
  product_slug?: string;
  status: "active" | "hidden";
  sort_order: number;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface AdminDashboardStats {
  totalProducts: number;
  totalCustomers?: number;
  bestSellersCount: number;
  newArrivalsCount: number;
  activeHeroBanners: number;
  draftHeroBanners: number;
  lowStockCount: number;
}

export interface UserAddress {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
}

export type OrderStatus = "processing" | "confirmed" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string | null;
  product_name: string;
  product_slug?: string | null;
  price: number;
  quantity: number;
  image_url?: string | null;
  attributes?: Record<string, unknown>;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string | null;
  customer_email: string;
  customer_name: string;
  customer_phone?: string | null;
  total_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string;
  shipping_address: {
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  tracking_number?: string | null;
  carrier?: string | null;
  estimated_delivery?: string | null;
  notes?: string | null;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CustomerAddress {
  id?: string;
  user_id?: string;
  full_name?: string;
  phone?: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default?: boolean;
}

export interface AdminCustomer {
  id: string;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  role: UserRole;
  created_at: string;
  updated_at?: string;
  total_orders: number;
  total_spent: number;
  primary_address?: CustomerAddress | null;
  addresses?: CustomerAddress[];
}

export interface SidebarSubmenuItem {
  id: string;
  label: string;
  href: string;
  badge?: string;
  is_active?: boolean;
}

export interface SidebarMenuItem {
  id: string;
  label: string;
  href?: string;
  icon: string;
  badge?: string;
  is_active: boolean;
  submenus?: SidebarSubmenuItem[];
}


