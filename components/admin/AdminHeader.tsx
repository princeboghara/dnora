"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  ExternalLink,
  LogOut,
  ShieldCheck,
} from "lucide-react";

interface AdminHeaderProps {
  onOpenMobileSidebar: () => void;
}

const TITLES: Record<string, { title: string; subtitle: string }> = {
  "/admin": {
    title: "Executive Dashboard",
    subtitle: "Overview of all active storefront presentation modules",
  },
  "/admin/announcements": {
    title: "Announcement Bar Customizer",
    subtitle: "Manage storewide ticker messages, rotation intervals, and active status",
  },
  "/admin/heroes": {
    title: "Hero Banner & Media Studio",
    subtitle: "Configure video and image showcase slides with mobile-specific crops",
  },
  "/admin/navigation": {
    title: "Storefront Navigation Manager",
    subtitle: "Customize categories, mega-menu subcategories, badges, and links",
  },
};

export function AdminHeader({ onOpenMobileSidebar }: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const currentMeta = TITLES[pathname] || {
    title: "Executive Control Suite",
    subtitle: "DNORA Luxury Management",
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 px-4 sm:px-8 flex items-center justify-between">
      {/* Left: Mobile hamburger + Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 rounded-md text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-sm sm:text-base font-bold text-neutral-900 tracking-wide uppercase">
            {currentMeta.title}
          </h1>
          <p className="hidden sm:block text-[11px] text-neutral-500 truncate">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Quick actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Admin Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10.5px] font-bold tracking-wider uppercase">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Admin Authenticated</span>
        </div>

        {/* View Live Storefront */}
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-100 hover:bg-neutral-900 text-neutral-700 hover:text-white transition-all text-xs font-semibold tracking-wider uppercase"
        >
          <span>Live Store</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {/* Sign Out */}
        <button
          type="button"
          onClick={handleLogout}
          className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
          title="Sign Out of Admin Suite"
          aria-label="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
