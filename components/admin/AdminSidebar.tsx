"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  ImageIcon,
  Compass,
  ExternalLink,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  ShoppingBag,
  Users,
  PlusCircle,
  Tag,
  LayoutList,
  Video,
  Layers,
  Sparkles,
  Package,
} from "lucide-react";

interface AdminSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavSubItem {
  label: string;
  href: string;
  icon?: React.ElementType;
  badge?: string;
}

interface NavGroupItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  badge?: string;
  subitems?: NavSubItem[];
}

const NAV_GROUPS: NavGroupItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    id: "orders",
    label: "Orders & Shipments",
    href: "/admin/orders",
    icon: Package,
    badge: "Live",
  },
  {
    id: "products",
    label: "Products & Catalog",
    icon: ShoppingBag,
    subitems: [
      {
        label: "All Products",
        href: "/admin/items",
        icon: ShoppingBag,
        badge: "Catalog",
      },
      {
        label: "Add New Product",
        href: "/admin/products/new",
        icon: PlusCircle,
        badge: "New",
      },
      {
        label: "Categories",
        href: "/admin/categories",
        icon: Tag,
        badge: "Our Collections",
      },
    ],
  },
  {
    id: "storefront",
    label: "Storefront & Content",
    icon: Layers,
    subitems: [
      {
        label: "Home Sections",
        href: "/admin/sections",
        icon: LayoutList,
        badge: "Manager",
      },
      {
        label: "Hero Banners",
        href: "/admin/heroes",
        icon: ImageIcon,
        badge: "Media",
      },
      {
        label: "Campaign Banner",
        href: "/admin/campaign-banner",
        icon: Sparkles,
        badge: "Architecture",
      },
      {
        label: "Announcement Bar",
        href: "/admin/announcements",
        icon: Megaphone,
        badge: "Live",
      },
      {
        label: "Trending Now",
        href: "/admin/trending-now",
        icon: Sparkles,
        badge: "Lookbook",
      },
      {
        label: "Seen On You (Reels)",
        href: "/admin/seen-on-you",
        icon: Video,
        badge: "Video",
      },
      {
        label: "Navigation Menu",
        href: "/admin/navigation",
        icon: Compass,
        badge: "Menu",
      },
    ],
  },
  {
    id: "customers",
    label: "Customers & CRM",
    icon: Users,
    subitems: [
      {
        label: "All Customers",
        href: "/admin/customers",
        icon: Users,
        badge: "CRM",
      },
    ],
  },
];

export function AdminSidebar({
  mobileOpen,
  onCloseMobile,
  collapsed,
  onToggleCollapse,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Submenus are CLOSED by default. Only open when user clicks on a parent menu!
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
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

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#090D16] text-white border-r border-white/10 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-white/10 shrink-0">
        <Link href="/admin" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-md bg-white text-black font-extrabold flex items-center justify-center text-sm tracking-wider shrink-0 shadow-md">
            DN
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-[0.2em] uppercase text-white leading-tight">
                DNORA
              </span>
              <span className="text-[10px] text-white/50 tracking-widest uppercase">
                Executive Suite
              </span>
            </div>
          )}
        </Link>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="md:hidden p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Groups with Menus & Submenus */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 scrollbar-none">
        {NAV_GROUPS.map((group) => {
          const Icon = group.icon;
          const isGroupOpen = expandedGroups[group.id] ?? false;

          // Case 1: Standalone item (e.g. Dashboard)
          if (!group.subitems || group.subitems.length === 0) {
            const isActive = pathname === group.href;

            return (
              <div key={group.id}>
                <Link
                  href={group.href || "/admin"}
                  onClick={onCloseMobile}
                  title={collapsed ? group.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wider transition-all duration-150 ${
                    isActive
                      ? "bg-white text-black shadow-md font-bold"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-black" : "text-white/70"}`} />
                  {!collapsed && <span className="flex-1 truncate">{group.label}</span>}
                </Link>
              </div>
            );
          }

          // Case 2: Group with Submenus
          const isChildActive = group.subitems.some(
            (sub) => pathname === sub.href || (sub.href !== "/admin" && pathname.startsWith(sub.href))
          );

          return (
            <div key={group.id} className="space-y-1">
              {/* Parent Group Header Button */}
              {collapsed ? (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  title={group.label}
                  className={`w-full flex items-center justify-center p-2.5 rounded-xl text-xs transition-colors ${
                    isChildActive ? "bg-white/15 text-white" : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    isChildActive
                      ? "text-white font-extrabold bg-white/5"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-3.5 h-3.5 opacity-80" />
                    <span>{group.label}</span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${
                      isGroupOpen ? "rotate-180 opacity-100" : ""
                    }`}
                  />
                </button>
              )}

              {/* Submenu Items */}
              {(!collapsed && isGroupOpen) && (
                <div className="pl-3 space-y-1 pt-0.5 animate-fadeIn">
                  {group.subitems.map((sub) => {
                    const isSubActive =
                      pathname === sub.href ||
                      (sub.href !== "/admin" && pathname.startsWith(sub.href));
                    const SubIcon = sub.icon || Icon;

                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={onCloseMobile}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium tracking-wide transition-all duration-150 ${
                          isSubActive
                            ? "bg-white text-black shadow-xs font-semibold"
                            : "text-white/70 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <SubIcon
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isSubActive ? "text-black" : "text-white/50"
                          }`}
                        />
                        <span className="flex-1 truncate">{sub.label}</span>
                        {sub.badge && (
                          <span
                            className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                              isSubActive
                                ? "bg-black/10 text-black"
                                : "bg-white/10 text-white/70"
                            }`}
                          >
                            {sub.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-3 border-t border-white/10 space-y-1.5 shrink-0">
        {/* Live Storefront Link */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          title={collapsed ? "Live Storefront" : undefined}
        >
          <ExternalLink className="w-4 h-4 shrink-0 text-white/60" />
          {!collapsed && <span>Live Storefront</span>}
        </Link>

        {/* Sign Out */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>

        {/* Desktop Collapse Toggle */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden md:flex w-full items-center justify-center p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden md:block fixed inset-y-0 left-0 z-30 transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 w-64 max-w-[80vw]">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

export default AdminSidebar;
