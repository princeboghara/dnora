import { Banner } from "@/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

const LIVE_BANNERS_KEY = "dnora_admin_banners_override";
const STAGED_BANNERS_KEY = "dnora_admin_banners_staged";

// In-memory caches
let cachedLiveBanners: { data: Banner[]; timestamp: number } | null = null;
let cachedStagedBanners: { data: Banner[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 5 * 1000;

export function invalidateBannersCache(): void {
  cachedLiveBanners = null;
  cachedStagedBanners = null;
}

// LocalStorage helpers
export function getLiveBannersLocal(): Banner[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LIVE_BANNERS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignore
  }
  return null;
}

export function saveLiveBannersLocal(banners: Banner[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LIVE_BANNERS_KEY, JSON.stringify(banners));
    invalidateBannersCache();
  } catch {
    // Ignore
  }
}

export function getStagedBannersLocal(): Banner[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STAGED_BANNERS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignore
  }
  return null;
}

export function saveStagedBannersLocal(banners: Banner[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STAGED_BANNERS_KEY, JSON.stringify(banners));
    invalidateBannersCache();
  } catch {
    // Ignore
  }
}

// 1. Get active banners for Live Storefront
// If no banners are published, returns an empty array [] (NO fallback videos or fake placeholders)
export async function getActiveHeroBanners(): Promise<Banner[]> {
  if (cachedLiveBanners && Date.now() - cachedLiveBanners.timestamp < CACHE_TTL_MS) {
    return cachedLiveBanners.data;
  }

  // Query Supabase live banners
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (!error && data) {
        cachedLiveBanners = { data: data as Banner[], timestamp: Date.now() };
        return data as Banner[];
      }
    } catch {
      // Fallback to local below
    }
  }

  const local = getLiveBannersLocal();
  if (local !== null) {
    const active = local.filter((b) => b.is_active);
    cachedLiveBanners = { data: active, timestamp: Date.now() };
    return active;
  }

  return [];
}

// 2. Get Staged Banners for Admin CMS (Draft / Staging workspace)
export async function getStagedHeroBanners(): Promise<Banner[]> {
  if (cachedStagedBanners && Date.now() - cachedStagedBanners.timestamp < CACHE_TTL_MS) {
    return cachedStagedBanners.data;
  }

  // 1. Try Supabase banners_staged table
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("banners_staged")
        .select("*")
        .order("display_order", { ascending: true });

      if (!error && data && data.length > 0) {
        cachedStagedBanners = { data: data as Banner[], timestamp: Date.now() };
        return data as Banner[];
      }
    } catch {
      // Fallback
    }
  }

  // 2. Try localStorage staged
  const localStaged = getStagedBannersLocal();
  if (localStaged !== null) {
    cachedStagedBanners = { data: localStaged, timestamp: Date.now() };
    return localStaged;
  }

  // 3. If staged is completely empty, initialize staged from live banners
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data } = await supabase
        .from("banners")
        .select("*")
        .order("display_order", { ascending: true });

      if (data && data.length > 0) {
        const liveBanners = data as Banner[];
        // Copy to staged table
        try {
          await supabase.from("banners_staged").insert(
            liveBanners.map((b) => ({
              id: b.id,
              title: b.title || null,
              subtitle: b.subtitle || null,
              cta_text: b.cta_text || null,
              cta_link: b.cta_link || null,
              desktop_image_url: b.desktop_image_url,
              mobile_image_url: b.mobile_image_url || null,
              video_url: b.video_url || null,
              is_active: b.is_active,
              display_order: b.display_order,
              duration_seconds: b.duration_seconds || 5,
              type: b.type || "hero",
            }))
          );
        } catch {
          // Ignore
        }
        saveStagedBannersLocal(liveBanners);
        cachedStagedBanners = { data: liveBanners, timestamp: Date.now() };
        return liveBanners;
      }
    } catch {
      // Ignore
    }
  }

  const liveLocal = getLiveBannersLocal();
  if (liveLocal !== null) {
    saveStagedBannersLocal(liveLocal);
    cachedStagedBanners = { data: liveLocal, timestamp: Date.now() };
    return liveLocal;
  }

  return [];
}

// 3. Save Staged Banners (Draft changes - only visible in Admin CMS Preview)
export async function saveStagedHeroBanners(banners: Banner[]): Promise<boolean> {
  saveStagedBannersLocal(banners);
  invalidateBannersCache();

  if (isSupabaseConfigured() && supabase) {
    try {
      // Clear existing staged rows and replace with updated ordered list
      await supabase.from("banners_staged").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (banners.length > 0) {
        const payload = banners.map((b, idx) => ({
          id: b.id,
          title: b.title || null,
          subtitle: b.subtitle || null,
          cta_text: b.cta_text || null,
          cta_link: b.cta_link || null,
          desktop_image_url: b.desktop_image_url,
          mobile_image_url: b.mobile_image_url || null,
          video_url: b.video_url || null,
          is_active: b.is_active !== false,
          display_order: idx + 1,
          duration_seconds: b.duration_seconds || 5,
          type: b.type || "hero",
        }));
        await supabase.from("banners_staged").insert(payload);
      }
      return true;
    } catch (err) {
      console.warn("Notice: Staged banners saved locally (Supabase staged write failed):", err);
      return false;
    }
  }
  return true;
}

// 4. Publish Staged Banners to Live Storefront
// Only after calling this function do changes become visible on the public homepage!
export async function publishHeroBannersToStorefront(): Promise<{ success: boolean; banners: Banner[] }> {
  const staged = await getStagedHeroBanners();

  // Save to live localStorage
  saveLiveBannersLocal(staged);

  if (isSupabaseConfigured() && supabase) {
    try {
      // Delete old live banners and insert current staged snapshot
      await supabase.from("banners").delete().neq("id", "00000000-0000-0000-0000-000000000000");

      if (staged.length > 0) {
        const livePayload = staged.map((b, idx) => ({
          id: b.id,
          title: b.title || null,
          subtitle: b.subtitle || null,
          cta_text: b.cta_text || null,
          cta_link: b.cta_link || null,
          desktop_image_url: b.desktop_image_url,
          mobile_image_url: b.mobile_image_url || null,
          video_url: b.video_url || null,
          is_active: b.is_active !== false,
          display_order: idx + 1,
          duration_seconds: b.duration_seconds || 5,
          type: b.type || "hero",
        }));
        await supabase.from("banners").insert(livePayload);
      }
    } catch (err) {
      console.warn("Notice: Live storefront banners updated locally (Supabase live write failed):", err);
    }
  }

  invalidateBannersCache();
  return { success: true, banners: staged };
}

// Compatibility exports
export const getAllAdminBanners = getStagedHeroBanners;
export const saveAdminBannersOverride = saveStagedBannersLocal;
export const getAdminBannersOverride = getStagedBannersLocal;
