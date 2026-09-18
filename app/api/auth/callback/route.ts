import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createUserSession } from "@/lib/auth/user-session";
import { getRequestOrigin } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const rawNext = requestUrl.searchParams.get("next");
  const next = rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/account";

  if (code) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error && data.user) {
        const email = (data.user.email || "").toLowerCase().trim();
        const fullName =
          data.user.user_metadata?.full_name ||
          data.user.user_metadata?.name ||
          email.split("@")[0];
        const avatarUrl =
          data.user.user_metadata?.avatar_url ||
          data.user.user_metadata?.picture ||
          null;

        try {
          const { db } = await import("@/lib/db");
          await db.query(
            `INSERT INTO public.users (id, email, full_name, avatar_url, role)
             VALUES ($1, $2, $3, $4, 'customer')
             ON CONFLICT (email) DO UPDATE 
             SET full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
                 avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url)`,
            [data.user.id, email, fullName, avatarUrl]
          );
        } catch (dbErr) {
          console.error("Error syncing Google user to database:", dbErr);
        }

        await createUserSession({
          id: data.user.id,
          email,
          full_name: fullName,
          avatar_url: avatarUrl || undefined,
          role: "customer",
        });
      }
    } catch (e) {
      console.error("Auth callback error:", e);
    }
  }

  const origin = getRequestOrigin(request);
  return NextResponse.redirect(new URL(next, origin));
}
