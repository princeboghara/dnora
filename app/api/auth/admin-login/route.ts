import { NextRequest, NextResponse } from "next/server";
import { createAdminSession } from "@/lib/auth/session";
import { createUserSession } from "@/lib/auth/user-session";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    const expectedPassword = process.env.ADMIN_PASSWORD || "admin";

    if (password === expectedPassword) {
      await Promise.all([
        createAdminSession("admin@dnora.luxury"),
        createUserSession({
          id: "admin-master",
          email: "admin@dnora.luxury",
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
