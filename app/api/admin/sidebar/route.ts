import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEFAULT_SIDEBAR_ITEMS } from "@/lib/sidebar-constants";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await db.query(
      `SELECT items FROM public.admin_sidebar_config WHERE id = 'default' LIMIT 1`
    );

    if (res.rows.length > 0 && res.rows[0].items) {
      return NextResponse.json({ items: res.rows[0].items });
    }

    return NextResponse.json({ items: DEFAULT_SIDEBAR_ITEMS });
  } catch (err: any) {
    console.error("Error fetching admin sidebar config:", err);
    return NextResponse.json({ items: DEFAULT_SIDEBAR_ITEMS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "Invalid payload. 'items' must be an array." },
        { status: 400 }
      );
    }

    await db.query(
      `INSERT INTO public.admin_sidebar_config (id, items, updated_at)
       VALUES ('default', $1, timezone('utc'::text, now()))
       ON CONFLICT (id) DO UPDATE SET 
         items = EXCLUDED.items,
         updated_at = EXCLUDED.updated_at;`,
      [JSON.stringify(items)]
    );

    return NextResponse.json({ success: true, items });
  } catch (err: any) {
    console.error("Error saving admin sidebar config:", err);
    return NextResponse.json(
      { error: "Failed to save sidebar config: " + (err.message || "Database error") },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await db.query(
      `INSERT INTO public.admin_sidebar_config (id, items, updated_at)
       VALUES ('default', $1, timezone('utc'::text, now()))
       ON CONFLICT (id) DO UPDATE SET 
         items = EXCLUDED.items,
         updated_at = EXCLUDED.updated_at;`,
      [JSON.stringify(DEFAULT_SIDEBAR_ITEMS)]
    );

    return NextResponse.json({
      success: true,
      message: "Sidebar configuration reset to factory default.",
      items: DEFAULT_SIDEBAR_ITEMS,
    });
  } catch (err: any) {
    console.error("Error resetting sidebar config:", err);
    return NextResponse.json(
      { error: "Failed to reset sidebar config: " + (err.message || "Database error") },
      { status: 500 }
    );
  }
}
