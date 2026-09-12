import { Banner } from "@/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { INITIAL_BANNERS } from "@/lib/seed/catalog-data";

const ADMIN_BANNERS_KEY = "dnora_admin_banners_override";

// In-memory cache
let cachedBanners: { data: Banner[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 15 * 1000;

export function invalidateBannersCache(): void {
  cachedBanners = null;
}

export function getAdminBannersOverride(): Banner[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ADMIN_BANNERS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignore
  }
  return null;
}

export function saveAdminBannersOverride(banners: Banner[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ADMIN_BANNERS_KEY, JSON.stringify(banners));
    invalidateBannersCache();
  } catch {
    // Ignore
  }
}

// Get active banners for storefront
export async function getActiveHeroBanners(): Promise<Banner[]> {
  if (cachedBanners && Date.now() - cachedBanners.timestamp < CACHE_TTL_MS) {
    return cachedBanners.data;
  }

  // Query Supabase
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (!error && data && data.length > 0) {
        cachedBanners = { data: data as Banner[], timestamp: Date.now() };
        return data as Banner[];
      }
    } catch {
      // Fallback below
    }
  }

  const local = getAdminBannersOverride();
  if (local !== null && local.length > 0) {
    const active = local.filter((b) => b.is_active);
    cachedBanners = { data: active, timestamp: Date.now() };
    return active;
  }

  cachedBanners = { data: INITIAL_BANNERS, timestamp: Date.now() };
  return INITIAL_BANNERS;
}

// Get all banners (including drafts) for Admin CMS
export async function getAllAdminBanners(): Promise<Banner[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("display_order", { ascending: true });

      if (!error && data && data.length > 0) {
        return data as Banner[];
      }
    } catch {
      // Fallback below
    }
  }

  const local = getAdminBannersOverride();
  if (local !== null && local.length > 0) {
    return local;
  }

  return INITIAL_BANNERS;
}
