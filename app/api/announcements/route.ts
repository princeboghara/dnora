import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEFAULT_ANNOUNCEMENT_CONFIG } from "@/lib/data/default-announcements";
import { verifyAdminSession } from "@/lib/auth/session";
import { AnnouncementConfig, AnnouncementItem } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await db.query(
      `SELECT id, interval_seconds, is_active, items, updated_at
       FROM public.announcements_config
       WHERE id = 'default'
       LIMIT 1`
    );

    if (res.rows.length > 0) {
      const row = res.rows[0];
      const config: AnnouncementConfig = {
        id: row.id,
        interval_seconds: Number(row.interval_seconds) || 4,
        is_active: Boolean(row.is_active),
        items: Array.isArray(row.items) ? row.items : DEFAULT_ANNOUNCEMENT_CONFIG.items,
        updated_at: row.updated_at,
      };
      return NextResponse.json(config);
    }

    return NextResponse.json(DEFAULT_ANNOUNCEMENT_CONFIG);
  } catch (err: unknown) {
    console.error("Error fetching announcements config:", err);
    return NextResponse.json(DEFAULT_ANNOUNCEMENT_CONFIG);
  }
}

export async function POST(req: NextRequest) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      interval_seconds = 4,
      is_active = true,
      items = [],
    } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "Invalid payload: 'items' must be an array." },
        { status: 400 }
      );
    }

    const cleanInterval = Math.max(1, Math.min(60, Number(interval_seconds) || 4));

    // Sanitize and structure items
    const sanitizedItems: AnnouncementItem[] = items.map((item, idx) => ({
      id: String(item.id || `ann-${Date.now()}-${idx}`),
      text: String(item.text || "").trim(),
      link: item.link ? String(item.link).trim() : undefined,
      badge: item.badge ? String(item.badge).trim() : undefined,
      is_active: Boolean(item.is_active ?? true),
      sort_order: Number(item.sort_order ?? idx + 1),
    })).filter((item) => item.text.length > 0);

    await db.query(
      `INSERT INTO public.announcements_config (id, interval_seconds, is_active, items, updated_at)
       VALUES ('default', $1, $2, $3, timezone('utc'::text, now()))
       ON CONFLICT (id) DO UPDATE SET
         interval_seconds = EXCLUDED.interval_seconds,
         is_active = EXCLUDED.is_active,
         items = EXCLUDED.items,
         updated_at = EXCLUDED.updated_at;`,
      [cleanInterval, Boolean(is_active), JSON.stringify(sanitizedItems)]
    );

    const updatedConfig: AnnouncementConfig = {
      id: "default",
      interval_seconds: cleanInterval,
      is_active: Boolean(is_active),
      items: sanitizedItems,
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Announcement bar settings updated successfully.",
      config: updatedConfig,
    });
  } catch (err: unknown) {
    console.error("Error updating announcement bar config:", err);
    const msg = err instanceof Error ? err.message : "Database error";
    return NextResponse.json(
      { error: "Failed to update announcement bar config: " + msg },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const deleteId = searchParams.get("id");
    const isReset = searchParams.get("reset") === "true";

    if (isReset) {
      await db.query(
        `INSERT INTO public.announcements_config (id, interval_seconds, is_active, items, updated_at)
         VALUES ('default', $1, $2, $3, timezone('utc'::text, now()))
         ON CONFLICT (id) DO UPDATE SET
           interval_seconds = EXCLUDED.interval_seconds,
           is_active = EXCLUDED.is_active,
           items = EXCLUDED.items,
           updated_at = EXCLUDED.updated_at;`,
        [
          DEFAULT_ANNOUNCEMENT_CONFIG.interval_seconds,
          DEFAULT_ANNOUNCEMENT_CONFIG.is_active,
          JSON.stringify(DEFAULT_ANNOUNCEMENT_CONFIG.items),
        ]
      );

      return NextResponse.json({
        success: true,
        message: "Reset announcements to default settings.",
        config: DEFAULT_ANNOUNCEMENT_CONFIG,
      });
    }

    if (!deleteId) {
      return NextResponse.json({ error: "Missing announcement id to delete." }, { status: 400 });
    }

    const currentRes = await db.query(
      `SELECT items, interval_seconds, is_active FROM public.announcements_config WHERE id = 'default' LIMIT 1`
    );

    const currentItems: AnnouncementItem[] =
      currentRes.rows.length > 0 && Array.isArray(currentRes.rows[0].items)
        ? currentRes.rows[0].items
        : DEFAULT_ANNOUNCEMENT_CONFIG.items;

    const filteredItems = currentItems.filter((i) => i.id !== deleteId);

    await db.query(
      `UPDATE public.announcements_config
       SET items = $1, updated_at = timezone('utc'::text, now())
       WHERE id = 'default'`,
      [JSON.stringify(filteredItems)]
    );

    return NextResponse.json({
      success: true,
      message: "Announcement deleted successfully.",
      deletedId: deleteId,
      remainingCount: filteredItems.length,
    });
  } catch (err: unknown) {
    console.error("Error deleting announcement:", err);
    const msg = err instanceof Error ? err.message : "Database error";
    return NextResponse.json(
      { error: "Failed to delete announcement: " + msg },
      { status: 500 }
    );
  }
}
