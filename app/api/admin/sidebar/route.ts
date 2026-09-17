import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { store } from "@/lib/data/store";
import { DEFAULT_SIDEBAR_ITEMS } from "@/lib/sidebar-constants";
import { SidebarMenuItem } from "@/types";
import { verifyAdminSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await store.getCategories().catch(() => []);
    const dynamicCatSubmenus = [
      { id: "sub-cat-all", label: "All Categories", href: "/admin/categories" },
      ...categories.map((c) => ({
        id: `sub-cat-${c.id}`,
        label: c.name,
        href: `/admin/categories?category=${c.id}`,
        is_active: true,
      })),
    ];

    const res = await db.query(
      `SELECT items FROM public.admin_sidebar_config WHERE id = 'default' LIMIT 1`
    );

    let items: SidebarMenuItem[] = DEFAULT_SIDEBAR_ITEMS;

    if (res.rows.length > 0 && Array.isArray(res.rows[0].items)) {
      let dbItems = res.rows[0].items;

      // Filter out outdated/placeholder items
      dbItems = dbItems.filter(
        (item: { id?: string; badge?: string }) =>
          item.id !== "nav-orders" &&
          item.id !== "nav-analytics" &&
          item.badge !== "Soon" &&
          item.id !== "nav-announcements" && // Move into Store Front submenu
          item.id !== "nav-heroes" // Move into Store Front submenu
      );

      // Verify if Store Front item exists
      let storefrontItem = dbItems.find(
        (item: { id?: string }) => item.id === "nav-storefront"
      );
      if (!storefrontItem) {
        storefrontItem = DEFAULT_SIDEBAR_ITEMS.find(
          (item) => item.id === "nav-storefront"
        );
        if (storefrontItem) {
          dbItems.push(storefrontItem);
        }
      }

      // Verify if Categories item exists
      let categoriesItem = dbItems.find(
        (item: { id?: string }) => item.id === "nav-categories"
      );
      if (!categoriesItem) {
        categoriesItem = DEFAULT_SIDEBAR_ITEMS.find(
          (item) => item.id === "nav-categories"
        );
        if (categoriesItem) {
          const dashIdx = dbItems.findIndex((it: { id?: string }) => it.id === "nav-dashboard");
          if (dashIdx !== -1) {
            dbItems.splice(dashIdx + 1, 0, categoriesItem);
          } else {
            dbItems.unshift(categoriesItem);
          }
        }
      }

      // Sync submenus for categories
      dbItems = dbItems.map((item: SidebarMenuItem) => {
        if (item.id === "nav-categories") {
          return {
            ...item,
            submenus: dynamicCatSubmenus,
          };
        }
        if (item.id === "nav-storefront" && (!item.submenus || item.submenus.length === 0)) {
          return {
            ...item,
            submenus: [
              { id: "sub-sf-announcements", label: "Announcement Bar", href: "/admin/announcements" },
              { id: "sub-sf-heroes", label: "Hero Banners", href: "/admin/heroes" },
              { id: "sub-sf-sidebar", label: "Sidebar", href: "/admin?customize=true" },
            ],
          };
        }
        return item;
      });

      // Enforce the requested sequence:
      // 1. Dashboard, 2. Categories, 3. Products, 4. Customers, 5. Store Front
      const sequenceMap: Record<string, number> = {
        "nav-dashboard": 1,
        "nav-categories": 2,
        "nav-products": 3,
        "nav-customers": 4,
        "nav-storefront": 5,
      };

      dbItems.sort((a: SidebarMenuItem, b: SidebarMenuItem) => {
        const orderA = sequenceMap[a.id] || 99;
        const orderB = sequenceMap[b.id] || 99;
        return orderA - orderB;
      });

      // Persist updated structure
      db.query(
        `UPDATE public.admin_sidebar_config SET items = $1, updated_at = now() WHERE id = 'default'`,
        [JSON.stringify(dbItems)]
      ).catch((e) => console.error("Error updating sidebar db:", e));

      return NextResponse.json({ items: dbItems });
    }

    // Default fallback with dynamic categories
    const defaultItemsWithCats = DEFAULT_SIDEBAR_ITEMS.map((item) => {
      if (item.id === "nav-categories") {
        return {
          ...item,
          submenus: dynamicCatSubmenus,
        };
      }
      return item;
    });

    return NextResponse.json({ items: defaultItemsWithCats });
  } catch (err: unknown) {
    console.error("Error fetching admin sidebar config:", err);
    return NextResponse.json({ items: DEFAULT_SIDEBAR_ITEMS });
  }
}

export async function POST(req: NextRequest) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
  } catch (err: unknown) {
    console.error("Error saving admin sidebar config:", err);
    const message = err instanceof Error ? err.message : "Database error";
    return NextResponse.json(
      { error: "Failed to save sidebar config: " + message },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
  } catch (err: unknown) {
    console.error("Error resetting sidebar config:", err);
    const message = err instanceof Error ? err.message : "Database error";
    return NextResponse.json(
      { error: "Failed to reset sidebar config: " + message },
      { status: 500 }
    );
  }
}
