"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  const router = useRouter();
  const [items, setItems] = useState<SidebarMenuItem[]>(DEFAULT_STOREFRONT_NAVIGATION);
  const [loading, setLoading] = useState(true);
  const [userExpandedOverrides, setUserExpandedOverrides] = useState<Record<string, boolean>>({});

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

  const toggleSubmenu = (id: string, currentState: boolean) => {
    setUserExpandedOverrides((prev) => ({
      ...prev,
      [id]: !currentState,
    }));
  };

  const handleSignOut = async () => {
    onClose();
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Failed to sign out:", err);
    } finally {
      router.push("/");
      router.refresh();
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
          <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
            <div onClick={onClose} className="cursor-pointer">
              <BrandLogo size="sm" />
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Member Profile Status Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-white">
            {user ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-serif text-sm font-bold shrink-0">
                    {(user.full_name || user.email || "U")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {user.full_name || user.email.split("@")[0]}
                      </span>
                      <span className="px-1.5 py-0.2 bg-slate-100 text-slate-800 text-[9px] font-bold uppercase tracking-wider rounded-xs shrink-0">
                        Member
                      </span>
                    </div>
                    <Link
                      href="/account"
                      onClick={onClose}
                      className="text-[11px] text-slate-500 hover:text-slate-900 font-medium flex items-center gap-1 mt-0.5"
                    >
                      <Package className="w-3 h-3 text-slate-900" />
                      <span>My Account & Orders</span>
                    </Link>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Sign out"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-sm transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-slate-900 font-bold block">
                    Welcome to Maison DNORA
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    Access bespoke collections & tracking
                  </span>
                </div>

                <Link
                  href="/login"
                  onClick={onClose}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors shrink-0 cursor-pointer"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Navigation Links Scrollable List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
            <div className="flex items-center justify-between px-2 mb-1">
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-400">
                Explore Maison
              </span>
              {loading && <Loader2 className="w-3 h-3 text-slate-500 animate-spin" />}
            </div>

            <nav className="space-y-1">
              {items.map((item) => {
                const hasSubmenus =
                  Array.isArray(item.submenus) && item.submenus.length > 0;

                const isExpanded = Boolean(userExpandedOverrides[item.id]);

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
                        "group flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200",
                        isActive
                          ? "bg-slate-100 text-slate-900 font-semibold"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      {item.href && !hasSubmenus ? (
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className="flex items-center gap-3 flex-1 min-w-0 text-xs uppercase tracking-wider font-semibold"
                        >
                          <IconComp className="w-4 h-4 text-slate-900 shrink-0" />
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded font-bold bg-slate-100 text-slate-900 shrink-0">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleSubmenu(item.id, isExpanded)}
                          className="flex items-center gap-3 flex-1 min-w-0 text-left text-xs uppercase tracking-wider font-semibold"
                        >
                          <IconComp className="w-4 h-4 text-slate-900 shrink-0" />
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded font-bold bg-slate-100 text-slate-900 shrink-0">
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
                            toggleSubmenu(item.id, isExpanded);
                          }}
                          className="p-1 rounded-sm text-slate-500 hover:text-slate-900 transition-colors ml-1"
                          aria-label={
                            isExpanded ? "Collapse submenu" : "Expand submenu"
                          }
                        >
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 transition-transform duration-300 ease-in-out",
                              isExpanded ? "rotate-180 text-slate-900" : "rotate-0"
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
                                    ? "bg-slate-100 text-slate-900 font-bold"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                )}
                              >
                                <span className="truncate">{sub.label}</span>
                                {sub.badge && (
                                  <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded font-bold bg-slate-200 text-slate-900">
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
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-white space-y-3 shrink-0">
          <div className="flex items-center justify-between text-xs">
            <Link
              href="/shop"
              onClick={onClose}
              className="text-slate-900 hover:text-slate-600 font-semibold uppercase tracking-wider text-[11px] transition-colors"
            >
              Explore Collection
            </Link>

            <Link
              href="/account"
              onClick={onClose}
              className="text-slate-900 hover:underline font-medium text-[11px]"
            >
              My Account
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between uppercase tracking-widest">
            <span>Maison DNORA</span>
            <span>Florence • Milan</span>
          </div>
        </div>
      </aside>
    </>
  );
}
