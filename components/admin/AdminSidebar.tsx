"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
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
  Sliders,
  Boxes,
  BarChart3,
  Truck,
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
  // 1. Dashboard
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },

  // 2. Items & Stock (/all item /new item /catogories /stock)
  {
    id: "items-stock",
    label: "Items & Stock",
    icon: ShoppingBag,
    subitems: [
      {
        label: "All Items",
        href: "/admin/items",
        icon: ShoppingBag,
        badge: "Catalog",
      },
      {
        label: "Add New Item",
        href: "/admin/products/new",
        icon: PlusCircle,
        badge: "New",
      },
      {
        label: "Categories",
        href: "/admin/categories",
        icon: Tag,
        badge: "Live",
      },
      {
        label: "Stock Management",
        href: "/admin/stock",
        icon: Boxes,
        badge: "Inventory",
      },
    ],
  },

  // 3. Orders & Customers (/all orders /all customers /shipping charge)
  {
    id: "orders-customers",
    label: "Orders & Customers",
    icon: Package,
    subitems: [
      {
        label: "All Orders",
        href: "/admin/orders",
        icon: Package,
        badge: "Live",
      },
      {
        label: "All Customers",
        href: "/admin/customers",
        icon: Users,
        badge: "CRM",
      },
      {
        label: "Shipping Charges",
        href: "/admin/shipping",
        icon: Truck,
        badge: "Live",
      },
      {
        label: "Sales Report",
        href: "/admin/sales-report",
        icon: BarChart3,
        badge: "Report",
      },
    ],
  },

  // 4. Storefront Content (Sorted in top-to-bottom storefront sequence)
  {
    id: "storefront",
    label: "Storefront Content",
    icon: Layers,
    subitems: [
      {
        label: "Announcement Bar",
        href: "/admin/announcements",
        icon: Megaphone,
        badge: "Top",
      },
      {
        label: "Header & Top Bar",
        href: "/admin/topbar",
        icon: Sliders,
      },
      {
        label: "Navigation Menu",
        href: "/admin/navigation",
        icon: Compass,
      },
      {
        label: "Hero Banners",
        href: "/admin/heroes",
        icon: ImageIcon,
        badge: "Main",
      },
      {
        label: "Trending Now",
        href: "/admin/trending-now",
        icon: Sparkles,
        badge: "Lookbook",
      },
      {
        label: "Home Sections",
        href: "/admin/sections",
        icon: LayoutList,
      },
      {
        label: "Campaign Banner",
        href: "/admin/campaign-banner",
        icon: Layers,
      },
      {
        label: "Seen On You (Reels)",
        href: "/admin/seen-on-you",
        icon: Video,
        badge: "Video",
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

  // Real-time live customer / device count on storefront
  const [liveVisitorCount, setLiveVisitorCount] = useState<number>(0);

  const fetchLiveVisitors = async () => {
    // Avoid server requests if tab/browser is minimized or hidden
    if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
    try {
      const res = await fetch("/api/admin/live-visitors");
      if (res.ok) {
        const data = await res.json();
        if (typeof data.count === "number") {
          setLiveVisitorCount(data.count);
        }
      }
    } catch {
      // network resilience
    }
  };

  useEffect(() => {
    fetchLiveVisitors();
    const interval = setInterval(fetchLiveVisitors, 45000); // 45s interval (Safe for Vercel Free Plan)

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchLiveVisitors();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const isChildActive = NAV_GROUPS.find((g) => g.id === groupId)?.subitems?.some(
        (sub) => pathname === sub.href || (sub.href !== "/admin" && pathname.startsWith(sub.href))
      ) ?? false;
      const current = prev[groupId] ?? isChildActive;
      return {
        ...prev,
        [groupId]: !current,
      };
    });
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/admin-logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  };

  const renderSidebarContent = (isMobile: boolean = false) => {
    // Mobile sidebar MUST always be normal (expanded) with full labels and menus
    const isCollapsed = isMobile ? false : collapsed;

    return (
      <div className="flex flex-col h-full bg-[#090D16] text-white border-r border-white/10 select-none">
        {/* Brand Header */}
        <div
          className={`flex items-center h-16 border-b border-white/10 shrink-0 ${
            isCollapsed ? "justify-center px-0" : "justify-between px-4"
          }`}
        >
          <Link
            href="/admin"
            onClick={() => {
              if (isMobile) {
                onCloseMobile();
              } else if (collapsed) {
                onToggleCollapse();
              }
            }}
            className="flex items-center gap-2.5 overflow-hidden"
            title="DNORA Dashboard"
          >
            {/* Brand "D" Icon with live count badge when collapsed on desktop */}
            <div className="relative">
              <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 shadow-md border border-white/10 bg-black flex items-center justify-center">
                <Image
                  src="/images/logo/dnora-d-icon.png"
                  alt="DNORA"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              {isCollapsed && (
                <span
                  className="absolute -top-1.5 -right-2 min-w-[17px] h-[17px] px-1 rounded-full bg-emerald-950 border border-emerald-400 text-white font-mono text-[9px] font-bold flex items-center justify-center shadow-xs z-10"
                  title={`${liveVisitorCount} Live Customers Online`}
                >
                  {liveVisitorCount}
                </span>
              )}
            </div>
            {!isCollapsed && (
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

          {/* Top-Right Header Actions (Live Counter & Mobile Close) */}
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              {/* Top-Right Live Customer Round Badge */}
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  fetchLiveVisitors();
                }}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/60 shadow-xs cursor-pointer select-none hover:border-emerald-400 hover:bg-emerald-900/50 transition-all"
                title={`${liveVisitorCount} Live Customer Device${liveVisitorCount === 1 ? "" : "s"} on Storefront (Click to refresh)`}
              >
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                </span>
                <span className="font-mono font-bold text-xs text-white leading-none">
                  {liveVisitorCount}
                </span>
              </div>

              {/* Mobile close button */}
              {isMobile && (
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Navigation Groups with Menus & Submenus */}
        <div className={`flex-1 overflow-y-auto py-4 space-y-2 scrollbar-none ${isCollapsed ? "px-2" : "px-3"}`}>
          {NAV_GROUPS.map((group) => {
            const Icon = group.icon;
            const isChildActive = group.subitems?.some(
              (sub) => pathname === sub.href || (sub.href !== "/admin" && pathname.startsWith(sub.href))
            ) ?? false;
            const isGroupOpen = expandedGroups[group.id] ?? isChildActive;

            // Case 1: Standalone item (e.g. Dashboard)
            if (!group.subitems || group.subitems.length === 0) {
              const isActive = pathname === group.href;

              return (
                <div key={group.id} className="flex justify-center">
                  {isCollapsed ? (
                    <Link
                      href={group.href || "/admin"}
                      onClick={() => {
                        onToggleCollapse();
                        if (isMobile) onCloseMobile();
                      }}
                      title={group.label}
                      className={`w-11 h-11 flex items-center justify-center rounded-xl text-xs transition-all duration-150 cursor-pointer ${
                        isActive
                          ? "bg-white text-black shadow-md font-bold"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-black" : "text-white/70"}`} />
                    </Link>
                  ) : (
                    <Link
                      href={group.href || "/admin"}
                      onClick={() => {
                        if (isMobile) onCloseMobile();
                      }}
                      title={group.label}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wider transition-all duration-150 ${
                        isActive
                          ? "bg-white text-black shadow-md font-bold"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-black" : "text-white/70"}`} />
                      <span className="flex-1 truncate">{group.label}</span>
                      {group.badge && (
                        <span
                          className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                            isActive
                              ? "bg-black/10 text-black"
                              : "bg-white/10 text-white/70"
                          }`}
                        >
                          {group.badge}
                        </span>
                      )}
                    </Link>
                  )}
                </div>
              );
            }

            // Case 2: Group with Submenus
            return (
              <div key={group.id} className="space-y-1">
                {/* Parent Group Header Button */}
                {isCollapsed ? (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        onToggleCollapse();
                        setExpandedGroups((prev) => ({ ...prev, [group.id]: true }));
                      }}
                      title={group.label}
                      className={`w-11 h-11 flex items-center justify-center rounded-xl text-xs transition-colors cursor-pointer ${
                        isChildActive
                          ? "bg-white/20 text-white font-bold"
                          : "text-white/60 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wider transition-colors cursor-pointer ${
                      isChildActive
                        ? "text-white font-bold bg-white/10"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 opacity-80" />
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
                {!isCollapsed && isGroupOpen && (
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
                          onClick={() => {
                            if (isMobile) onCloseMobile();
                          }}
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
        <div className={`border-t border-white/10 space-y-1.5 shrink-0 ${isCollapsed ? "p-2" : "p-3"}`}>
          {/* Live Storefront Link */}
          <Link
            href="/"
            target="_blank"
            onClick={() => {
              if (isMobile) onCloseMobile();
            }}
            className={`rounded-xl text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center ${
              isCollapsed ? "w-11 h-11 mx-auto justify-center" : "gap-2.5 px-3 py-2"
            }`}
            title={isCollapsed ? "Live Storefront" : undefined}
          >
            <ExternalLink className="w-4 h-4 shrink-0 text-white/60" />
            {!isCollapsed && <span>Live Storefront</span>}
          </Link>

          {/* Sign Out */}
          <button
            type="button"
            onClick={() => {
              if (isMobile) onCloseMobile();
              handleLogout();
            }}
            className={`rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer flex items-center ${
              isCollapsed ? "w-11 h-11 mx-auto justify-center" : "w-full gap-2.5 px-3 py-2"
            }`}
            title={isCollapsed ? "Sign Out" : undefined}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>

          {/* Desktop Collapse Toggle */}
          {!isMobile && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className={`hidden md:flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ${
                isCollapsed ? "w-11 h-11 mx-auto" : "w-full p-1.5"
              }`}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden md:block fixed inset-y-0 left-0 z-30 transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Drawer Overlay - ALWAYS expanded normal view */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-200"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-50">
            {renderSidebarContent(true)}
          </div>
        </div>
      )}
    </>
  );
}

export default AdminSidebar;
