"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search, ShoppingBag, User, LogOut, Package, MapPin, ChevronDown } from "lucide-react";
import { useCart } from "@/lib/store/cart-store";
import { Product, ProductCategory, SidebarMenuItem } from "@/types";
import { UserSession } from "@/lib/auth/user-session";
import { DEFAULT_STOREFRONT_NAVIGATION } from "@/lib/navigation-constants";
import { cn } from "@/lib/utils";
import { SearchModal } from "./SearchModal";
import { MemberDrawer } from "./MemberDrawer";
import { BrandLogo } from "@/components/ui/BrandLogo";

interface NavbarProps {
  products?: Product[];
  user?: UserSession | null;
  initialNavItems?: SidebarMenuItem[];
}

export function Navbar({ products = [], user = null, initialNavItems }: NavbarProps) {
  const router = useRouter();
  const rawPathname = usePathname();
  const pathname = rawPathname || "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [navItems, setNavItems] = useState<SidebarMenuItem[]>(() => {
    if (Array.isArray(initialNavItems) && initialNavItems.length > 0) {
      return initialNavItems;
    }
    return DEFAULT_STOREFRONT_NAVIGATION;
  });
  const { openCart, itemCount } = useCart();

  // Sync with initialNavItems when received from layout
  useEffect(() => {
    if (Array.isArray(initialNavItems) && initialNavItems.length > 0) {
      setNavItems(initialNavItems);
    }
  }, [initialNavItems]);

  // Real-time synchronization with dynamic storefront navigation API
  useEffect(() => {
    let isMounted = true;
    fetch("/api/navigation?target=storefront")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && Array.isArray(data?.items) && data.items.length > 0) {
          setNavItems(data.items);
        }
      })
      .catch((err) => {
        console.error("Error synchronizing storefront navigation in Navbar:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Sticky header shadow on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Defensive fallback: Always ensure we have active navigation items to render
  const safeNavItems = (
    Array.isArray(navItems) && navItems.length > 0
      ? navItems
      : DEFAULT_STOREFRONT_NAVIGATION
  ).filter((item) => item && item.is_active !== false);

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 bg-white/95 backdrop-blur-md border-b border-[#E8E5DE] ${
          isScrolled ? "shadow-xs py-2.5 sm:py-3" : "py-3 sm:py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-[42px] gap-2 lg:gap-4">
            {/* LEFT: Mobile 3-Line Hamburger Menu + Brand Logo */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* 3-line hamburger menu for Mobile view (< 768px) */}
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open navigation menu"
                className="p-2 -ml-2 text-[#0E0E0E] hover:text-[#C5A880] transition-colors md:hidden cursor-pointer"
              >
                <svg
                  className="w-6 h-6 transition-transform duration-200 hover:scale-105"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>

              {/* Store Brand Logo */}
              <BrandLogo priority size="md" />
            </div>

            {/* CENTER: Desktop / Laptop Horizontal Navigation Bar */}
            <nav
              className="hidden md:flex items-center justify-center gap-2.5 md:gap-4 lg:gap-6 xl:gap-8 flex-1 min-w-0 px-1"
              aria-label="Storefront Desktop Navigation"
            >
              {safeNavItems.map((item) => {
                const hasSubmenus =
                  Array.isArray(item.submenus) && item.submenus.length > 0;
                const isDirectActive =
                  item.href === "/"
                    ? pathname === "/"
                    : Boolean(item.href && item.href !== "#" && pathname.startsWith(item.href));
                const isAnySubActive =
                  hasSubmenus &&
                  item.submenus!.some(
                    (sub) =>
                      Boolean(
                        sub &&
                          sub.href &&
                          (sub.href === pathname ||
                            (sub.href !== "/" &&
                              sub.href !== "#" &&
                              pathname.startsWith(sub.href)))
                      )
                  );
                const isActive = Boolean(isDirectActive || isAnySubActive);

                // Simple item without submenus
                if (!hasSubmenus) {
                  return (
                    <Link
                      key={item.id}
                      href={item.href || "/"}
                      className={cn(
                        "text-[10px] md:text-[11px] font-bold uppercase tracking-[0.14em] md:tracking-[0.18em] lg:tracking-[0.2em] transition-colors py-2 relative group flex items-center gap-1 shrink-0 whitespace-nowrap",
                        isActive
                          ? "text-[#0E0E0E]"
                          : "text-[#4A4744] hover:text-[#0E0E0E]"
                      )}
                    >
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="text-[8px] md:text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded font-bold bg-[#C5A880]/20 text-[#8F7449]">
                          {item.badge}
                        </span>
                      )}
                      <span
                        className={cn(
                          "absolute bottom-0 left-0 h-0.5 bg-[#0E0E0E] transition-all duration-300",
                          isActive ? "w-full" : "w-0 group-hover:w-full"
                        )}
                      />
                    </Link>
                  );
                }

                // Item with submenus -> Dropdown
                return (
                  <div key={item.id} className="relative group py-2 shrink-0">
                    <Link
                      href={item.href || "#"}
                      className={cn(
                        "flex items-center gap-1 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.14em] md:tracking-[0.18em] lg:tracking-[0.2em] transition-colors whitespace-nowrap",
                        isActive
                          ? "text-[#0E0E0E]"
                          : "text-[#4A4744] group-hover:text-[#0E0E0E]"
                      )}
                    >
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="text-[8px] md:text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded font-bold bg-[#C5A880]/20 text-[#8F7449]">
                          {item.badge}
                        </span>
                      )}
                      <ChevronDown className="w-3 h-3 text-[#73706A] group-hover:rotate-180 transition-transform duration-200 shrink-0" />
                    </Link>

                    {/* Dropdown Menu */}
                    <div className="absolute top-full -left-4 pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                      <div className="min-w-[14rem] max-w-xs bg-white border border-[#E8E5DE] rounded-sm shadow-xl py-2">
                        <div className="px-3.5 py-1.5 border-b border-[#E8E5DE]/70 text-[9px] uppercase tracking-widest text-[#C5A880] font-bold">
                          {item.label}
                        </div>
                        {item.submenus!
                          .filter((sub) => sub && sub.is_active !== false)
                          .map((sub) => (
                            <Link
                              key={sub.id || sub.href}
                              href={sub.href || "#"}
                              className="flex items-center justify-between px-3.5 py-2 text-xs text-[#0E0E0E] hover:bg-[#FAF9F6] hover:text-[#C5A880] transition-colors"
                            >
                              <span>{sub.label}</span>
                              {sub.badge && (
                                <span
                                  className={cn(
                                    "text-[9px] px-1.5 py-0.5 font-bold tracking-wider uppercase rounded-xs",
                                    sub.badge.toLowerCase() === "hot"
                                      ? "bg-[#0E0E0E] text-[#FAF9F6]"
                                      : "bg-[#C5A880] text-[#0E0E0E]"
                                  )}
                                >
                                  {sub.badge}
                                </span>
                              )}
                            </Link>
                          ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </nav>

            {/* RIGHT: Sequential Action Icons (Search, Account, Shopping Bag) */}
            <div className="flex items-center space-x-1 sm:space-x-3">
              {/* 1. Search */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search handbags"
                className="p-2 text-[#0E0E0E] hover:text-[#C5A880] transition-colors"
                title="Search"
              >
                <Search className="w-5 h-5" strokeWidth={1.75} />
              </button>

              {/* 2. Account */}
              <div className="relative">
                {user ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="p-2 text-[#0E0E0E] hover:text-[#C5A880] transition-colors relative flex items-center"
                      aria-label="Client Account"
                      title={user.full_name || user.email}
                    >
                      <User className="w-5 h-5" strokeWidth={1.75} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] absolute top-1.5 right-1.5" />
                    </button>

                    {userDropdownOpen && (
                      <div
                        onMouseLeave={() => setUserDropdownOpen(false)}
                        className="absolute right-0 mt-2 w-56 bg-white border border-[#E8E5DE] rounded-sm shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                      >
                        <div className="px-4 py-2 border-b border-[#E8E5DE]">
                          <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-bold block">
                            Client Account
                          </span>
                          <span className="text-xs font-bold text-[#0E0E0E] truncate block mt-0.5">
                            {user.full_name || user.email.split("@")[0]}
                          </span>
                          <span className="text-[11px] text-[#73706A] truncate block">
                            {user.email}
                          </span>
                        </div>

                        <Link
                          href="/account"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#0E0E0E] hover:bg-[#FAF9F6] font-medium transition-colors"
                        >
                          <Package className="w-3.5 h-3.5 text-[#C5A880]" />
                          <span>My Orders & Tracking</span>
                        </Link>

                        <Link
                          href="/account"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#0E0E0E] hover:bg-[#FAF9F6] font-medium transition-colors"
                        >
                          <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                          <span>Saved Addresses</span>
                        </Link>

                        <div className="pt-1 border-t border-[#E8E5DE]">
                          <button
                            type="button"
                            onClick={async () => {
                              setUserDropdownOpen(false);
                              try {
                                await fetch("/api/auth/logout", { method: "POST" });
                              } catch (err) {
                                console.error("Logout error:", err);
                              } finally {
                                router.push("/");
                                router.refresh();
                              }
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-[#C53030] hover:bg-[#FCF0F0] font-medium transition-colors"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/login"
                    aria-label="Client Sign In"
                    className="p-2 text-[#0E0E0E] hover:text-[#C5A880] transition-colors inline-flex"
                    title="Sign In / Register"
                  >
                    <User className="w-5 h-5" strokeWidth={1.75} />
                  </Link>
                )}
              </div>

              {/* 3. Shopping Bag / Cart */}
              <button
                type="button"
                onClick={openCart}
                aria-label="View shopping bag"
                className="p-2 text-[#0E0E0E] hover:text-[#C5A880] transition-colors relative"
                title="Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5" strokeWidth={1.75} />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#0E0E0E] text-[#FAF9F6] text-[10px] font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Luxury Member & Storefront Navigation Drawer (Mobile screen view) */}
      <MemberDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={user}
        items={navItems}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        products={products}
      />
    </>
  );
}
