"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown, Home } from "lucide-react";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { useCart } from "@/lib/context/cart-context";
import { useWishlist } from "@/lib/context/wishlist-context";
import { useAuth } from "@/lib/auth/auth-context";
import { SearchModal } from "@/components/layout/SearchModal";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { AnimatedLogo } from "@/components/layout/AnimatedLogo";

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

  // Lock body scroll and handle Escape key for smooth sidebar drawer
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIsMobileMenuOpen(false);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isMobileMenuOpen]);

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
            {/* Left: Sidebar Menu Toggle (Mobile: 3-line icon only; Laptop/Desktop: 3-line + Menu text) & Search */}
            <div className="flex items-center justify-start gap-3 sm:gap-4 flex-1 lg:flex-initial lg:w-1/4">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="flex items-center gap-2 p-1.5 text-[#111111] hover:text-[#C5A880] transition-colors cursor-pointer group"
                aria-label="Open Navigation Sidebar"
              >
                <Menu className="w-5 h-5 transition-transform group-hover:scale-110 shrink-0" />
                <span className="hidden sm:inline text-[11px] uppercase tracking-[0.2em] font-semibold text-[#111111] group-hover:text-[#C5A880]">
                  Menu
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="hidden lg:flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#6E6A64] hover:text-[#111111] transition-colors group cursor-pointer"
              >
                <Search className="w-4 h-4 text-[#8C7A6B] group-hover:text-[#111111]" />
                <span className="font-medium">Search Atelier</span>
              </button>
            </div>

            {/* Center: Brand Logo with Handwritten Reveal Animation (Symmetrically centered) */}
            <div className="flex justify-center items-center shrink-0 lg:w-2/4">
              <AnimatedLogo />
            </div>

            {/* Right: Actions (Mobile Search, Account, Cart, Admin) - Wishlist button removed */}
            <div className="flex items-center justify-end gap-2.5 sm:gap-4 flex-1 lg:flex-initial lg:w-1/4">
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

      {/* Slide-Out Navigation Drawer for Laptop, Desktop, Tablet, and Mobile */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-400 ease-out ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div
          className="absolute inset-0 bg-[#111111]/60 backdrop-blur-sm transition-opacity duration-400"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div
          className={`absolute inset-y-0 left-0 w-full max-w-sm sm:max-w-md bg-[#FBF9F5] border-r border-[#E8E2D9] shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto transform transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D9]">
              <div onClick={() => setIsMobileMenuOpen(false)}>
                <AnimatedLogo showSubtitle={false} />
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 text-[#8C7A6B] hover:text-[#111111] transition-colors cursor-pointer"
                aria-label="Close navigation sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Top Primary Home Page Navigation Button */}
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-[#141414] text-[#F5F2EB] hover:bg-[#C5A880] hover:text-[#111111] transition-all duration-300 shadow-sm group"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#242424] group-hover:bg-[#111111] flex items-center justify-center transition-colors">
                  <Home className="w-4 h-4 text-[#C5A880] group-hover:text-[#F5F2EB] transition-colors" />
                </div>
                <div className="text-left">
                  <span className="block uppercase tracking-[0.22em] font-semibold text-xs">
                    Home Page
                  </span>
                  <span className="block text-[9px] uppercase tracking-widest text-[#8C7A6B] group-hover:text-[#222222]">
                    Atelier Entrance
                  </span>
                </div>
              </div>
              <span className="text-xs tracking-widest text-[#C5A880] group-hover:text-[#111111] transition-transform group-hover:translate-x-0.5">
                &rarr;
              </span>
            </Link>

            {/* Quick Search inside Drawer */}
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsSearchOpen(true);
              }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#F4F0E8] border border-[#E8E2D9] text-xs text-[#6E6A64] hover:text-[#111111] transition-colors cursor-pointer"
            >
              <span className="uppercase tracking-[0.16em] font-mono text-[11px]">Search Atelier Catalog...</span>
              <Search className="w-3.5 h-3.5 text-[#8C7A6B]" />
            </button>

            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#8C7A6B] font-mono px-1">
                Atelier Collections
              </p>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2.5 px-2 text-sm uppercase tracking-[0.2em] font-medium text-[#111111] hover:text-[#C5A880] hover:bg-[#F4F0E8]/60 rounded-lg transition-colors border-b border-[#E8E2D9]/40"
                >
                  <span>{link.name}</span>
                  <span className="text-[#8C7A6B] text-xs">&rarr;</span>
                </Link>
              ))}
            </div>

            {/* Wishlist Link inside Navigation Drawer */}
            <div className="pt-2">
              <Link
                href="/wishlist"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-[#F4F0E8]/70 hover:bg-[#F4F0E8] text-[#111111] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4 text-[#8C7A6B]" />
                  <span className="text-xs uppercase tracking-[0.18em] font-medium">My Wishlist</span>
                </div>
                {wishlistCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] bg-[#C5A880] text-[#111111] font-bold rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8E2D9] space-y-3">
            {/* Official Instagram Profile Showcase */}
            <a
              href="https://www.instagram.com/dnora_lifestyle/?utm_source=ig_web_button_share_sheet"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#171717] via-[#221D1A] to-[#171717] text-[#F5F2EB] border border-[#332B25] hover:border-[#C5A880] transition-all duration-300 group shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#833AB4] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
                  <InstagramIcon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#F5F2EB]">
                      @dnora_lifestyle
                    </span>
                  </div>
                  <p className="text-[10px] text-[#A89F91] tracking-wider">
                    Follow us on Instagram
                  </p>
                </div>
              </div>
              <span className="text-xs text-[#C5A880] group-hover:translate-x-1 transition-transform">
                &rarr;
              </span>
            </a>

            <div className="text-xs text-[#8C7A6B] text-center space-y-0.5 pt-1">
              <p className="font-medium text-[#111111]">Pan-India White Glove Shipping</p>
              <p className="font-sans text-[10px] uppercase tracking-widest text-[#8C7A6B]">Crafted with enduring modern elegance.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Global Modals */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CartDrawer />
    </>
  );
}
