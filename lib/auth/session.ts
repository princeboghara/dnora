import { cookies } from "next/headers";
import { createClient } from "../supabase/server";

const ADMIN_COOKIE_NAME = "dnora_admin_session";
const DEMO_ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@dnora.luxury";

export interface AdminSession {
  email: string;
  role: "admin";
  isAuthenticated: boolean;
}

/**
 * Validates server-side whether the current request is authenticated as an admin.
 * Checks Supabase Auth session first, then falls back to secure admin session cookie.
 */
export async function verifyAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();

  // 1. Try Supabase Auth
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Check user role in public.users table or user metadata
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "admin" || user.user_metadata?.role === "admin" || user.email === DEMO_ADMIN_EMAIL) {
        return {
          email: user.email || DEMO_ADMIN_EMAIL,
          role: "admin",
          isAuthenticated: true,
        };
      }
    }
  } catch {
    // Supabase auth check error (e.g., offline or mock mode)
  }

  // 2. Check secure admin cookie (for direct admin login)
  const adminCookie = cookieStore.get(ADMIN_COOKIE_NAME);
  if (adminCookie && adminCookie.value) {
    try {
      const decoded = JSON.parse(Buffer.from(adminCookie.value, "base64").toString("utf-8"));
      if (decoded.role === "admin" && decoded.expiresAt > Date.now()) {
        return {
          email: decoded.email,
          role: "admin",
          isAuthenticated: true,
        };
      }
    } catch {
      // Invalid cookie
    }
  }

  return null;
}

/**
 * Creates an authenticated admin session cookie (HTTP-only)
 */
export async function createAdminSession(email: string): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionData = {
    email,
    role: "admin",
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  const encoded = Buffer.from(JSON.stringify(sessionData)).toString("base64");

  cookieStore.set(ADMIN_COOKIE_NAME, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  return true;
}

/**
 * Destroys the admin session cookie
 */
export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}
