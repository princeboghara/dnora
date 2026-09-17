"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Image as ImageIcon,
  ShoppingBag,
  ShoppingCart,
  Users,
  Star,
  Video,
  Ticket,
  BarChart3,
  Settings,
  X,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/ui/BrandLogo";

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function AdminSidebar({ mobileOpen = false, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();

  const activeNavItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Hero Banners", href: "/admin/heroes", icon: ImageIcon },
    { label: "Products", href: "/admin/products", icon: ShoppingBag },
  ];

  const futureNavItems = [
    { label: "Orders", icon: ShoppingCart },
    { label: "Customers", icon: Users },
    { label: "Reviews", icon: Star },
    { label: "Seen On You", icon: Video },
    { label: "Coupons", icon: Ticket },
    { label: "Analytics", icon: BarChart3 },
    { label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-[#0E0E0E] text-[#FAF9F6] border-r border-[#242321] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#242321]">
            <div className="flex items-center gap-2">
              <BrandLogo size="sm" href="/admin" />
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#C5A880]/20 text-[#C5A880]">
                Admin
              </span>
            </div>
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-[#73706A] hover:text-white lg:hidden"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-6">
            <div>
              <p className="px-3 text-[10px] uppercase tracking-[0.2em] font-semibold text-[#73706A] mb-2">
                Active Modules
              </p>
              <nav className="space-y-1">
                {activeNavItems.map((item) => {
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all",
                        isActive
                          ? "bg-[#FAF9F6] text-[#0E0E0E] shadow-sm"
                          : "text-[#A8A49C] hover:bg-[#1C1B1A] hover:text-[#FAF9F6]"
                      )}
                    >
                      <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-[#0E0E0E]" : "text-[#73706A]")} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Later Ready / Coming Soon Modules */}
            <div>
              <p className="px-3 text-[10px] uppercase tracking-[0.2em] font-semibold text-[#5A5854] mb-2">
                Future Modules
              </p>
              <nav className="space-y-1">
                {futureNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex items-center justify-between px-3 py-2 text-xs font-medium text-[#5A5854] cursor-not-allowed select-none rounded-md"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 shrink-0 opacity-50" />
                        <span>{item.label}</span>
                      </div>
                      <span className="text-[9px] uppercase tracking-wider bg-[#1C1B1A] px-1.5 py-0.5 rounded text-[#73706A]">
                        Soon
                      </span>
                    </div>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom Store Link */}
        <div className="p-4 border-t border-[#242321]">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-semibold text-[#A8A49C] hover:text-white hover:bg-[#1C1B1A] transition-all"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              <span>View Live Store</span>
            </span>
          </Link>
        </div>
      </aside>
    </>
  );
}
