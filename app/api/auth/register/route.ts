import { NextRequest, NextResponse } from "next/server";
import { createUserSession } from "@/lib/auth/user-session";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Please provide your full name, email, and password." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userId = crypto.randomUUID();

    // 1. Try Supabase Auth sign up
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: name,
            phone: phone || null,
          },
        },
      });

      if (data?.user && !error) {
        await createUserSession({
          id: data.user.id,
          email: normalizedEmail,
          full_name: name,
          phone,
          role: "customer",
        });

        return NextResponse.json({
          success: true,
          redirectTo: "/account",
        });
      }
    } catch {
      // Supabase Auth not connected or mock mode
    }

    // 2. Direct PostgreSQL registration
    try {
      await db.query(
        `INSERT INTO public.users (id, email, full_name, phone, role)
         VALUES ($1, $2, $3, $4, 'customer')
         ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone`,
        [userId, normalizedEmail, name, phone || null]
      );
    } catch (dbErr) {
      console.error("DB insertion error on register:", dbErr);
    }

    // 3. Create secure HTTP-only user session
    await createUserSession({
      id: userId,
      email: normalizedEmail,
      full_name: name,
      phone,
      role: "customer",
    });

    return NextResponse.json({
      success: true,
      redirectTo: "/account",
    });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "An error occurred during account registration." },
      { status: 500 }
    );
  }
}
