"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ShoppingBag, Menu, X, User, LogOut, Package, MapPin, Shield } from "lucide-react";
import { useCart } from "@/lib/store/cart-store";
import { Product } from "@/types";
import { UserSession } from "@/lib/auth/user-session";
import { SearchModal } from "./SearchModal";

import { BrandLogo } from "@/components/ui/BrandLogo";

interface NavbarProps {
  products?: Product[];
  user?: UserSession | null;
}

export function Navbar({ products = [], user = null }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { openCart, itemCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Categories", href: "/#categories" },
    { label: "New Arrivals", href: "/#new-arrivals" },
    { label: "Best Sellers", href: "/#best-sellers" },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 bg-white/95 backdrop-blur-md border-b border-[#E8E5DE] ${
          isScrolled ? "shadow-sm py-3" : "py-4 sm:py-4.5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Desktop Left / Mobile Menu Trigger */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open mobile menu"
                className="p-2 text-[#0E0E0E] hover:text-[#73706A] transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Brand Logo */}
            <div className="flex items-center">
              <BrandLogo priority size="md" />
            </div>

            {/* Desktop Center Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3A3835] hover:text-[#0E0E0E] hover:border-b hover:border-[#0E0E0E] transition-all pb-1"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Action Icons */}
            <div className="flex items-center space-x-3 sm:space-x-5">
              {/* Search Trigger */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search handbags"
                className="p-2 text-[#0E0E0E] hover:text-[#C5A880] transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Client Account / User Portal */}
              <div className="relative hidden sm:block">
                {user ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="p-2 text-[#0E0E0E] hover:text-[#C5A880] transition-colors relative flex items-center gap-1"
                      aria-label="User Account"
                      title={user.full_name || user.email}
                    >
                      <User className="w-5 h-5" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] absolute top-1 right-1" />
                    </button>

                    {userDropdownOpen && (
                      <div
                        onMouseLeave={() => setUserDropdownOpen(false)}
                        className="absolute right-0 mt-2 w-56 bg-white border border-[#E8E5DE] rounded-sm shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                      >
                        <div className="px-4 py-2 border-b border-[#E8E5DE]">
                          <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-bold block">
                            Signed in as
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

                        {user.role === "admin" && (
                          <Link
                            href="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#0E0E0E] hover:bg-[#FAF9F6] font-medium transition-colors border-t border-[#E8E5DE]"
                          >
                            <Shield className="w-3.5 h-3.5 text-[#0E0E0E]" />
                            <span>Admin Management</span>
                          </Link>
                        )}

                        <div className="pt-1 border-t border-[#E8E5DE]">
                          <button
                            type="button"
                            onClick={async () => {
                              setUserDropdownOpen(false);
                              await fetch("/api/auth/logout", { method: "POST" });
                              window.location.href = "/";
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
                    aria-label="Sign In"
                    className="p-2 text-[#0E0E0E] hover:text-[#C5A880] transition-colors inline-flex"
                    title="Sign In / Register"
                  >
                    <User className="w-5 h-5" />
                  </Link>
                )}
              </div>

              {/* Cart Drawer Trigger */}
              <button
                type="button"
                onClick={openCart}
                aria-label="View shopping bag"
                className="p-2 text-[#0E0E0E] hover:text-[#C5A880] transition-colors relative"
              >
                <ShoppingBag className="w-5 h-5" />
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

      {/* Mobile Slide-out Navigation Sheet */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#E8E5DE]">
                <div onClick={() => setMobileMenuOpen(false)}>
                  <BrandLogo size="sm" />
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-[#0E0E0E]"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="py-6 flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0E0E0E] hover:text-[#C5A880] transition-colors py-1"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[#E8E5DE] space-y-3">
              {user ? (
                <>
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#0E0E0E]"
                  >
                    <Package className="w-4 h-4 text-[#C5A880]" />
                    <span>My Account & Orders ({user.full_name || user.email.split("@")[0]})</span>
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await fetch("/api/auth/logout", { method: "POST" });
                      window.location.href = "/";
                    }}
                    className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#C53030]"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#0E0E0E]"
                >
                  <User className="w-4 h-4 text-[#C5A880]" />
                  <span>Sign In / Register</span>
                </Link>
              )}

              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#73706A] hover:text-[#0E0E0E]"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Management</span>
              </Link>
              <p className="text-[11px] text-[#A8A49C] tracking-wide uppercase">
                Florence • Milan • New York
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        products={products}
      />
    </>
  );
}
