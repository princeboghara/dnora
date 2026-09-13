import { StyleReel, ReelComment } from "@/types";
import { INITIAL_STYLE_REELS } from "@/lib/seed/reels-data";

const REELS_STORAGE_KEY = "dnora_admin_reels_override";

// In-memory micro-cache
let cachedReels: { data: StyleReel[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 5 * 1000;

export function invalidateReelsCache(): void {
  cachedReels = null;
}

/**
 * Retrieve all reels for admin management
 */
export function getAllAdminReels(): StyleReel[] {
  if (typeof window === "undefined") {
    return INITIAL_STYLE_REELS;
  }

  try {
    const raw = localStorage.getItem(REELS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to read admin reels from localStorage:", err);
  }

  return INITIAL_STYLE_REELS;
}

/**
 * Save reels to storage and dispatch event
 */
export function saveAdminReels(reels: StyleReel[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(REELS_STORAGE_KEY, JSON.stringify(reels));
    invalidateReelsCache();
    window.dispatchEvent(new Event("dnora_reels_updated"));
  } catch (err) {
    console.warn("Failed to save admin reels to localStorage:", err);
  }
}

/**
 * Retrieve active reels for storefront display
 */
export async function getActiveReels(): Promise<StyleReel[]> {
  const all = getAllAdminReels();
  return all
    .filter((r) => r.is_active !== false)
    .sort((a, b) => (a.display_order ?? 1) - (b.display_order ?? 1));
}

/**
 * Add a comment to a specific reel
 */
export function addCommentToReel(
  reelId: string,
  userComment: { user_name: string; comment: string }
): StyleReel[] {
  const all = getAllAdminReels();
  const newComment: ReelComment = {
    id: `comm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    user_name: userComment.user_name || "Patron",
    comment: userComment.comment.trim(),
    created_at: "Just now",
  };

  const updated = all.map((reel) => {
    if (reel.id === reelId) {
      const existingComments = reel.comments || [];
      return {
        ...reel,
        comments: [newComment, ...existingComments],
      };
    }
    return reel;
  });

  saveAdminReels(updated);
  return updated;
}

/**
 * Toggle user like on a reel
 */
export function toggleLikeReel(reelId: string, isCurrentlyLiked: boolean): StyleReel[] {
  const all = getAllAdminReels();
  const updated = all.map((reel) => {
    if (reel.id === reelId) {
      const currentNumeric = reel.numeric_likes ?? 240;
      const nextNumeric = isCurrentlyLiked
        ? Math.max(0, currentNumeric - 1)
        : currentNumeric + 1;
      return {
        ...reel,
        numeric_likes: nextNumeric,
        likes_count: nextNumeric > 999 ? `${(nextNumeric / 1000).toFixed(1)}K` : `${nextNumeric}`,
      };
    }
    return reel;
  });

  saveAdminReels(updated);
  return updated;
}
