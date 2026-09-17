import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/api/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      console.error("Supabase Google OAuth error:", error.message);
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent(
            "Supabase Google OAuth initialization error: " + error.message
          )}`,
          req.url
        )
      );
    }

    if (data?.url) {
      return NextResponse.redirect(data.url);
    }
  } catch (e: any) {
    console.error("Google OAuth error:", e);
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(
          "Failed to connect with Google OAuth: " + (e.message || "Unknown error")
        )}`,
        req.url
      )
    );
  }

  return NextResponse.redirect(new URL("/login?error=oauth_unavailable", req.url));
}
