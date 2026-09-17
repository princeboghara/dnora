import { NextRequest, NextResponse } from "next/server";
import { createAdminSession } from "@/lib/auth/session";
import { createUserSession } from "@/lib/auth/user-session";

import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    const expectedPassword = process.env.ADMIN_PASSWORD;

    if (!expectedPassword) {
      console.error("ADMIN_PASSWORD environment variable is not configured.");
      return NextResponse.json(
        { error: "Administrative authentication is misconfigured on the server." },
        { status: 500 }
      );
    }

    const pwdBuf = Buffer.from(String(password || ""));
    const expBuf = Buffer.from(String(expectedPassword));
    const isMatch = pwdBuf.length === expBuf.length && crypto.timingSafeEqual(pwdBuf, expBuf);

    if (isMatch) {
      const adminEmail = process.env.ADMIN_EMAIL || "admin@dnora.luxury";
      await Promise.all([
        createAdminSession(adminEmail),
        createUserSession({
          id: "admin-master",
          email: adminEmail,
          full_name: "DNORA Administrator",
          role: "admin",
        }),
      ]);

      return NextResponse.json({
        success: true,
        redirectTo: "/admin",
      });
    }

    return NextResponse.json(
      { error: "Incorrect admin password." },
      { status: 401 }
    );
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
