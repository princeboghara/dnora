"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
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

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products Catalog", icon: ShoppingBag },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/collections", label: "Collections", icon: Layers },
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

  // 1. If visiting dedicated Admin Login page, render directly
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // 2. While verifying session, show luxury matte black screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d0f14] flex items-center justify-center text-[#C5A880]">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl neu-inset flex items-center justify-center p-2.5">
            <Image
              src="/images/logo/dnora-d-icon.png"
              alt="DNORA"
              width={36}
              height={36}
              className="w-full h-full object-contain animate-pulse"
            />
          </div>
          <p className="text-[11px] uppercase tracking-[0.3em] font-mono text-[#8A95A5]">
            Authenticating Terminal...
          </p>
        </div>
      </div>
    );
  }

  // 3. Gatekeeper: redirect to /admin/login if not authenticated
  if (!isAdmin) {
    if (typeof window !== "undefined") {
      router.push("/admin/login");
    }
    return (
      <div className="min-h-screen bg-[#0d0f14] flex items-center justify-center text-[#8491A5]">
        <p className="text-xs">Redirecting to Admin Portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0f14] text-[#EDEDED] flex flex-col lg:flex-row font-sans selection:bg-[#C5A880] selection:text-[#0d0f14]">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-[#14171e] neu-flat border-b border-white/[0.03]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl neu-inset p-1 flex items-center justify-center">
            <Image
              src="/images/logo/dnora-d-icon.png"
              alt="DNORA"
              width={24}
              height={24}
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-serif text-lg tracking-[0.2em] text-[#F5F7FA] uppercase">
            D&apos;NORA
          </span>
          <span className="text-[9px] uppercase tracking-wider text-[#C5A880] bg-[#C5A880]/10 px-2 py-0.5 rounded-md border border-[#C5A880]/30 font-semibold font-mono">
            Control
          </span>
        </div>

        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="p-2 rounded-xl neu-btn text-[#8A95A5] hover:text-[#EDEDED]"
        >
          {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Admin Neumorphic Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-68 bg-[#12151b] border-r border-white/[0.04] shadow-[12px_0_30px_rgba(0,0,0,0.7)] flex flex-col justify-between transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen overflow-y-auto ${
          isMobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 space-y-6">
          {/* Logo & Brand Identity */}
          <div className="p-4 rounded-2xl neu-inset border border-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl neu-raised flex items-center justify-center p-1.5 overflow-hidden shadow-inner">
                <Image
                  src="/images/logo/dnora-d-icon.png"
                  alt="D"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <Link href="/admin" className="font-serif text-lg tracking-[0.18em] text-[#F5F7FA] uppercase font-medium">
                  D&apos;NORA
                </Link>
                <p className="text-[9px] uppercase tracking-[0.2em] text-[#8A95A5] font-mono">
                  Atelier Control
                </p>
              </div>
            </div>

            <span className="text-[9px] uppercase tracking-wider text-[#C5A880] bg-[#C5A880]/10 px-2 py-1 rounded-md border border-[#C5A880]/30 font-mono font-bold">
              Root
            </span>
          </div>

          {/* Navigation Links with Neumorphic States */}
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
                      ? "neu-inset text-[#C5A880] font-semibold border-l-2 border-[#C5A880] shadow-[inset_3px_3px_6px_rgba(0,0,0,0.8),inset_-2px_-2px_6px_rgba(255,255,255,0.03)]"
                      : "neu-btn text-[#8A95A5] hover:text-[#EDEDED]"
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-[#C5A880]" : "text-[#6E7B8E]"}`} />
                  <span className="tracking-wide">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Raised Profile Tile */}
        <div className="p-4 border-t border-white/[0.03] space-y-3 text-xs">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl neu-btn text-[#8A95A5] hover:text-[#C5A880] transition-colors"
          >
            <span className="text-[11px] uppercase tracking-wider font-medium">Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="p-3 rounded-2xl neu-flat flex items-center justify-between gap-2 border border-white/[0.02]">
            <div className="min-w-0 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg neu-inset flex items-center justify-center text-[#C5A880] font-serif font-bold text-xs">
                {adminUser?.fullName?.charAt(0) || "A"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#F5F7FA] truncate">
                  {adminUser?.fullName || "Executive Admin"}
                </p>
                <p className="text-[10px] text-[#8A95A5] font-mono truncate">
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
              className="p-2 rounded-xl neu-btn text-[#8A95A5] hover:text-[#FF6B6B] transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Canvas with Matte Black Neumorphic Feel */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-[#0d0f14] p-4 sm:p-6 lg:p-8">
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
