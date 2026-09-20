"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  X,
  ChevronDown,
  Sliders,
  LogOut,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { SidebarMenuItem } from "@/types";
import { DEFAULT_SIDEBAR_ITEMS } from "@/lib/sidebar-constants";
import { SidebarCustomizerModal, ICON_MAP } from "@/components/admin/SidebarCustomizerModal";
import { useToast } from "@/components/ui/Toast";

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  customizerOpen?: boolean;
  onOpenCustomizer?: () => void;
  onCloseCustomizer?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AdminSidebar({
  mobileOpen = false,
  onCloseMobile,
  customizerOpen: controlledCustomizerOpen,
  onCloseCustomizer,
  collapsed = false,
  onToggleCollapse,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { info } = useToast();
  const [items, setItems] = useState<SidebarMenuItem[]>(DEFAULT_SIDEBAR_ITEMS);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [internalCustomizerOpen, setInternalCustomizerOpen] = useState(false);
  const [userExpandedOverrides, setUserExpandedOverrides] = useState<Record<string, boolean>>({});
  const [hoveredMenuId, setHoveredMenuId] = useState<string | null>(null);

  const isCustomizerOpen =
    controlledCustomizerOpen !== undefined
      ? controlledCustomizerOpen
      : internalCustomizerOpen;

  const handleCloseCustomizer = () => {
    if (onCloseCustomizer) {
      onCloseCustomizer();
    } else {
      setInternalCustomizerOpen(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      info("Logged out of DNORA Admin.");
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    } finally {
      setLoggingOut(false);
    }
  };

  // Fetch navigation items from API on mount
  useEffect(() => {
    let isMounted = true;
    async function loadSidebarConfig() {
      try {
        const res = await fetch("/api/admin/sidebar");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data.items) && data.items.length > 0) {
            setItems(data.items);
          }
        }
      } catch (err) {
        console.error("Failed to load sidebar configuration:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSidebarConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleSubmenu = (itemId: string, currentState: boolean) => {
    setUserExpandedOverrides((prev) => ({
      ...prev,
      [itemId]: !currentState,
    }));
  };

  return (
    <>
      {/* Mobile Backdrop with soft smooth blur */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-xs transition-opacity duration-300 md:hidden",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      {/* Modern Soft 3D Smooth Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-white text-[#0F172A] border-r border-slate-200/80 flex flex-col justify-between transition-all duration-300 ease-in-out md:translate-x-0 shadow-[4px_0_24px_rgba(15,23,42,0.03)]",
          collapsed ? "md:w-20 w-64" : "w-64",
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        {/* Floating Edge Toggle Pill (Visible on md/laptop and up) */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden md:flex absolute -right-3.5 top-16 z-50 w-7 h-7 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-full shadow-[0_2px_8px_rgba(15,23,42,0.12)] items-center justify-center text-slate-600 hover:text-indigo-600 active:scale-95 transition-all cursor-pointer"
          >
            {collapsed ? (
              <PanelLeftOpen className="w-3.5 h-3.5 text-indigo-600" />
            ) : (
              <PanelLeftClose className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>
        )}

        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand Header */}
          <div
            className={cn(
              "flex items-center justify-between border-b border-slate-200/80 shrink-0 bg-white transition-all duration-300",
              collapsed ? "px-2.5 py-4 flex-col gap-2" : "px-5 py-4"
            )}
          >
            <div className={cn("flex items-center gap-2.5 min-w-0", collapsed ? "mx-auto" : "")}>
              <BrandLogo size="sm" href="/admin" />
              {!collapsed && (
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 shadow-2xs shrink-0">
                  Admin
                </span>
              )}
            </div>

            {/* Laptop & Desktop Collapse / Expand Toggle on header */}
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                title={collapsed ? "Expand sidebar" : "Collapse to icon-only mode"}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                className={cn(
                  "hidden md:flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer",
                  collapsed ? "p-1.5 bg-slate-50 border border-slate-200 text-indigo-600 mt-1" : "p-1.5"
                )}
              >
                {collapsed ? (
                  <PanelLeftOpen className="w-4 h-4 text-indigo-600" />
                ) : (
                  <PanelLeftClose className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Mobile close button */}
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors md:hidden"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Items Scrollable Area */}
          <div
            className={cn(
              "flex-1 overflow-y-auto py-4 space-y-4 custom-scrollbar transition-all duration-300",
              collapsed ? "px-2" : "px-3.5"
            )}
          >
            <div>
              {!collapsed ? (
                <div className="flex items-center justify-between px-3 mb-2.5">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 select-none">
                    Navigation
                  </p>
                  {loading && (
                    <Loader2 className="w-3 h-3 text-slate-400 animate-spin" />
                  )}
                </div>
              ) : (
                <div className="flex justify-center mb-2.5">
                  {loading && (
                    <Loader2 className="w-3 h-3 text-slate-400 animate-spin" />
                  )}
                </div>
              )}

              <nav className="space-y-1.5">
                {items.map((item) => {
                  const hasSubmenus =
                    Array.isArray(item.submenus) && item.submenus.length > 0;

                  // Active state calculation
                  const isDirectActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : item.href && item.href !== "/" && !hasSubmenus
                      ? pathname === item.href || pathname.startsWith(item.href)
                      : false;

                  const isAnySubActive =
                    hasSubmenus &&
                    item.submenus!.some(
                      (sub) =>
                        sub.href === pathname ||
                        pathname.startsWith(sub.href + "?") ||
                        (item.id === "nav-customization" &&
                          (pathname.startsWith("/admin/customization") ||
                            pathname.startsWith("/admin/custmoization")))
                    );

                  const isActive = isDirectActive || isAnySubActive;

                  // Default expanded if active, unless user explicitly toggled it
                  const isExpanded =
                    userExpandedOverrides[item.id] !== undefined
                      ? userExpandedOverrides[item.id]
                      : isActive;

                  const IconComp = ICON_MAP[item.icon] || Sliders;
                  const isStorefrontLink = item.href === "/";
                  const isHovered = hoveredMenuId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="relative select-none"
                      onMouseEnter={() => setHoveredMenuId(item.id)}
                      onMouseLeave={() => setHoveredMenuId(null)}
                    >
                      {/* Parent Item Card */}
                      <div
                        className={cn(
                          "group relative flex items-center rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ease-out",
                          collapsed
                            ? "justify-center p-2.5"
                            : "justify-between px-3 py-2.5",
                          isDirectActive
                            ? "bg-[#0F172A] text-white shadow-[0_2px_8px_rgba(15,23,42,0.15),inset_0_1px_0_rgba(255,255,255,0.2)] font-bold"
                            : isActive
                            ? "bg-slate-100 text-[#0F172A] border border-slate-200/90 font-bold shadow-2xs"
                            : "text-slate-600 hover:text-[#0F172A] hover:bg-slate-50/80 active:scale-[0.99]"
                        )}
                      >
                        {/* Clickable Link / Button */}
                        <Link
                          href={item.href || "#"}
                          target={isStorefrontLink ? "_blank" : undefined}
                          onClick={() => {
                            if (hasSubmenus && !collapsed) {
                              toggleSubmenu(item.id, isExpanded);
                            }
                            if (onCloseMobile) onCloseMobile();
                          }}
                          className={cn(
                            "flex items-center min-w-0",
                            collapsed ? "justify-center" : "gap-3 flex-1"
                          )}
                          title={collapsed ? item.label : undefined}
                        >
                          <IconComp
                            className={cn(
                              "w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-105",
                              isDirectActive
                                ? "text-white"
                                : isActive
                                ? "text-indigo-600"
                                : "text-slate-400 group-hover:text-[#0F172A]"
                            )}
                          />
                          {!collapsed && <span className="truncate">{item.label}</span>}
                        </Link>

                        {/* Chevron Submenu Toggle (Only in expanded mode) */}
                        {hasSubmenus && !collapsed && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleSubmenu(item.id, isExpanded);
                            }}
                            className={cn(
                              "p-1 rounded-lg transition-colors ml-1",
                              isDirectActive
                                ? "text-white/80 hover:text-white hover:bg-white/10"
                                : "text-slate-400 hover:text-slate-900 hover:bg-slate-200/50"
                            )}
                            aria-label={
                              isExpanded ? "Collapse submenu" : "Expand submenu"
                            }
                          >
                            <ChevronDown
                              className={cn(
                                "w-3.5 h-3.5 transition-transform duration-300 ease-in-out",
                                isExpanded ? "rotate-180" : "rotate-0"
                              )}
                            />
                          </button>
                        )}
                      </div>

                      {/* COLLAPSED MODE: Floating Tooltip / Submenu Flyout */}
                      {collapsed && isHovered && (
                        <div className="absolute left-full ml-3 top-0 z-50 min-w-48 bg-white border border-slate-200 rounded-2xl p-2 shadow-[0_10px_30px_rgba(15,23,42,0.12)] space-y-1 animate-in fade-in zoom-in-95 duration-150">
                          <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                            {item.label}
                          </div>

                          {hasSubmenus ? (
                            <div className="space-y-0.5 pt-1">
                              {item.submenus!.map((sub) => {
                                const isSubActive =
                                  pathname === sub.href ||
                                  (sub.href.startsWith("/admin/customization") &&
                                    pathname.replace("/admin/custmoization", "/admin/customization") === sub.href);
                                return (
                                  <Link
                                    key={sub.id}
                                    href={sub.href}
                                    onClick={onCloseMobile}
                                    className={cn(
                                      "block px-2.5 py-1.5 rounded-lg text-xs transition-colors",
                                      isSubActive
                                        ? "bg-[#0F172A] text-white font-semibold shadow-xs"
                                        : "text-slate-600 hover:text-slate-950 hover:bg-slate-50 font-medium"
                                    )}
                                  >
                                    {sub.label}
                                  </Link>
                                );
                              })}
                            </div>
                          ) : (
                            <Link
                              href={item.href || "#"}
                              target={isStorefrontLink ? "_blank" : undefined}
                              className="block px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-[#0F172A] hover:bg-slate-50"
                            >
                              Open {item.label} &rarr;
                            </Link>
                          )}
                        </div>
                      )}

                      {/* EXPANDED MODE: Nested Collapsible Submenus */}
                      {hasSubmenus && !collapsed && (
                        <div
                          className={cn(
                            "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out overflow-hidden",
                            isExpanded
                              ? "grid-rows-[1fr] opacity-100 mt-1"
                              : "grid-rows-[0fr] opacity-0 pointer-events-none"
                          )}
                        >
                          <div className="overflow-hidden border-l-2 border-slate-200 ml-5 pl-3.5 my-1 space-y-0.5">
                            {item.submenus!.map((sub) => {
                              const isSubActive =
                                pathname === sub.href ||
                                (sub.href !== "/admin" &&
                                  pathname.startsWith(sub.href + "?")) ||
                                (sub.href.startsWith("/admin/customization") &&
                                  pathname.replace("/admin/custmoization", "/admin/customization") === sub.href);

                              return (
                                <Link
                                  key={sub.id}
                                  href={sub.href}
                                  onClick={onCloseMobile}
                                  className={cn(
                                    "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all duration-150",
                                    isSubActive
                                      ? "bg-[#0F172A] text-white font-semibold shadow-xs"
                                      : "text-slate-500 hover:text-[#0F172A] hover:bg-slate-50 font-medium"
                                  )}
                                >
                                  <span className="truncate">{sub.label}</span>
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
        </div>

        {/* Soft Smooth Bottom Area with Collapse Toggle & Logout */}
        <div
          className={cn(
            "border-t border-slate-200/80 shrink-0 bg-white transition-all duration-300",
            collapsed ? "p-2 space-y-2" : "p-3.5 space-y-2"
          )}
        >
          {/* Collapse / Expand Toggle Button in Bottom Area */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className={cn(
                "w-full hidden md:flex items-center rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/60 transition-all duration-200 cursor-pointer",
                collapsed
                  ? "justify-center p-2"
                  : "justify-between px-3 py-2"
              )}
              title={collapsed ? "Expand sidebar (w-64)" : "Collapse sidebar (icon-only)"}
            >
              <div className="flex items-center gap-2">
                {collapsed ? (
                  <PanelLeftOpen className="w-4 h-4 text-indigo-600" />
                ) : (
                  <>
                    <PanelLeftClose className="w-4 h-4" />
                    <span>Collapse Sidebar</span>
                  </>
                )}
              </div>
              {!collapsed && (
                <span className="text-[9px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                  Mini
                </span>
              )}
            </button>
          )}

          {/* Clean Soft 3D Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className={cn(
              "w-full flex items-center rounded-xl text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200/80 transition-all duration-200 shadow-2xs group cursor-pointer active:scale-98",
              collapsed
                ? "justify-center p-2.5"
                : "justify-center gap-2 px-3 py-2.5"
            )}
            title={collapsed ? "Logout of DNORA Admin" : undefined}
          >
            {loggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin text-rose-500 shrink-0" />
            ) : (
              <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-colors shrink-0" />
            )}
            {!collapsed && <span>{loggingOut ? "Logging Out..." : "Logout"}</span>}
          </button>
        </div>
      </aside>

      {/* Navigation Customizer Modal (for backward compatibility) */}
      <SidebarCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={handleCloseCustomizer}
        items={items}
        initialTarget="admin"
        onSaveSuccess={(updatedItems, target) => {
          if (target === "admin") {
            setItems(updatedItems);
          }
        }}
      />
    </>
  );
}
