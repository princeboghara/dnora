import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  DEFAULT_STOREFRONT_NAVIGATION,
  DEFAULT_ACCOUNT_NAVIGATION,
} from "@/lib/navigation-constants";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const target = searchParams.get("target") || "storefront";

    const defaultItems =
      target === "account"
        ? DEFAULT_ACCOUNT_NAVIGATION
        : DEFAULT_STOREFRONT_NAVIGATION;

    const res = await db.query(
      `SELECT items FROM public.site_navigation_config WHERE id = $1 LIMIT 1`,
      [target]
    );

    if (res.rows.length > 0 && res.rows[0].items) {
      return NextResponse.json({ target, items: res.rows[0].items });
    }

    return NextResponse.json({ target, items: defaultItems });
  } catch (err: any) {
    console.error("Error fetching site navigation config:", err);
    return NextResponse.json({
      target: "storefront",
      items: DEFAULT_STOREFRONT_NAVIGATION,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { target = "storefront", items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "Invalid payload. 'items' must be an array." },
        { status: 400 }
      );
    }

    await db.query(
      `INSERT INTO public.site_navigation_config (id, items, updated_at)
       VALUES ($1, $2, timezone('utc'::text, now()))
       ON CONFLICT (id) DO UPDATE SET 
         items = EXCLUDED.items,
         updated_at = EXCLUDED.updated_at;`,
      [target, JSON.stringify(items)]
    );

    return NextResponse.json({ success: true, target, items });
  } catch (err: any) {
    console.error("Error saving site navigation config:", err);
    return NextResponse.json(
      { error: "Failed to save navigation config: " + (err.message || "Database error") },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const target = searchParams.get("target") || "storefront";

    const defaultItems =
      target === "account"
        ? DEFAULT_ACCOUNT_NAVIGATION
        : DEFAULT_STOREFRONT_NAVIGATION;

    await db.query(
      `INSERT INTO public.site_navigation_config (id, items, updated_at)
       VALUES ($1, $2, timezone('utc'::text, now()))
       ON CONFLICT (id) DO UPDATE SET 
         items = EXCLUDED.items,
         updated_at = EXCLUDED.updated_at;`,
      [target, JSON.stringify(defaultItems)]
    );

    return NextResponse.json({
      success: true,
      message: `Reset navigation for '${target}' to factory defaults.`,
      target,
      items: defaultItems,
    });
  } catch (err: any) {
    console.error("Error resetting site navigation config:", err);
    return NextResponse.json(
      { error: "Failed to reset navigation config: " + (err.message || "Database error") },
      { status: 500 }
    );
  }
}
