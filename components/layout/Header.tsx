"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown } from "lucide-react";
import { useCart } from "@/lib/context/cart-context";
import { useWishlist } from "@/lib/context/wishlist-context";
import { useAuth } from "@/lib/auth/auth-context";
import { SearchModal } from "@/components/layout/SearchModal";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";

const NAV_LINKS = [
  {
    name: "Handbags",
    href: "/shop/handbags",
  },
  {
    name: "Tote Bags",
    href: "/shop/tote-bags",
  },
  {
    name: "Sling Bags",
    href: "/shop/sling-bags",
  },
  {
    name: "Satchel Bags",
    href: "/shop/satchels",
  },
  {
    name: "Clutches",
    href: "/shop/clutches",
  },
  {
    name: "Backpacks",
    href: "/shop/backpacks",
  },
  {
    name: "Fragrances",
    href: "/shop/perfumes",
  },
  {
    name: "Best Sellers",
    href: "/shop?filter=bestselling",
  },
  {
    name: "Sale",
    href: "/shop?filter=sale",
  },
];

export function Header() {
  const pathname = usePathname();
  const { openCart, cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAdmin } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <AnnouncementBar />

      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-[#FBF9F5]/90 backdrop-blur-md shadow-sm border-b border-[#E8E2D9] py-3"
            : "bg-[#FBF9F5] border-b border-[#E8E2D9] py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Mobile menu toggle / Desktop search */}
            <div className="flex items-center gap-4 lg:w-1/4">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-1.5 text-[#111111] hover:text-[#C5A880] transition-colors"
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="hidden lg:flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#6E6A64] hover:text-[#111111] transition-colors group"
              >
                <Search className="w-4 h-4 text-[#8C7A6B] group-hover:text-[#111111]" />
                <span className="font-medium">Search Atelier</span>
              </button>
            </div>

            {/* Center: Brand Logo */}
            <div className="text-center lg:w-2/4">
              <Link href="/" className="inline-flex flex-col items-center group py-0.5">
                <img
                  src="/images/logo/dnora-logo-dark.png"
                  alt="DNORA"
                  className="h-7 sm:h-9 lg:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.38em] text-[#8C7A6B] font-medium mt-0.5 group-hover:text-[#C5A880] transition-colors">
                  LUXURY ESSENTIALS
                </span>
              </Link>
            </div>

            {/* Right: Actions (Search mobile, Wishlist, Account, Cart, Admin) */}
            <div className="flex items-center justify-end gap-3 sm:gap-5 lg:w-1/4">
              {/* Mobile search trigger */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="lg:hidden p-1.5 text-[#111111] hover:text-[#C5A880]"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Admin Dashboard shortcut if admin */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="hidden md:inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-wider bg-[#141414] text-[#C5A880] border border-[#C5A880]/30 hover:bg-[#C5A880] hover:text-[#111111] transition-colors"
                >
                  Admin
                </Link>
              )}

              {/* Customer Account */}
              <Link
                href={user ? "/account" : "/account/login"}
                className="p-1.5 text-[#111111] hover:text-[#9E7D4E] transition-colors relative"
                aria-label="Client Account"
                title={user ? `Signed in as ${user.fullName}` : "Client Sign In"}
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="p-1.5 text-[#111111] hover:text-[#9E7D4E] transition-colors relative"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-[#C5A880] text-[#111111] font-sans text-[9px] font-bold flex items-center justify-center rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Drawer Trigger */}
              <button
                type="button"
                onClick={openCart}
                className="p-1.5 text-[#111111] hover:text-[#9E7D4E] transition-colors relative flex items-center gap-1.5"
                aria-label="Shopping Bag"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#141414] text-[#F5F2EB] font-sans text-[9px] font-bold flex items-center justify-center rounded-full">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="hidden xl:inline text-xs font-sans uppercase tracking-[0.15em] text-[#111111]">
                  Bag
                </span>
              </button>
            </div>
          </div>

          {/* Desktop Navigation Row */}
          <nav className="hidden lg:flex items-center justify-center space-x-7 pt-3 mt-2 border-t border-[#E8E2D9]/60">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-[11px] uppercase tracking-[0.22em] font-medium transition-colors duration-200 py-1 relative ${
                    isActive
                      ? "text-[#111111] font-semibold after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-[#111111]"
                      : "text-[#6E6A64] hover:text-[#111111]"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Mobile Slide-Out Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-[#111111]/70 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-[#FBF9F5] border-r border-[#E8E2D9] shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D9]">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="inline-block">
                  <img
                    src="/images/logo/dnora-logo-dark.png"
                    alt="DNORA"
                    className="h-7 w-auto object-contain"
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-[#8C7A6B] hover:text-[#111111]"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2.5 text-sm uppercase tracking-[0.2em] font-medium text-[#111111] hover:text-[#C5A880] border-b border-[#E8E2D9]/40"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              <div className="pt-2 space-y-2 text-xs uppercase tracking-widest text-[#6E6A64]">
                <Link
                  href="/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-1.5 hover:text-[#111111]"
                >
                  Atelier Heritage
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-1.5 hover:text-[#111111]"
                >
                  Client Concierge
                </Link>
                <Link
                  href="/faq"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-1.5 hover:text-[#111111]"
                >
                  Shipping & Authenticity
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 text-[#C5A880] font-semibold"
                  >
                    Go To Admin Panel &rarr;
                  </Link>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-[#E8E2D9] text-xs text-[#8C7A6B] text-center space-y-1">
              <p>Pan-India White Glove Shipping</p>
              <p className="font-sans text-[11px] uppercase tracking-widest text-[#8C7A6B]">Crafted with enduring Indian elegance.</p>
            </div>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CartDrawer />
    </>
  );
}
