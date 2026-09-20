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

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [products, session, homepageConfig] = await Promise.all([
    store.getProducts({ status: "active" }),
    getUserSession(),
    store.getHomepageConfig(),
  ]);

  return (
    <ToastProvider>
      <CartProvider>
        <OrganizationJsonLd />
        <div className="flex flex-col min-h-screen">
          <TopBar topbarConfig={homepageConfig?.topbar} />
          <Navbar products={products} user={session} />
          <CartDrawer />
          <main className="flex-1">{children}</main>
          <Footer config={homepageConfig?.footer} />
        </div>
      </CartProvider>
    </ToastProvider>
  );
}
