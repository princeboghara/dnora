import { Category, Product, Collection, CategorySlug } from "@/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_COLLECTIONS } from "@/lib/seed/catalog-data";

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: "featured" | "newest" | "price-asc" | "price-desc" | "rating" | "bestselling";
  search?: string;
  limit?: number;
}

// In-memory micro-cache (cleared on reset or updates)
let cachedCategories: { data: Category[]; timestamp: number } | null = null;
let cachedProducts: { data: Product[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 30 * 1000;

export function invalidateCatalogCache(): void {
  cachedCategories = null;
  cachedProducts = null;
}

const ADMIN_CATEGORIES_KEY = "dnora_admin_categories_override";

export function getAdminCategoriesOverride(): Category[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ADMIN_CATEGORIES_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignore
  }
  return null;
}

export function saveAdminCategoriesOverride(categories: Category[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ADMIN_CATEGORIES_KEY, JSON.stringify(categories));
    invalidateCatalogCache();
    window.dispatchEvent(new Event("dnora_categories_updated"));
  } catch {
    // Ignore
  }
}

export async function getAllAdminCategories(): Promise<Category[]> {
  const local = getAdminCategoriesOverride();
  if (local !== null) {
    return local;
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true });

      if (!error && data && data.length > 0) {
        return data as Category[];
      }
    } catch {
      // Return fallback on error
    }
  }

  return INITIAL_CATEGORIES;
}

export async function getCategories(): Promise<Category[]> {
  if (cachedCategories && Date.now() - cachedCategories.timestamp < CACHE_TTL_MS) {
    return cachedCategories.data;
  }

  const local = getAdminCategoriesOverride();
  if (local !== null) {
    const active = local.filter((c) => c.is_active !== false).sort((a, b) => a.display_order - b.display_order);
    cachedCategories = { data: active, timestamp: Date.now() };
    return active;
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (!error && data && data.length > 0) {
        cachedCategories = { data: data as Category[], timestamp: Date.now() };
        return cachedCategories.data;
      }
    } catch {
      // Return fallback on error
    }
  }

  cachedCategories = { data: INITIAL_CATEGORIES, timestamp: Date.now() };
  return INITIAL_CATEGORIES;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await getCategories();
  const match = categories.find((c) => c.slug.toLowerCase() === slug.toLowerCase() && c.is_active !== false);
  if (match) return match;

  const local = getAdminCategoriesOverride();
  if (local !== null) {
    return local.find((c) => c.slug.toLowerCase() === slug.toLowerCase()) || null;
  }

  return INITIAL_CATEGORIES.find((c) => c.slug.toLowerCase() === slug.toLowerCase()) || null;
}

const ADMIN_PRODUCTS_KEY = "dnora_admin_products_override";

export function getAdminProductsOverride(): Product[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ADMIN_PRODUCTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // Ignore
  }
  return null;
}

export function saveAdminProductsOverride(products: Product[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(products));
    invalidateCatalogCache();
  } catch {
    // Ignore
  }
}

export async function getAllAdminProducts(): Promise<Product[]> {
  const local = getAdminProductsOverride();
  if (local && local.length > 0) {
    return local;
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(slug), product_images(*), product_variants(*)")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped = data.map((p: any) => {
          const initMatch = INITIAL_PRODUCTS.find((ip) => ip.slug === p.slug || ip.id === p.id);
          const images =
            p.product_images && p.product_images.length > 0
              ? p.product_images
              : initMatch?.images || [
                  {
                    id: "1",
                    product_id: p.id,
                    url: p.primary_image,
                    alt_text: p.name,
                    display_order: 1,
                    is_primary: true,
                  },
                ];
          const variants =
            p.product_variants && p.product_variants.length > 0
              ? p.product_variants
              : initMatch?.variants || [];
          const details = Array.isArray(p.details) ? p.details : initMatch?.details || [];

          return {
            ...p,
            category_slug: p.categories?.slug || initMatch?.category_slug || "handbags",
            stock_quantity: p.stock_quantity ?? initMatch?.stock_quantity ?? 30,
            images,
            variants,
            details,
          };
        }) as Product[];
        return mapped;
      }
    } catch {
      // Fallback
    }
  }

  return INITIAL_PRODUCTS;
}

