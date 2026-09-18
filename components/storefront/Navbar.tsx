"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag, User, LogOut, Package, MapPin, ChevronDown } from "lucide-react";
import { useCart } from "@/lib/store/cart-store";
import { Product, ProductCategory } from "@/types";
import { UserSession } from "@/lib/auth/user-session";
import { SearchModal } from "./SearchModal";
import { MemberDrawer } from "./MemberDrawer";
import { BrandLogo } from "@/components/ui/BrandLogo";

interface NavbarProps {
  products?: Product[];
  user?: UserSession | null;
}

export function Navbar({ products = [], user = null }: NavbarProps) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const { openCart, itemCount } = useCart();

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setCategories(json.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 bg-white/95 backdrop-blur-md border-b border-[#E8E5DE] ${
          isScrolled ? "shadow-xs py-3" : "py-3.5 sm:py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-[42px]">
            {/* LEFT: Mobile 3-Line Hamburger Menu + Logo */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* 3-line hamburger menu for Mobile view ONLY */}
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open navigation menu"
                className="p-2 -ml-2 text-[#0E0E0E] hover:text-[#73706A] transition-colors lg:hidden cursor-pointer"
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

              {/* Store Brand Logo - Scaled to a clean refined size */}
              <BrandLogo priority size="md" />
            </div>

            {/* CENTER: Desktop / Laptop Horizontal Navigation Bar with Hover Submenus */}
            <nav
              className="hidden lg:flex items-center space-x-7"
              aria-label="Storefront Desktop Navigation"
            >
              {/* Home */}
              <Link
                href="/"
                className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#0E0E0E] hover:text-[#73706A] transition-colors py-2 relative group"
              >
                <span>Home</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0E0E0E] group-hover:w-full transition-all duration-300" />
              </Link>

              {/* Shop with Dropdown */}
              <div className="relative group py-2">
                <Link
                  href="/shop"
                  className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.22em] text-[#0E0E0E] group-hover:text-[#73706A] transition-colors"
                >
                  <span>Shop</span>
                  <ChevronDown className="w-3 h-3 text-[#73706A] group-hover:rotate-180 transition-transform duration-200" />
                </Link>
                <div className="absolute top-full -left-4 pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                  <div className="w-56 bg-white border border-[#E8E5DE] rounded-sm shadow-xl py-2">
                    <div className="px-3.5 py-1.5 border-b border-[#E8E5DE]/70 text-[9px] uppercase tracking-widest text-[#0E0E0E] font-bold">
                      Collections
                    </div>
                    <Link
                      href="/shop"
                      className="block px-3.5 py-2 text-xs text-[#0E0E0E] hover:bg-[#FAF9F6] hover:text-[#73706A] transition-colors"
                    >
                      All Handbags & Purses
                    </Link>
                    <Link
                      href="/#best-sellers"
                      className="flex items-center justify-between px-3.5 py-2 text-xs text-[#0E0E0E] hover:bg-[#FAF9F6] hover:text-[#73706A] transition-colors"
                    >
                      <span>Best Sellers</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-[#0E0E0E] text-[#FAF9F6] font-bold tracking-wider uppercase rounded-xs">
                        Hot
                      </span>
                    </Link>
                    <Link
                      href="/#new-arrivals"
                      className="flex items-center justify-between px-3.5 py-2 text-xs text-[#0E0E0E] hover:bg-[#FAF9F6] hover:text-[#73706A] transition-colors"
                    >
                      <span>New Arrivals</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-[#0E0E0E] text-[#0E0E0E] font-bold tracking-wider uppercase rounded-xs">
                        New
                      </span>
                    </Link>
                    <Link
                      href="/#categories"
                      className="block px-3.5 py-2 text-xs text-[#0E0E0E] hover:bg-[#FAF9F6] hover:text-[#73706A] transition-colors"
                    >
                      Shop by Silhouette
                    </Link>
                  </div>
                </div>
              </div>

              {/* Categories with Dropdown */}
              <div className="relative group py-2">
                <Link
                  href="/#categories"
                  className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.22em] text-[#0E0E0E] group-hover:text-[#73706A] transition-colors"
                >
                  <span>Categories</span>
                  <ChevronDown className="w-3 h-3 text-[#73706A] group-hover:rotate-180 transition-transform duration-200" />
                </Link>
                <div className="absolute top-full -left-6 pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                  <div className="w-56 bg-white border border-[#E8E5DE] rounded-sm shadow-xl py-2">
                    <div className="px-3.5 py-1.5 border-b border-[#E8E5DE]/70 text-[9px] uppercase tracking-widest text-[#0E0E0E] font-bold">
                      All Categories
                    </div>
                    {categories.length > 0 ? (
                      categories.slice(0, 6).map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/category/${cat.slug}`}
                          className="block px-3.5 py-2 text-xs text-[#0E0E0E] hover:bg-[#FAF9F6] hover:text-[#73706A] transition-colors"
                        >
                          {cat.name}
                        </Link>
                      ))
                    ) : (
                      <>
                        <Link
                          href="/category/tote-bags"
                          className="block px-3.5 py-2 text-xs text-[#0E0E0E] hover:bg-[#FAF9F6] hover:text-[#73706A] transition-colors"
                        >
                          Tote Bags
                        </Link>
                        <Link
                          href="/category/shoulder-bags"
                          className="block px-3.5 py-2 text-xs text-[#0E0E0E] hover:bg-[#FAF9F6] hover:text-[#73706A] transition-colors"
                        >
                          Shoulder Bags
                        </Link>
                        <Link
                          href="/category/crossbody-bags"
                          className="block px-3.5 py-2 text-xs text-[#0E0E0E] hover:bg-[#FAF9F6] hover:text-[#73706A] transition-colors"
                        >
                          Crossbody Bags
                        </Link>
                        <Link
                          href="/category/handbags"
                          className="block px-3.5 py-2 text-xs text-[#0E0E0E] hover:bg-[#FAF9F6] hover:text-[#73706A] transition-colors"
                        >
                          Handbags
                        </Link>
                      </>
                    )}
                    <div className="border-t border-[#E8E5DE]/70 mt-1 pt-1">
                      <Link
                        href="/#categories"
                        className="block px-3.5 py-1.5 text-[11px] font-semibold text-[#8F7449] hover:underline"
                      >
                        Explore All Categories →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* New Arrivals with Dropdown */}
              <div className="relative group py-2">
                <Link
                  href="/#new-arrivals"
                  className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.22em] text-[#0E0E0E] group-hover:text-[#73706A] transition-colors"
                >
                  <span>New Arrivals</span>
                  <ChevronDown className="w-3 h-3 text-[#73706A] group-hover:rotate-180 transition-transform duration-200" />
                </Link>
                <div className="absolute top-full -left-4 pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                  <div className="w-52 bg-white border border-[#E8E5DE] rounded-sm shadow-xl py-2">
                    <div className="px-3.5 py-1.5 border-b border-[#E8E5DE]/70 text-[9px] uppercase tracking-widest text-[#0E0E0E] font-bold">
                      Latest Edits
                    </div>
                    <Link
                      href="/shop?new_arrival=true"
                      className="block px-3.5 py-2 text-xs text-[#0E0E0E] hover:bg-[#FAF9F6] hover:text-[#73706A] transition-colors"
                    >
                      Spring / Summer 2026
                    </Link>
                    <Link
                      href="/#new-arrivals"
                      className="block px-3.5 py-2 text-xs text-[#0E0E0E] hover:bg-[#FAF9F6] hover:text-[#73706A] transition-colors"
                    >
                      Featured Releases
                    </Link>
                    <Link
                      href="/shop"
                      className="block px-3.5 py-2 text-xs text-[#0E0E0E] hover:bg-[#FAF9F6] hover:text-[#73706A] transition-colors"
                    >
                      Runway Atelier Pieces
                    </Link>
                  </div>
                </div>
              </div>

              {/* Best Sellers with Dropdown */}
              <div className="relative group py-2">
                <Link
                  href="/#best-sellers"
                  className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.22em] text-[#0E0E0E] group-hover:text-[#73706A] transition-colors"
                >
                  <span>Best Sellers</span>
                  <ChevronDown className="w-3 h-3 text-[#73706A] group-hover:rotate-180 transition-transform duration-200" />
                </Link>
                <div className="absolute top-full -right-4 pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                  <div className="w-52 bg-white border border-[#E8E5DE] rounded-sm shadow-xl py-2">
                    <div className="px-3.5 py-1.5 border-b border-[#E8E5DE]/70 text-[9px] uppercase tracking-widest text-[#0E0E0E] font-bold">
                      Signature Icons
                    </div>
                    <Link
                      href="/#best-sellers"
                      className="block px-3.5 py-2 text-xs text-[#0E0E0E] hover:bg-[#FAF9F6] hover:text-[#73706A] transition-colors"
                    >
                      Top Rated Silhouettes
                    </Link>
                    <Link
                      href="/shop?best_seller=true"
                      className="block px-3.5 py-2 text-xs text-[#0E0E0E] hover:bg-[#FAF9F6] hover:text-[#73706A] transition-colors"
                    >
                      Iconic Italian Calfskin
                    </Link>
                    <Link
                      href="/shop"
                      className="block px-3.5 py-2 text-xs text-[#0E0E0E] hover:bg-[#FAF9F6] hover:text-[#73706A] transition-colors"
                    >
                      All Bestselling Bags
                    </Link>
                  </div>
                </div>
              </div>
            </nav>

            {/* RIGHT: Sequential Action Icons (Search, Account, Shopping Bag) */}
            <div className="flex items-center space-x-1 sm:space-x-3">
              {/* 1. Search */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search handbags"
                className="p-2 text-[#0E0E0E] hover:text-[#73706A] transition-colors"
                title="Search"
              >
                <Search className="w-5 h-5" strokeWidth={1.75} />
              </button>

              {/* 2. Account (No admin links, purely customer session) */}
              <div className="relative">
                {user ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="p-2 text-[#0E0E0E] hover:text-[#73706A] transition-colors relative flex items-center"
                      aria-label="Client Account"
                      title={user.full_name || user.email}
                    >
                      <User className="w-5 h-5" strokeWidth={1.75} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0E0E0E] absolute top-1.5 right-1.5" />
                    </button>

                    {userDropdownOpen && (
                      <div
                        onMouseLeave={() => setUserDropdownOpen(false)}
                        className="absolute right-0 mt-2 w-56 bg-white border border-[#E8E5DE] rounded-sm shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                      >
                        <div className="px-4 py-2 border-b border-[#E8E5DE]">
                          <span className="text-[10px] uppercase tracking-widest text-[#0E0E0E] font-bold block">
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
                          <Package className="w-3.5 h-3.5 text-[#0E0E0E]" />
                          <span>My Orders & Tracking</span>
                        </Link>

                        <Link
                          href="/account"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#0E0E0E] hover:bg-[#FAF9F6] font-medium transition-colors"
                        >
                          <MapPin className="w-3.5 h-3.5 text-[#0E0E0E]" />
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
                    className="p-2 text-[#0E0E0E] hover:text-[#73706A] transition-colors inline-flex"
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
                className="p-2 text-[#0E0E0E] hover:text-[#73706A] transition-colors relative"
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

      {/* Luxury Member & Storefront Navigation Drawer (For Mobile Screen View) */}
      <MemberDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={user}
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
