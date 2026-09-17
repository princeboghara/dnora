import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/data/store";
import { verifyAdminSession } from "@/lib/auth/session";
import { productSchema } from "@/lib/validation/product";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const category = searchParams.get("category") || undefined;
  const status = searchParams.get("status") || undefined;
  const isBestSeller = searchParams.has("best_seller")
    ? searchParams.get("best_seller") === "true"
    : undefined;
  const isNewArrival = searchParams.has("new_arrival")
    ? searchParams.get("new_arrival") === "true"
    : undefined;

  const products = await store.getProducts({
    search,
    category_slug: category,
    status,
    is_best_seller: isBestSeller,
    is_new_arrival: isNewArrival,
  });

  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = productSchema.parse(body);

    const categories = await store.getCategories();
    const matchedCategory = categories.find((c) => c.id === validated.category_id);

    const newProduct = await store.createProduct({
      ...validated,
      slug: validated.slug || slugify(validated.name),
      categories: matchedCategory ? [matchedCategory] : [],
      compare_at_price: validated.compare_at_price || null,
    });

    revalidatePath("/");
    revalidatePath("/shop");

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create product:", error);
    if (error.errors) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
