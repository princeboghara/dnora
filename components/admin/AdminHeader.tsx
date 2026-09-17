"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Menu, LogOut, UserCheck, Sliders } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface AdminHeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenCustomizer?: () => void;
}

export function AdminHeader({
  onOpenMobileSidebar,
  onOpenCustomizer,
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
    <header className="sticky top-0 z-30 bg-white border-b border-[#E8E5DE] px-4 sm:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          aria-label="Open sidebar"
          className="p-2 text-[#0E0E0E] hover:bg-[#F5F3EF] rounded-md lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-xs uppercase tracking-widest font-bold text-[#73706A]">
          DNORA Executive Suite
        </span>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {onOpenCustomizer && (
          <button
            type="button"
            onClick={onOpenCustomizer}
            className="flex items-center gap-1.5 text-xs text-[#73706A] hover:text-[#0E0E0E] font-medium border border-[#E8E5DE] hover:border-[#0E0E0E] px-3 py-1.5 rounded transition-all bg-[#FAF9F6] hover:bg-white"
            title="Edit and customize sidebar navigation"
          >
            <Sliders className="w-3.5 h-3.5 text-[#8F7449]" />
            <span className="hidden md:inline">Edit Sidebar</span>
          </button>
        )}

        <div className="flex items-center gap-2 text-xs font-medium text-[#0E0E0E] bg-[#F5F3EF] px-3 py-1.5 rounded-full border border-[#E8E5DE]">
          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">admin@dnora.luxury</span>
        </div>

        <button
          onClick={handleLogout}
          aria-label="Log out"
          className="flex items-center gap-1.5 text-xs text-[#73706A] hover:text-rose-600 font-semibold uppercase tracking-wider px-3 py-1.5 rounded hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
