import { NextResponse } from "next/server";
import { destroyAdminSession } from "@/lib/auth/session";
import { destroyUserSession } from "@/lib/auth/user-session";

export async function POST() {
  await Promise.all([destroyAdminSession(), destroyUserSession()]);
  return NextResponse.json({ success: true });
}
