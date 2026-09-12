"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  FolderTree,
  Archive,
  ShoppingCart,
  Users,
  Tag,
  Sliders,
  MessageSquare,
  History,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Menu,
  X,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { Providers } from "@/components/providers";
import { DnoraLoadingScreen } from "@/components/ui/DnoraLoadingScreen";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products Catalog", icon: ShoppingBag },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/inventory", label: "Inventory Alerts", icon: Archive },
  { href: "/admin/orders", label: "Orders & Pipeline", icon: ShoppingCart },
  { href: "/admin/customers", label: "Patrons Directory", icon: Users },
  { href: "/admin/coupons", label: "Coupons & Privileges", icon: Tag },
  { href: "/admin/cms", label: "Homepage CMS", icon: Sliders },
  { href: "/admin/reviews", label: "Reviews Moderation", icon: MessageSquare },
  { href: "/admin/audit-logs", label: "Audit Trail", icon: History },
  { href: "/admin/settings", label: "Store Settings", icon: Settings },
];

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { adminUser, isAdmin, adminSignOut, isLoading } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const hasRedirectedRef = useRef(false);

  // Clean legacy client-side mock caches once so Supabase database is single source of truth
  useEffect(() => {
    if (typeof window !== "undefined") {
      const clearedKey = "dnora_db_migration_cleaned_v1";
      if (!localStorage.getItem(clearedKey)) {
        localStorage.removeItem("dnora_admin_products_override");
        localStorage.removeItem("dnora_admin_categories_override");
        localStorage.removeItem("dnora_admin_banners_override");
        localStorage.removeItem("dnora_atelier_orders");
        localStorage.setItem(clearedKey, "true");
      }
    }
  }, []);

  // Safely redirect to /admin/login outside render cycle when unauthenticated
  useEffect(() => {
    if (pathname === "/admin/login") {
      hasRedirectedRef.current = false;
      return;
    }

    if (!isLoading && !isAdmin && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      const timer = setTimeout(() => {
        router.replace("/admin/login");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAdmin, pathname, router]);

  // 1. If visiting dedicated Admin Login page, render directly
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // 2. While verifying session, show authentic DNORA handwriting loading screen
  if (isLoading) {
    return (
      <DnoraLoadingScreen
        fullScreen
        mode="admin"
        text="Authenticating Atelier Terminal..."
        subtitle="VERIFYING SECURITY CREDENTIALS..."
      />
    );
  }

  // 3. Gatekeeper: show loading screen while redirecting if not authenticated
  if (!isAdmin) {
    return (
      <DnoraLoadingScreen
        fullScreen
        mode="admin"
        text="Redirecting to Admin Portal..."
        subtitle="ESTABLISHING SECURE GATEWAY..."
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col lg:flex-row text-[#334155] font-sans antialiased selection:bg-[#C5A880]/30 selection:text-[#0F172A]">
      {/* Mobile Top App Bar with Light Neumorphism */}
      <header className="lg:hidden sticky top-0 z-30 bg-[#F8FAFC]/90 backdrop-blur-md px-4 py-3 border-b border-slate-200/80 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl neu-inset bg-[#F1F5F9] flex items-center justify-center p-1">
            <Image
              src="/images/logo/dnora-d-icon.png"
              alt="DNORA"
              width={24}
              height={24}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="font-sans text-xs tracking-[0.18em] text-[#0F172A] uppercase font-bold">
              DNORA
            </span>
            <span className="text-[8px] uppercase tracking-wider text-[#64748B] block font-mono">
              Atelier Terminal
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="p-2 rounded-xl neu-btn text-[#475569] hover:text-[#0F172A] cursor-pointer transition-colors"
          aria-label="Toggle Admin Navigation"
        >
          {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer Backdrop Overlay */}
      <div
        className={`fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-400 ease-out lg:hidden ${
          isMobileNavOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileNavOpen(false)}
      />

      {/* Admin White Neumorphic Sidebar (Permanent & Sticky on Laptop/Desktop, Smooth Drawer on Mobile) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 min-w-[18rem] shrink-0 bg-[#F8FAFC] border-r border-slate-200/80 shadow-[6px_0_24px_rgba(166,178,198,0.25)] flex flex-col justify-between transform transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] lg:translate-x-0 lg:static lg:sticky lg:top-0 lg:h-screen overflow-y-auto ${
          isMobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 space-y-6">
          {/* Logo & Brand Identity */}
          <div className="p-4 rounded-2xl neu-flat bg-white border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl neu-inset bg-[#F1F5F9] flex items-center justify-center p-1.5 overflow-hidden">
                <Image
                  src="/images/logo/dnora-d-icon.png"
                  alt="D"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <Link href="/admin" className="font-sans text-base tracking-[0.18em] text-[#0F172A] uppercase font-bold">
                  D&apos;NORA
                </Link>
                <p className="text-[9px] uppercase tracking-[0.2em] text-[#64748B] font-mono">
                  Atelier Control
                </p>
              </div>
            </div>

            <span className="text-[9px] uppercase tracking-wider text-[#9E7D4E] bg-[#C5A880]/15 px-2 py-1 rounded-md border border-[#C5A880]/30 font-mono font-bold">
              Root
            </span>
          </div>

          {/* Navigation Links with White Neumorphic States */}
          <nav className="space-y-1.5 text-xs">
            {ADMIN_NAV.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-all ${
                    isActive
                      ? "neu-inset bg-[#F1F5F9] text-[#9E7D4E] font-semibold border-l-3 border-[#C5A880] shadow-[inset_3px_3px_6px_rgba(166,178,198,0.35),inset_-2px_-2px_6px_#FFFFFF]"
                      : "neu-btn text-[#475569] hover:text-[#0F172A]"
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-[#9E7D4E]" : "text-[#64748B]"}`} />
                  <span className="tracking-wide">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Raised Profile Tile */}
        <div className="p-4 border-t border-slate-200/80 space-y-3 text-xs bg-[#F8FAFC]">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl neu-btn text-[#475569] hover:text-[#9E7D4E] transition-colors"
          >
            <span className="text-[11px] uppercase tracking-wider font-semibold">Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="p-3 rounded-2xl neu-flat bg-white flex items-center justify-between gap-2 border border-slate-200/80">
            <div className="min-w-0 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl neu-inset bg-[#F1F5F9] flex items-center justify-center text-[#9E7D4E] font-sans font-bold text-xs">
                {adminUser?.fullName?.charAt(0) || "A"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#0F172A] truncate">
                  {adminUser?.fullName || "Executive Admin"}
                </p>
                <p className="text-[10px] text-[#64748B] font-mono truncate">
                  {adminUser?.email || "admin@dnora.luxury"}
                </p>
              </div>
            </div>

            <button
              onClick={async () => {
                await adminSignOut();
                router.push("/admin/login");
              }}
              title="Lock Terminal / Sign Out"
              className="p-2 rounded-xl neu-btn text-[#64748B] hover:text-[#EF4444] transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Canvas with White Neumorphic Feel */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-[#EEF2F6] p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </Providers>
  );
}
