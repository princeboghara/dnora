"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  LogOut,
  UserCheck,
  Megaphone,
  PanelLeftClose,
  PanelLeftOpen,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface AdminHeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenCustomizer?: () => void;
  sidebarCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AdminHeader({
  onOpenMobileSidebar,
  sidebarCollapsed = false,
  onToggleCollapse,
}: AdminHeaderProps) {
  const router = useRouter();
  const { info } = useToast();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      info("Logged out of DNORA Admin.");
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-colors">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileSidebar}
          aria-label="Open mobile navigation"
          className="p-2 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl md:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Laptop & Desktop Sidebar Collapse Toggle Button */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={sidebarCollapsed ? "Expand sidebar (full view)" : "Collapse sidebar (icon-only mode)"}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-950 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.04)] active:scale-95 transition-all cursor-pointer"
          >
            {sidebarCollapsed ? (
              <>
                <PanelLeftOpen className="w-4 h-4 text-indigo-600" />
                <span className="text-[11px]">Expand</span>
              </>
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4 text-slate-600" />
                <span className="text-[11px] text-slate-500">Collapse</span>
              </>
            )}
          </button>
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest font-bold text-slate-800">
            DNORA Executive Suite
          </span>
          <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Live Storefront Preview Link */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-950 font-semibold border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-xl transition-all bg-white hover:bg-slate-50 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          title="Open live storefront in new tab"
        >
          <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden md:inline">Live Store</span>
        </Link>

        {/* Direct Announcement Bar Shortcut */}
        <Link
          href="/admin/customization/announcementbar"
          className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-950 font-semibold border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-xl transition-all bg-white hover:bg-slate-50 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          title="Customize Top Announcement Bar"
        >
          <Megaphone className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Announcement Bar</span>
        </Link>

        {/* Administrator Badge */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Administrator</span>
        </div>

        {/* Logout Button with Soft 3D tactile feel */}
        <button
          onClick={handleLogout}
          aria-label="Log out"
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-rose-600 font-semibold uppercase tracking-wider px-3 py-1.5 rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer active:scale-95"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
