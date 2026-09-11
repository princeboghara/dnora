import { supabase, isSupabaseConfigured } from "./client";

export type StorageBucket = "products" | "banners" | "categories" | "site-assets";

/**
 * Upload an image file to a designated Supabase Storage bucket.
 * Returns the public CDN URL of the uploaded image.
 */
export async function uploadImageToStorage(
  bucket: StorageBucket,
  file: File,
  folder: string = ""
): Promise<{ url: string | null; error: string | null }> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      url: null,
      error: "Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local",
    };
  }

  try {
    const sanitizedName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .toLowerCase();
    const fileName = `${Date.now()}_${sanitizedName}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      return { url: null, error: error.message };
    }

    // Retrieve public CDN URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to upload image";
    return { url: null, error: errorMessage };
  }
}

/**
 * Get the public URL for an existing file in a Supabase Storage bucket.
 */
export function getStoragePublicUrl(bucket: StorageBucket, path: string): string {
  if (!isSupabaseConfigured() || !supabase) return "";
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
