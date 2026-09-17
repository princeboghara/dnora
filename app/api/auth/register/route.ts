import { NextResponse } from "next/server";

export async function POST() {
  // All customer registrations in DNORA now require custom email OTP verification.
  // This prevents unverified account creations and disables default duplicate confirmation emails.
  return NextResponse.json(
    {
      error:
        "Direct registration is deprecated. Please register through Email OTP verification via /register.",
      redirectTo: "/register",
    },
    { status: 400 }
  );
}
