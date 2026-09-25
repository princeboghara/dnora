import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/data/store";
import { verifyAdminSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const items = await store.getTrendingNowItems(false);
    return NextResponse.json({ success: true, data: items });
  } catch (err) {
    console.error("Failed to fetch trending items:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.image_url) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    const item = await store.createTrendingNowItem({
      title: body.title || "",
      image_url: body.image_url,
      alt_text: body.alt_text || body.title || "",
      sort_order: Number(body.sort_order ?? 0),
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
      target_link: body.target_link || undefined,
      product_id: body.product_id || undefined,
      product_slug: body.product_slug || undefined,
    });

    revalidatePath("/");
    revalidatePath("/trending-now");

    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (err) {
    console.error("Failed to create trending item:", err);
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    await store.updateTrendingNowItem(body.id, {
      title: body.title,
      image_url: body.image_url,
      alt_text: body.alt_text,
      sort_order: body.sort_order !== undefined ? Number(body.sort_order) : undefined,
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : undefined,
      target_link: body.target_link !== undefined ? body.target_link : undefined,
      product_id: body.product_id !== undefined ? body.product_id : undefined,
      product_slug: body.product_slug !== undefined ? body.product_slug : undefined,
    });

    revalidatePath("/");
    revalidatePath("/trending-now");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to update trending item:", err);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    await store.deleteTrendingNowItem(id);

    revalidatePath("/");
    revalidatePath("/trending-now");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete trending item:", err);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
