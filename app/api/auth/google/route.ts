import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRequestOrigin } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const origin = getRequestOrigin(req);
  const next = req.nextUrl.searchParams.get("next") || "/account";

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
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
  } catch (e: unknown) {
    console.error("Google OAuth error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(
          "Failed to connect with Google OAuth: " + message
        )}`,
        req.url
      )
    );
  }

  return NextResponse.redirect(new URL("/login?error=oauth_unavailable", req.url));
}
