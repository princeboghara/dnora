"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  ChevronDown,
  Sliders,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { SidebarMenuItem } from "@/types";
import { DEFAULT_SIDEBAR_ITEMS } from "@/lib/sidebar-constants";
import { SidebarCustomizerModal, ICON_MAP } from "@/components/admin/SidebarCustomizerModal";

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  customizerOpen?: boolean;
  onOpenCustomizer?: () => void;
  onCloseCustomizer?: () => void;
}

export function AdminSidebar({
  mobileOpen = false,
  onCloseMobile,
  customizerOpen: controlledCustomizerOpen,
  onOpenCustomizer,
  onCloseCustomizer,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [items, setItems] = useState<SidebarMenuItem[]>(DEFAULT_SIDEBAR_ITEMS);
  const [loading, setLoading] = useState(true);
  const [internalCustomizerOpen, setInternalCustomizerOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const isCustomizerOpen =
    controlledCustomizerOpen !== undefined
      ? controlledCustomizerOpen
      : internalCustomizerOpen;

  const handleOpenCustomizer = () => {
    if (onOpenCustomizer) {
      onOpenCustomizer();
    } else {
      setInternalCustomizerOpen(true);
    }
  };

  const handleCloseCustomizer = () => {
    if (onCloseCustomizer) {
      onCloseCustomizer();
    } else {
      setInternalCustomizerOpen(false);
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

  // Auto-expand submenus if the current route matches any submenu
  useEffect(() => {
    if (!items || items.length === 0) return;

    setExpandedMenus((prev) => {
      const next = { ...prev };
      items.forEach((item) => {
        if (item.submenus && item.submenus.length > 0) {
          const hasActiveSub = item.submenus.some(
            (sub) => sub.href === pathname || pathname.startsWith(sub.href + "?")
          );
          const isParentActive =
            item.href && item.href !== "/admin" && pathname.startsWith(item.href);

          if (hasActiveSub || isParentActive) {
            next[item.id] = true;
          }
        }
      });
      return next;
    });
  }, [pathname, items]);

  // Toggle submenu expansion
  const toggleSubmenu = (itemId: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  return (
    <>
      {/* Mobile Backdrop with smooth fade */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      {/* Sidebar Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-[#0E0E0E] text-[#FAF9F6] border-r border-[#242321] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl lg:shadow-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#242321] shrink-0">
            <div className="flex items-center gap-2">
              <BrandLogo size="sm" href="/admin" />
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#C5A880]/20 text-[#C5A880]">
                Admin
              </span>
            </div>
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-[#73706A] hover:text-white hover:bg-[#1C1B1A] transition-colors lg:hidden"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Links Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            <div>
              <div className="flex items-center justify-between px-3 mb-2.5">
                <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#73706A]">
                  Navigation
                </p>
                {loading && (
                  <Loader2 className="w-3 h-3 text-[#73706A] animate-spin" />
                )}
              </div>

              <nav className="space-y-1">
                {items.map((item) => {
                  const hasSubmenus =
                    Array.isArray(item.submenus) && item.submenus.length > 0;
                  const isExpanded = !!expandedMenus[item.id];

                  // Active state calculation
                  const isDirectActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : item.href
                      ? pathname.startsWith(item.href)
                      : false;

                  const isAnySubActive =
                    hasSubmenus &&
                    item.submenus!.some(
                      (sub) =>
                        sub.href === pathname ||
                        pathname.startsWith(sub.href + "?")
                    );

                  const isActive = isDirectActive || isAnySubActive;
                  const IconComp = ICON_MAP[item.icon] || Sliders;

                  return (
                    <div key={item.id} className="relative select-none">
                      {/* Parent Menu Row */}
                      <div
                        className={cn(
                          "group flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all duration-200",
                          isActive
                            ? "bg-[#FAF9F6] text-[#0E0E0E] shadow-sm"
                            : "text-[#A8A49C] hover:bg-[#1C1B1A] hover:text-[#FAF9F6]"
                        )}
                      >
                        {/* Left clickable element */}
                        {item.href ? (
                          <Link
                            href={item.href}
                            onClick={() => {
                              if (hasSubmenus && !isExpanded) {
                                toggleSubmenu(item.id);
                              }
                              if (onCloseMobile) onCloseMobile();
                            }}
                            className="flex items-center gap-3 flex-1 min-w-0"
                          >
                            <IconComp
                              className={cn(
                                "w-4 h-4 shrink-0 transition-colors",
                                isActive
                                  ? "text-[#0E0E0E]"
                                  : "text-[#73706A] group-hover:text-[#C5A880]"
                              )}
                            />
                            <span className="truncate">{item.label}</span>
                            {item.badge && (
                              <span
                                className={cn(
                                  "text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold shrink-0",
                                  isActive
                                    ? "bg-[#0E0E0E] text-[#FAF9F6]"
                                    : "bg-[#242321] text-[#A8A49C]"
                                )}
                              >
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleSubmenu(item.id)}
                            className="flex items-center gap-3 flex-1 min-w-0 text-left"
                          >
                            <IconComp
                              className={cn(
                                "w-4 h-4 shrink-0 transition-colors",
                                isActive
                                  ? "text-[#0E0E0E]"
                                  : "text-[#73706A] group-hover:text-[#C5A880]"
                              )}
                            />
                            <span className="truncate">{item.label}</span>
                            {item.badge && (
                              <span
                                className={cn(
                                  "text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold shrink-0",
                                  isActive
                                    ? "bg-[#0E0E0E] text-[#FAF9F6]"
                                    : "bg-[#242321] text-[#A8A49C]"
                                )}
                              >
                                {item.badge}
                              </span>
                            )}
                          </button>
                        )}

                        {/* Right Toggle Button for Submenus */}
                        {hasSubmenus && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleSubmenu(item.id);
                            }}
                            className={cn(
                              "p-1 rounded transition-colors ml-1",
                              isActive
                                ? "text-[#0E0E0E] hover:bg-black/10"
                                : "text-[#73706A] hover:text-[#FAF9F6] hover:bg-[#242321]"
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

                      {/* Smooth Collapsible Nested Submenus Accordion */}
                      {hasSubmenus && (
                        <div
                          className={cn(
                            "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out overflow-hidden",
                            isExpanded
                              ? "grid-rows-[1fr] opacity-100 mt-1"
                              : "grid-rows-[0fr] opacity-0 pointer-events-none"
                          )}
                        >
                          <div className="overflow-hidden space-y-0.5 pl-7 pr-1">
                            {item.submenus!.map((sub) => {
                              const isSubActive =
                                pathname === sub.href ||
                                (sub.href !== "/admin" &&
                                  pathname.startsWith(sub.href + "?"));

                              return (
                                <Link
                                  key={sub.id}
                                  href={sub.href}
                                  onClick={onCloseMobile}
                                  className={cn(
                                    "flex items-center justify-between px-3 py-1.5 rounded-md text-[11px] font-medium transition-all duration-200",
                                    isSubActive
                                      ? "bg-[#C5A880]/20 text-[#C5A880] font-semibold"
                                      : "text-[#A8A49C] hover:text-[#FAF9F6] hover:bg-[#1C1B1A]"
                                  )}
                                >
                                  <span className="truncate">{sub.label}</span>
                                  {sub.badge && (
                                    <span className="text-[9px] uppercase tracking-wider bg-[#1C1B1A] px-1.5 py-0.5 rounded text-[#73706A]">
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
        </div>

        {/* Bottom Actions Area */}
        <div className="p-4 border-t border-[#242321] space-y-2 shrink-0 bg-[#0E0E0E]">
          {/* Edit Sidebar Navigation Button */}
          <button
            type="button"
            onClick={handleOpenCustomizer}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-semibold text-[#A8A49C] hover:text-[#FAF9F6] hover:bg-[#1C1B1A] border border-[#242321] hover:border-[#383633] transition-all group"
          >
            <span className="flex items-center gap-2.5">
              <Sliders className="w-4 h-4 text-[#C5A880] group-hover:rotate-45 transition-transform duration-300" />
              <span>Edit Sidebar</span>
            </span>
            <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#1C1B1A] text-[#73706A] group-hover:text-[#A8A49C]">
              Customize
            </span>
          </button>

          {/* View Live Store */}
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold text-[#73706A] hover:text-[#FAF9F6] hover:bg-[#1C1B1A] transition-all"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Live Store</span>
            </span>
          </Link>
        </div>
      </aside>

      {/* Sidebar Customizer Modal */}
      <SidebarCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={handleCloseCustomizer}
        items={items}
        onSaveSuccess={(updatedItems) => {
          setItems(updatedItems);
        }}
      />
    </>
  );
}
