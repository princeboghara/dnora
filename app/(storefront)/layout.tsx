import React from "react";
import { TopBar } from "@/components/storefront/TopBar";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { CartProvider } from "@/lib/store/cart-store";
import { ToastProvider } from "@/components/ui/Toast";
import { store } from "@/lib/data/store";
import { OrganizationJsonLd } from "@/components/seo/StructuredData";

import { getUserSession } from "@/lib/auth/user-session";
import { db } from "@/lib/db";
import { DEFAULT_STOREFRONT_NAVIGATION } from "@/lib/navigation-constants";
import { SidebarMenuItem } from "@/types";

async function getStorefrontNavItems(): Promise<SidebarMenuItem[]> {
  try {
    const res = await db.query(
      `SELECT items FROM public.site_navigation_config WHERE id = 'storefront' LIMIT 1`
    );
    let rawItems = res.rows.length > 0 ? res.rows[0].items : null;
    if (typeof rawItems === "string") {
      try {
        rawItems = JSON.parse(rawItems);
      } catch {
        rawItems = null;
      }
    }
    let items: SidebarMenuItem[] =
      Array.isArray(rawItems) && rawItems.length > 0
        ? rawItems
        : DEFAULT_STOREFRONT_NAVIGATION;

    try {
      const categories = await store.getCategories();
      if (categories && categories.length > 0) {
        const categorySubmenus = categories.map((cat) => ({
          id: `sf-cat-${cat.id}`,
          label: cat.name,
          href: `/category/${cat.slug}`,
          is_active: true,
        }));

        let found = false;
        items = items.map((item) => {
          if (item.id === "sf-categories" || item.label?.toLowerCase() === "categories") {
            found = true;
            return {
              ...item,
              submenus: categorySubmenus,
            };
          }
          return item;
        });

        if (!found) {
          items.splice(2, 0, {
            id: "sf-categories",
            label: "Categories",
            href: "/#categories",
            icon: "Box",
            is_active: true,
            submenus: categorySubmenus,
          });
        }
      }
    } catch {
      // ignore
    }

    return items;
  } catch (err) {
    console.error("Error loading storefront navigation in layout:", err);
    return DEFAULT_STOREFRONT_NAVIGATION;
  }
}

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [products, session, navItems] = await Promise.all([
    store.getProducts({ status: "active" }),
    getUserSession(),
    getStorefrontNavItems(),
  ]);

  return (
    <ToastProvider>
      <CartProvider>
        <OrganizationJsonLd />
        <div className="flex flex-col min-h-screen">
          <TopBar />
          <Navbar initialNavItems={navItems} products={products} user={session} />
          <CartDrawer />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </CartProvider>
    </ToastProvider>
  );
}
