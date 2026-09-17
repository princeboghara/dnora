import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/data/store";
import { verifyAdminSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await store.getCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (error: unknown) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, slug, description, image_url } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 }
      );
    }

    const category = await store.createCategory({
      name: name.trim(),
      slug: typeof slug === "string" ? slug.trim() : undefined,
      description: typeof description === "string" ? description.trim() : undefined,
      image_url: typeof image_url === "string" ? image_url.trim() : undefined,
    });

    return NextResponse.json({ success: true, data: category });
  } catch (error: any) {
    console.error("Error creating category:", error);
    const message = error.message?.includes("unique")
      ? "Category name or slug already exists"
      : "Failed to create category";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
