"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  ChevronDown,
  User,
  LogOut,
  Shield,
  Loader2,
  Sparkles,
  ShoppingBag,
  Package,
  MapPin,
  Globe,
  Box,
  Star,
  Tag,
  Flame,
  Folder,
  Sliders,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { UserSession } from "@/lib/auth/user-session";
import { SidebarMenuItem } from "@/types";
import { DEFAULT_STOREFRONT_NAVIGATION } from "@/lib/navigation-constants";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Globe,
  ShoppingBag,
  Box,
  User,
  Sparkles,
  Package,
  MapPin,
  Star,
  Tag,
  Flame,
  Folder,
  Sliders,
  Shield,
};

interface MemberDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserSession | null;
}

export function MemberDrawer({ isOpen, onClose, user }: MemberDrawerProps) {
  const pathname = usePathname();
  const [items, setItems] = useState<SidebarMenuItem[]>(DEFAULT_STOREFRONT_NAVIGATION);
  const [loading, setLoading] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    "sf-shop": true, // Expand collections by default for great browsing
  });

  // Fetch dynamic navigation configuration
  useEffect(() => {
    let isMounted = true;
    async function loadNavigation() {
      try {
        const res = await fetch("/api/navigation?target=storefront");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data.items) && data.items.length > 0) {
            setItems(data.items);
          }
        }
      } catch (err) {
        console.error("Failed to load storefront navigation:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadNavigation();
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-expand menu if current route matches any child submenu
  useEffect(() => {
    if (!items || items.length === 0) return;

    setExpandedMenus((prev) => {
      const next = { ...prev };
      items.forEach((item) => {
        if (item.submenus && item.submenus.length > 0) {
          const hasActiveSub = item.submenus.some(
            (sub) => sub.href === pathname || pathname.startsWith(sub.href + "?")
          );
          if (hasActiveSub) {
            next[item.id] = true;
          }
        }
      });
      return next;
    });
  }, [pathname, items]);

  const toggleSubmenu = (id: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSignOut = async () => {
    onClose();
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch {
      window.location.href = "/";
    }
  };

  return (
    <>
      {/* Soft Backdrop Blur */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Navigation Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-full max-w-xs sm:max-w-sm bg-white text-[#0E0E0E] flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Member Navigation Drawer"
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Drawer Header with Brand Logo & Close Button */}
          <div className="p-5 sm:p-6 border-b border-[#E8E5DE] flex items-center justify-between shrink-0 bg-[#FAF9F6]">
            <div onClick={onClose} className="cursor-pointer">
              <BrandLogo size="sm" />
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-[#73706A] hover:text-[#0E0E0E] hover:bg-[#E8E5DE] transition-colors"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Member Profile Status Bar */}
          <div className="p-4 sm:p-5 border-b border-[#E8E5DE] bg-white">
            {user ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#0E0E0E] text-[#FAF9F6] flex items-center justify-center font-serif text-sm font-bold shrink-0">
                    {(user.full_name || user.email || "U")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#0E0E0E] truncate">
                        {user.full_name || user.email.split("@")[0]}
                      </span>
                      <span className="px-1.5 py-0.2 bg-[#C5A880]/20 text-[#8F7449] text-[9px] font-bold uppercase tracking-wider rounded-xs shrink-0">
                        Privé
                      </span>
                    </div>
                    <Link
                      href="/account"
                      onClick={onClose}
                      className="text-[11px] text-[#73706A] hover:text-[#0E0E0E] font-medium flex items-center gap-1 mt-0.5"
                    >
                      <Package className="w-3 h-3 text-[#C5A880]" />
                      <span>My Account & Orders</span>
                    </Link>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Sign out"
                  className="p-2 text-[#73706A] hover:text-rose-600 hover:bg-rose-50 rounded-sm transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-bold block">
                    Welcome to Maison DNORA
                  </span>
                  <span className="text-xs font-medium text-[#73706A]">
                    Access bespoke collections & tracking
                  </span>
                </div>

                <Link
                  href="/login"
                  onClick={onClose}
                  className="px-3.5 py-1.5 bg-[#0E0E0E] hover:bg-[#242321] text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors shrink-0"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Navigation Links Scrollable List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
            <div className="flex items-center justify-between px-2 mb-1">
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#A8A49C]">
                Explore Maison
              </span>
              {loading && <Loader2 className="w-3 h-3 text-[#73706A] animate-spin" />}
            </div>

            <nav className="space-y-1">
              {items.map((item) => {
                const hasSubmenus =
                  Array.isArray(item.submenus) && item.submenus.length > 0;
                const isExpanded = !!expandedMenus[item.id];
                const IconComp = ICON_MAP[item.icon] || ShoppingBag;

                const isDirectActive =
                  item.href === "/"
                    ? pathname === "/"
                    : item.href && pathname.startsWith(item.href);

                const isAnySubActive =
                  hasSubmenus &&
                  item.submenus!.some(
                    (sub) =>
                      sub.href === pathname ||
                      (sub.href !== "/" && pathname.startsWith(sub.href))
                  );

                const isActive = isDirectActive || isAnySubActive;

                return (
                  <div key={item.id} className="select-none">
                    {/* Main Menu Item Row */}
                    <div
                      className={cn(
                        "group flex items-center justify-between px-3 py-2.5 rounded-sm transition-all duration-200",
                        isActive
                          ? "bg-[#FAF9F6] text-[#0E0E0E] font-semibold"
                          : "text-[#3A3835] hover:bg-[#FAF9F6] hover:text-[#0E0E0E]"
                      )}
                    >
                      {item.href && !hasSubmenus ? (
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className="flex items-center gap-3 flex-1 min-w-0 text-xs uppercase tracking-wider font-semibold"
                        >
                          <IconComp className="w-4 h-4 text-[#8F7449] shrink-0" />
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded font-bold bg-[#C5A880]/20 text-[#8F7449] shrink-0">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleSubmenu(item.id)}
                          className="flex items-center gap-3 flex-1 min-w-0 text-left text-xs uppercase tracking-wider font-semibold"
                        >
                          <IconComp className="w-4 h-4 text-[#8F7449] shrink-0" />
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded font-bold bg-[#C5A880]/20 text-[#8F7449] shrink-0">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      )}

                      {/* Dropdown Chevron for Submenus */}
                      {hasSubmenus && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleSubmenu(item.id);
                          }}
                          className="p-1 rounded-sm text-[#73706A] hover:text-[#0E0E0E] transition-colors ml-1"
                          aria-label={
                            isExpanded ? "Collapse submenu" : "Expand submenu"
                          }
                        >
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 transition-transform duration-300 ease-in-out",
                              isExpanded ? "rotate-180 text-[#0E0E0E]" : "rotate-0"
                            )}
                          />
                        </button>
                      )}
                    </div>

                    {/* Smooth Collapsible Nested Submenus */}
                    {hasSubmenus && (
                      <div
                        className={cn(
                          "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out overflow-hidden",
                          isExpanded
                            ? "grid-rows-[1fr] opacity-100 mt-1"
                            : "grid-rows-[0fr] opacity-0 pointer-events-none"
                        )}
                      >
                        <div className="overflow-hidden space-y-0.5 pl-9 pr-2">
                          {item.submenus!.map((sub) => {
                            const isSubActive =
                              pathname === sub.href ||
                              (sub.href !== "/" && pathname.startsWith(sub.href));

                            return (
                              <Link
                                key={sub.id}
                                href={sub.href}
                                onClick={onClose}
                                className={cn(
                                  "flex items-center justify-between px-3 py-1.5 rounded-sm text-[11px] font-medium transition-colors",
                                  isSubActive
                                    ? "bg-[#C5A880]/15 text-[#8F7449] font-bold"
                                    : "text-[#73706A] hover:text-[#0E0E0E] hover:bg-[#FAF9F6]"
                                )}
                              >
                                <span className="truncate">{sub.label}</span>
                                {sub.badge && (
                                  <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded font-bold bg-[#E8E5DE] text-[#0E0E0E]">
                                    {sub.badge}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 sm:p-5 border-t border-[#E8E5DE] bg-[#FAF9F6] space-y-3 shrink-0">
          <div className="flex items-center justify-between text-xs">
            <Link
              href="/admin"
              onClick={onClose}
              className="flex items-center gap-1.5 text-[#73706A] hover:text-[#0E0E0E] font-semibold uppercase tracking-wider transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-[#8F7449]" />
              <span>Admin Management</span>
            </Link>

            <Link
              href="/shop"
              onClick={onClose}
              className="text-[#8F7449] hover:underline font-medium text-[11px]"
            >
              Explore Shop
            </Link>
          </div>

          <div className="pt-2 border-t border-[#E8E5DE]/80 text-[10px] text-[#A8A49C] flex items-center justify-between uppercase tracking-widest">
            <span>Maison DNORA</span>
            <span>Florence • Milan</span>
          </div>
        </div>
      </aside>
    </>
  );
}
