import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { store } from "@/lib/data/store";
import { verifyAdminSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await req.json();
    const { name, slug, description, image_url } = body;

    const existing = await store.getCategoryById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    const updated = await store.updateCategory(id, {
      name: typeof name === "string" ? name.trim() : undefined,
      slug: typeof slug === "string" ? slug.trim() : undefined,
      description: typeof description === "string" ? description.trim() : undefined,
      image_url: image_url !== undefined ? (image_url ? String(image_url).trim() : "") : undefined,
    });

    // Invalidate caches across storefront and admin
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/#categories");
    revalidatePath(`/category/${existing.slug}`);
    if (updated?.slug && updated.slug !== existing.slug) {
      revalidatePath(`/category/${updated.slug}`);
    }
    revalidatePath("/admin/categories");

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    console.error("Error updating category:", error);
    const errMessage = error instanceof Error ? error.message : "";
    const message = errMessage.includes("unique")
      ? "Category name or slug already exists"
      : "Failed to update category";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const existing = await store.getCategoryById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    const success = await store.deleteCategory(id);
    if (!success) {
      return NextResponse.json({ success: false, error: "Failed to delete category" }, { status: 500 });
    }

    // Invalidate caches across storefront and admin
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/#categories");
    revalidatePath(`/category/${existing.slug}`);
    revalidatePath("/admin/categories");

    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ success: false, error: "Failed to delete category" }, { status: 500 });
  }
}