async function fetchRawProducts(): Promise<Product[]> {
  if (cachedProducts && Date.now() - cachedProducts.timestamp < CACHE_TTL_MS) {
    return cachedProducts.data;
  }

  // 1. Check if admin has customized catalog products
  const local = getAdminProductsOverride();
  if (local && local.length > 0) {
    const published = local.filter((p) => p.is_published !== false);
    cachedProducts = { data: published, timestamp: Date.now() };
    return published;
  }

  // 2. Fetch from Supabase
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(slug), product_images(*), product_variants(*)")
        .eq("is_published", true);

      if (!error && data && data.length > 0) {
        const mapped = data.map((p: any) => {
          const initMatch = INITIAL_PRODUCTS.find((ip) => ip.slug === p.slug || ip.id === p.id);
          const images =
            p.product_images && p.product_images.length > 0
              ? p.product_images
              : initMatch?.images || [
                  {
                    id: "1",
                    product_id: p.id,
                    url: p.primary_image,
                    alt_text: p.name,
                    display_order: 1,
                    is_primary: true,
                  },
                ];
          const variants =
            p.product_variants && p.product_variants.length > 0
              ? p.product_variants
              : initMatch?.variants || [];
          const details = Array.isArray(p.details) ? p.details : initMatch?.details || [];

          return {
            ...p,
            category_slug: p.categories?.slug || initMatch?.category_slug || "handbags",
            stock_quantity: p.stock_quantity ?? initMatch?.stock_quantity ?? 30,
            images,
            variants,
            details,
          };
        }) as Product[];
        cachedProducts = { data: mapped, timestamp: Date.now() };
        return mapped;
      }
    } catch {
      // Fall back on error
    }
  }

  cachedProducts = { data: INITIAL_PRODUCTS, timestamp: Date.now() };
  return INITIAL_PRODUCTS;
}

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const raw = await fetchRawProducts();
  let products = [...raw];

  // Apply filters in-memory
  if (filters.category && filters.category !== "all") {
    products = products.filter(
      (p) => p.category_slug.toLowerCase() === filters.category?.toLowerCase()
    );
  }

  if (filters.minPrice !== undefined) {
    products = products.filter(
      (p) => (p.sale_price ?? p.base_price) >= (filters.minPrice ?? 0)
    );
  }

  if (filters.maxPrice !== undefined) {
    products = products.filter(
      (p) => (p.sale_price ?? p.base_price) <= (filters.maxPrice ?? Infinity)
    );
  }

  if (filters.inStock) {
    products = products.filter((p) => p.stock_quantity > 0);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.short_description?.toLowerCase().includes(q) ||
        p.category_slug?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }

  // Sorting
  switch (filters.sortBy) {
    case "price-asc":
      products.sort(
        (a, b) => (a.sale_price ?? a.base_price) - (b.sale_price ?? b.base_price)
      );
      break;
    case "price-desc":
      products.sort(
        (a, b) => (b.sale_price ?? b.base_price) - (a.sale_price ?? a.base_price)
      );
      break;
    case "newest":
      products.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      break;
    case "rating":
      products.sort((a, b) => b.rating - a.rating);
      break;
    case "bestselling":
      products.sort((a, b) => (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0));
      break;
    case "featured":
    default:
      products.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
      break;
  }

  if (filters.limit) {
    return products.slice(0, filters.limit);
  }

  return products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await fetchRawProducts();
  return products.find((p) => p.slug === slug) || null;
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  return getProducts({ sortBy: "featured", limit });
}

export async function getNewArrivals(limit = 4): Promise<Product[]> {
  return getProducts({ sortBy: "newest", limit });
}

export async function getBestSellers(limit = 4): Promise<Product[]> {
  return getProducts({ sortBy: "bestselling", limit });
}

export async function getRelatedProducts(
  productId: string,
  categorySlug: CategorySlug,
  limit = 4
): Promise<Product[]> {
  const products = await getProducts({ category: categorySlug });
  return products.filter((p) => p.id !== productId).slice(0, limit);
}

export async function getCollections(): Promise<Collection[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("is_active", true);
      if (!error && data && data.length > 0) return data as Collection[];
    } catch {
      // Return fallback
    }
  }
  return INITIAL_COLLECTIONS;
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  const collections = await getCollections();
  return collections.find((c) => c.slug === slug && c.is_active) || null;
}
