import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/data/store";
import { verifyAdminSession } from "@/lib/auth/session";
import { heroBannerSchema } from "@/lib/validation/hero";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const includeDrafts = searchParams.get("includeDrafts") === "true";

  // Only authorized admins can request drafts
  if (includeDrafts) {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const banners = await store.getHeroBanners(true);
    return NextResponse.json({ banners });
  }

  const banners = await store.getHeroBanners(false);
  return NextResponse.json({ banners });
}

export async function POST(req: NextRequest) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = heroBannerSchema.parse(body);

    const newBanner = await store.createHeroBanner({
      ...validated,
      mobile_media_url: validated.mobile_media_url || undefined,
      subtitle: validated.subtitle || undefined,
    });

    // Revalidate live storefront
    revalidatePath("/");

    return NextResponse.json({ success: true, banner: newBanner }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create hero banner:", error);
    if (error.errors) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
