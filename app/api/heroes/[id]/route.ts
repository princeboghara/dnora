import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/data/store";
import { verifyAdminSession } from "@/lib/auth/session";
import { heroBannerSchema } from "@/lib/validation/hero";
import { revalidatePath } from "next/cache";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const banner = await store.getHeroBannerById(id);
  if (!banner) {
    return NextResponse.json({ error: "Hero banner not found" }, { status: 404 });
  }
  return NextResponse.json({ banner });
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const validated = heroBannerSchema.partial().parse(body);

    const updated = await store.updateHeroBanner(id, validated);
    if (!updated) {
      return NextResponse.json({ error: "Hero banner not found" }, { status: 404 });
    }

    revalidatePath("/");
    return NextResponse.json({ success: true, banner: updated });
  } catch (error: any) {
    if (error.errors) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const success = await store.deleteHeroBanner(id);

  if (!success) {
    return NextResponse.json({ error: "Hero banner not found" }, { status: 404 });
  }

  revalidatePath("/");
  return NextResponse.json({ success: true });
}
