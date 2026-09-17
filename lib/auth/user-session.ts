import { cookies } from "next/headers";
import { createClient } from "../supabase/server";

const USER_COOKIE_NAME = "dnora_user_session";

export interface UserSession {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  role: "customer" | "admin";
  isAuthenticated: boolean;
}

/**
 * Validates server-side whether the current request has an authenticated user session.
 * Checks Supabase Auth session first, then falls back to secure HTTP-only session cookie.
 */
export async function getUserSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();

  // 1. Try Supabase Auth session
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      return {
        id: user.id,
        email: user.email || "",
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0],
        phone: user.user_metadata?.phone || user.phone,
        role: user.user_metadata?.role === "admin" ? "admin" : "customer",
        isAuthenticated: true,
      };
    }
  } catch {
    // Supabase auth check error (e.g., offline or mock mode)
  }

  // 2. Check secure HTTP-only user cookie
  const userCookie = cookieStore.get(USER_COOKIE_NAME);
  if (userCookie?.value) {
    try {
      const decoded = JSON.parse(
        Buffer.from(userCookie.value, "base64").toString("utf-8")
      );
      if (decoded.id && decoded.expiresAt > Date.now()) {
        return {
          id: decoded.id,
          email: decoded.email,
          full_name: decoded.full_name,
          phone: decoded.phone,
          role: decoded.role || "customer",
          isAuthenticated: true,
        };
      }
    } catch {
      // Invalid cookie format
    }
  }

  // 3. Fallback: Check admin cookie if present
  const adminCookie = cookieStore.get("dnora_admin_session");
  if (adminCookie?.value) {
    try {
      const decoded = JSON.parse(
        Buffer.from(adminCookie.value, "base64").toString("utf-8")
      );
      if (decoded.role === "admin" && decoded.expiresAt > Date.now()) {
        return {
          id: "admin-master",
          email: decoded.email,
          full_name: "DNORA Admin",
          role: "admin",
          isAuthenticated: true,
        };
      }
    } catch {
      // ignore
    }
  }

  return null;
}

/**
 * Sets a secure, HTTP-only session cookie for the authenticated user.
 */
export async function createUserSession(user: {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  role?: "customer" | "admin";
}): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionData = {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    phone: user.phone,
    avatar_url: user.avatar_url,
    role: user.role || "customer",
    expiresAt: Date.now() + 14 * 24 * 60 * 60 * 1000, // 14 days
  };

  const encoded = Buffer.from(JSON.stringify(sessionData)).toString("base64");

  cookieStore.set(USER_COOKIE_NAME, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 14 * 24 * 60 * 60,
  });

  return true;
}

/**
 * Destroys user session cookie and Supabase session if any.
 */
export async function destroyUserSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(USER_COOKIE_NAME);

  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // ignore
  }
}
