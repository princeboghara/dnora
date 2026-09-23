"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  X,
  Search,
  Heart,
  User as UserIcon,
  ShoppingBag,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Sparkles,
  MapPin,
  Package,
  LogOut,
  Phone,
  Mail,
} from "lucide-react";
import { useCart } from "@/lib/store/cart-store";
import { useWishlist } from "@/lib/store/wishlist-store";
import { formatPrice } from "@/lib/utils";
import { Product } from "@/types";

export interface NavCategory {
  id: string;
  label: string;
  href: string;
  badge?: string;
  subcategories?: {
    title: string;
    items: { label: string; href: string; badge?: string }[];
  }[];
  featuredCard?: {
    title: string;
    subtitle: string;
    image: string;
    href: string;
    cta: string;
  };
}

const LUXURY_NAV_CATEGORIES: NavCategory[] = [
  {
    id: "nav-new",
    label: "NEW IN",
    href: "/shop?sort=newest",
    badge: "New",
    subcategories: [
      {
        title: "LATEST ARRIVALS",
        items: [
          { label: "View All New Arrivals", href: "/shop?sort=newest" },
          { label: "The Florence Autumn Drop", href: "/shop?collection=florence", badge: "Exclusive" },
          { label: "Architectural Totes", href: "/category/tote-bags" },
          { label: "Saddle & Crossbody Silhouettes", href: "/category/crossbody-bags" },
          { label: "Miniature Evening Bags", href: "/category/mini-bags" },
        ],
      },
      {
        title: "CURATED EDITS",
        items: [
          { label: "Bestselling Icons", href: "/#bestsellers" },
          { label: "Monochrome Noir Collection", href: "/shop?color=black" },
          { label: "Tuscan Tan & Caramel", href: "/shop?color=caramel" },
          { label: "Gift Selection", href: "/shop?collection=gifts" },
        ],
      },
    ],
    featuredCard: {
      title: "THE FLORENCE SADDLE",
      subtitle: "Handcrafted in Italy from 100% certified Tuscan calfskin.",
      image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=700&q=85",
      href: "/shop",
      cta: "Explore Drop",
    },
  },
  {
    id: "nav-handbags",
    label: "HANDBAGS",
    href: "/shop",
    subcategories: [
      {
        title: "BY SILHOUETTE",
        items: [
          { label: "Explore All Handbags", href: "/shop" },
          { label: "Tote & Shopper Bags", href: "/category/tote-bags" },
          { label: "Shoulder Bags", href: "/category/shoulder-bags" },
          { label: "Crossbody Bags", href: "/category/crossbody-bags" },
          { label: "Top-Handle Bags", href: "/category/top-handle" },
          { label: "Mini & Evening Bags", href: "/category/mini-bags" },
        ],
      },
      {
        title: "LEATHER & CRAFT",
        items: [
          { label: "Full-Grain Tuscan Calfskin", href: "/#craft" },
          { label: "Smooth Saddle Leather", href: "/#craft" },
          { label: "Embossed Crocodile Finish", href: "/#craft" },
          { label: "Hand-Polished Italian Hardware", href: "/#craft" },
        ],
      },
    ],
    featuredCard: {
      title: "ARCHITECTURAL SILHOUETTES",
      subtitle: "Precision lines meet timeless Italian craftsmanship.",
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=85",
      href: "/shop",
      cta: "View Collection",
    },
  },
  {
    id: "nav-shoulder",
    label: "SHOULDER BAGS",
    href: "/category/shoulder-bags",
  },
  {
    id: "nav-totes",
    label: "TOTES",
    href: "/category/tote-bags",
  },
  {
    id: "nav-crossbody",
    label: "CROSSBODY",
    href: "/category/crossbody-bags",
  },
  {
    id: "nav-mini",
    label: "MINI BAGS",
    href: "/category/mini-bags",
  },
  {
    id: "nav-maison",
    label: "THE MAISON",
    href: "/#editorial",
    subcategories: [
      {
        title: "HERITAGE & CRAFTSMANSHIP",
        items: [
          { label: "The DNORA Philosophy", href: "/#story" },
          { label: "Florentine Leather Atelier", href: "/#atelier" },
          { label: "Artisan Techniques & Stitching", href: "/#craft" },
          { label: "Sustainability & Traceability", href: "/#sustainability" },
        ],
      },
      {
        title: "CLIENT SERVICES",
        items: [
          { label: "Personal Luxury Concierge", href: "mailto:concierge@dnora.luxury" },
          { label: "Care & Maintenance Guide", href: "/care" },
          { label: "Bespoke Monogramming", href: "/custom" },
          { label: "Authenticity Certification", href: "/authenticity" },
        ],
      },
    ],
    featuredCard: {
      title: "FLORENTINE ATELIER",
      subtitle: "Each piece takes over 18 hours of meticulous handcrafting.",
      image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=700&q=85",
      href: "/#story",
      cta: "Read Story",
    },
  },
];

const SEARCH_SUGGESTIONS = [
  "The Florence Tote",
  "Noir Crossbody",
  "Tuscan Calfskin",
  "Mini Evening Minaudière",
  "Saddle Shoulder Bag",
  "Cognac Tan",
];

export function TopBar({ initialNavCategories }: { initialNavCategories?: NavCategory[] } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const { itemCount, openCart } = useCart();
  const { itemCount: wishlistCount } = useWishlist();

  if (pathname?.startsWith("/admin")) return null;

  // Navigation states
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);

  // Search modal states
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // User auth state
  const [user, setUser] = useState<{ full_name?: string; email: string } | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Mega menu close timer
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track scroll for sticky backdrop blur effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch user session
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.isAuthenticated && data.user) {
            setUser(data.user);
          }
        }
      } catch {
        // Ignore session error
      }
    }
    checkAuth();
  }, []);

  // Auto-focus search input when opened
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [searchOpen]);

  // Live search handler
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults((data.products || []).slice(0, 6));
        }
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleMegaMenuEnter = (id: string) => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
    }
    setActiveMegaMenu(id);
  };

  const handleMegaMenuLeave = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 180);
  };

  // TopBar dynamic settings
  const [topbarConfig, setTopbarConfig] = useState({
    brand_name: "DNORA",
    tagline: "HAUTE MAROQUINERIE • MILANO / PARIS",
    concierge_phone: "+39 02 8901 3450",
    concierge_email: "concierge@dnora.luxury",
    show_search: true,
    show_wishlist: true,
    show_account: true,
    show_cart: true,
    is_sticky: true,
  });

  // Dynamic Navigation Categories
  const [navCategories, setNavCategories] = useState<NavCategory[]>(
    () => initialNavCategories && initialNavCategories.length > 0 ? initialNavCategories : LUXURY_NAV_CATEGORIES
  );

  useEffect(() => {
    let isMounted = true;
    async function loadTopbar() {
      try {
        const res = await fetch("/api/topbar");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.config) {
            setTopbarConfig((prev) => ({ ...prev, ...data.config }));
          }
        }
      } catch {}
    }
    loadTopbar();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadNav() {
      try {
        const res = await fetch("/api/navigation?target=storefront");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.items && Array.isArray(data.items) && data.items.length > 0) {
            const mapped: NavCategory[] = data.items
              .filter((item: any) => item.is_active)
              .map((item: any) => {
                const existing = LUXURY_NAV_CATEGORIES.find(
                  (l) => l.id === item.id || l.label.toLowerCase() === item.label.toLowerCase()
                );
                return {
                  id: item.id,
                  label: item.label,
                  href: item.href || "/shop",
                  badge: item.badge,
                  subcategories:
                    item.submenus && item.submenus.length > 0
                      ? [
                          {
                            title: "EXPLORE EDITS",
                            items: item.submenus.map((s: any) => ({
                              label: s.label,
                              href: s.href,
                              badge: s.badge,
                            })),
                          },
                        ]
                      : existing?.subcategories,
                  featuredCard: existing?.featuredCard,
                };
              });
            if (mapped.length > 0) {
              setNavCategories(mapped);
            }
          }
        }
      } catch {}
    }
    loadNav();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeCategory = navCategories.find((cat) => cat.id === activeMegaMenu);

  // Isolate admin experience completely: hide storefront TopBar in /admin
  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      {/* Top Bar Header with Integrated Navigation Bar */}
      <header
        className={`${topbarConfig.is_sticky ? "sticky top-0" : "relative"} z-40 w-full select-none transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.03)] border-b border-black/[0.06]"
            : "bg-white border-b border-neutral-200/60"
        }`}
      >
        <div className="max-w-[1820px] 2xl:max-w-[1920px] mx-auto px-4 sm:px-8 xl:px-12">
          {/* UPPER TIER: Menu / Search Trigger | Centered Brand Logo | Currency / Wishlist / Account / Bag */}
          <div className="relative flex items-center justify-between h-14 sm:h-16 md:h-[72px]">
            {/* LEFT: Menu Trigger & Search (Versace / Chanel Style) */}
            <div className="flex items-center gap-2 sm:gap-6">
              {/* Menu Hamburger (Visible only on mobile where desktop category nav is hidden) */}
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(true)}
                className="group md:hidden inline-flex items-center gap-2 py-2 text-neutral-900 hover:text-black transition-colors cursor-pointer"
                aria-label="Open Maison Navigation Menu"
              >
                <div className="flex flex-col gap-1 w-5 sm:w-6 justify-center">
                  <span className="block h-[1.5px] w-full bg-neutral-900 group-hover:bg-black transition-transform" />
                  <span className="block h-[1.5px] w-3/4 bg-neutral-900 group-hover:w-full group-hover:bg-black transition-all" />
                  <span className="block h-[1.5px] w-full bg-neutral-900 group-hover:bg-black transition-transform" />
                </div>
                <span className="hidden sm:inline-block text-[11px] font-semibold tracking-[0.2em] uppercase text-neutral-900 group-hover:text-black">
                  MENU
                </span>
              </button>

              {/* Search Button (Left aligned next to Menu on all screens, keeping clear distance from center logo) */}
              {topbarConfig.show_search && (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="inline-flex items-center gap-2 text-neutral-700 hover:text-black transition-colors p-1.5 sm:p-0 cursor-pointer"
                  aria-label="Search Collection"
                >
                  <Search className="w-4.5 h-4.5 sm:w-4 sm:h-4 stroke-[1.75]" />
                  <span className="hidden md:inline-block text-[11px] font-medium tracking-[0.16em] uppercase">SEARCH</span>
                </button>
              )}
            </div>

            {/* CENTER: Iconic DNORA Brand Logo with safe margins */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
              <Link
                href="/"
                className="pointer-events-auto inline-flex items-center justify-center group focus:outline-hidden"
                aria-label="DNORA Home"
              >
                <div className="relative h-6 sm:h-8 md:h-9 w-26 sm:w-34 md:w-44 flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.01]">
                  <Image
                    src="/images/logo.png"
                    alt={topbarConfig.brand_name || "DNORA"}
                    fill
                    sizes="(max-width: 768px) 130px, 200px"
                    className="object-contain"
                    priority
                  />
                </div>
              </Link>
            </div>

            {/* RIGHT: Wishlist, Account, Cart Bag */}
            <div className="flex items-center gap-1.5 sm:gap-4 md:gap-5">
              {/* Wishlist Button */}
              {topbarConfig.show_wishlist && (
                <Link
                  href="/account?tab=wishlist"
                  className="relative p-1.5 sm:p-2 text-neutral-900 hover:text-black transition-colors"
                  aria-label={`Wishlist (${wishlistCount} items)`}
                  title="Wishlist"
                >
                  <Heart className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[1.75]" />
                  {wishlistCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-neutral-900 text-white text-[8px] sm:text-[9px] font-bold rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Client Account / Member Portal */}
              {topbarConfig.show_account && (
                <div className="relative">
                  {user ? (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                        className="p-1.5 sm:p-2 text-neutral-900 hover:text-black transition-colors flex items-center gap-1.5 cursor-pointer"
                        aria-label="Client Account"
                        title={user.full_name || user.email}
                      >
                        <UserIcon className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[1.75]" />
                        <span className="hidden xl:inline-block text-[11px] font-semibold tracking-wider uppercase text-neutral-900">
                          {user.full_name ? user.full_name.split(" ")[0] : "Account"}
                        </span>
                      </button>

                      {/* Account Dropdown */}
                      {userDropdownOpen && (
                        <div
                          onMouseLeave={() => setUserDropdownOpen(false)}
                          className="absolute right-0 mt-2 w-60 bg-white border border-neutral-200 rounded-xs shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                        >
                          <div className="px-4 py-3 border-b border-neutral-100">
                            <span className="text-[9.5px] uppercase tracking-[0.18em] text-neutral-400 font-bold block">
                              DNORA CLIENT
                            </span>
                            <span className="text-xs font-bold text-neutral-900 truncate block mt-0.5">
                              {user.full_name || user.email.split("@")[0]}
                            </span>
                            <span className="text-[11px] text-neutral-500 truncate block">
                              {user.email}
                            </span>
                          </div>

                          <Link
                            href="/account?tab=orders"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-neutral-800 hover:bg-neutral-50 hover:text-black font-medium transition-colors"
                          >
                            <Package className="w-4 h-4 text-neutral-500" />
                            <span>Orders & Live Tracking</span>
                          </Link>

                          <Link
                            href="/account?tab=addresses"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-neutral-800 hover:bg-neutral-50 hover:text-black font-medium transition-colors"
                          >
                            <MapPin className="w-4 h-4 text-neutral-500" />
                            <span>Delivery Addresses</span>
                          </Link>

                          <div className="pt-1 border-t border-neutral-100">
                            <button
                              type="button"
                              onClick={async () => {
                                setUserDropdownOpen(false);
                                try {
                                  await fetch("/api/auth/logout", { method: "POST" });
                                } catch (err) {
                                  console.error("Logout error:", err);
                                } finally {
                                  setUser(null);
                                  router.push("/");
                                  router.refresh();
                                }
                              }}
                              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium transition-colors cursor-pointer"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      className="p-1.5 sm:p-2 text-neutral-900 hover:text-black transition-colors inline-flex"
                      aria-label="Client Sign In"
                      title="Client Sign In"
                    >
                      <UserIcon className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[1.75]" />
                    </Link>
                  )}
                </div>
              )}

              {/* Shopping Bag Button */}
              {topbarConfig.show_cart && (
                <button
                  type="button"
                  onClick={openCart}
                  className="relative p-1.5 sm:p-2 text-neutral-900 hover:text-black transition-colors cursor-pointer"
                  aria-label={`Shopping Bag (${itemCount} items)`}
                  title="Shopping Bag"
                >
                  <ShoppingBag className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[1.75]" />
                  {itemCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-neutral-900 text-white text-[8px] sm:text-[9px] font-bold rounded-full flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* LOWER TIER: Integrated Category Navigation Bar (Desktop) */}
          <nav
            className="hidden md:flex items-center justify-center border-t border-neutral-200/50 py-2.5"
            aria-label="Main Storefront Navigation"
          >
            <ul className="flex items-center gap-6 lg:gap-9">
              {navCategories.map((cat) => {
                const hasDropdown = !!(cat.subcategories && cat.subcategories.length > 0);
                const isActive = activeMegaMenu === cat.id;

                return (
                  <li
                    key={cat.id}
                    onMouseEnter={() => hasDropdown && handleMegaMenuEnter(cat.id)}
                    onMouseLeave={handleMegaMenuLeave}
                    className="relative"
                  >
                    <Link
                      href={cat.href}
                      className={`group relative inline-flex items-center gap-1.5 py-1 text-[11px] lg:text-[11.5px] font-semibold tracking-[0.18em] lg:tracking-[0.2em] uppercase transition-colors duration-200 ${
                        isActive
                          ? "text-black"
                          : "text-neutral-700 hover:text-black"
                      }`}
                    >
                      <span>{cat.label}</span>

                      {/* Optional micro badge */}
                      {cat.badge && (
                        <span className="text-[8px] tracking-wider uppercase font-bold px-1.5 py-0.2 bg-neutral-900 text-white rounded-full">
                          {cat.badge}
                        </span>
                      )}

                      {/* Active Indicator Underline (Chanel / Versace signature) */}
                      <span
                        className={`absolute bottom-0 left-0 w-full h-[1.5px] bg-neutral-950 transition-all duration-200 ${
                          isActive
                            ? "opacity-100 scale-x-100"
                            : "opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100"
                        }`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* MEGA-MENU DROPDOWN PANEL (Haute Couture Chanel / Versace Style) */}
        {activeCategory && activeCategory.subcategories && (
          <div
            onMouseEnter={() => handleMegaMenuEnter(activeCategory.id)}
            onMouseLeave={handleMegaMenuLeave}
            className="hidden md:block absolute top-full left-0 w-full bg-white/98 backdrop-blur-xl border-b border-neutral-200 shadow-2xl transition-all duration-300 ease-out z-50 animate-in fade-in slide-in-from-top-1"
          >
            <div className="max-w-[1820px] 2xl:max-w-[1920px] mx-auto px-8 xl:px-12 py-10">
              <div className="grid grid-cols-12 gap-10">
                {/* Columns for subcategories */}
                <div className="col-span-8 grid grid-cols-2 lg:grid-cols-3 gap-8">
                  {activeCategory.subcategories.map((col, idx) => (
                    <div key={idx} className="space-y-4">
                      <h4 className="text-[10px] font-bold tracking-[0.22em] uppercase text-neutral-400 border-b border-neutral-100 pb-2">
                        {col.title}
                      </h4>
                      <ul className="space-y-3">
                        {col.items.map((item, itemIdx) => (
                          <li key={itemIdx}>
                            <Link
                              href={item.href}
                              onClick={() => setActiveMegaMenu(null)}
                              className="group inline-flex items-center justify-between w-full text-xs font-medium text-neutral-800 hover:text-black tracking-wide transition-colors"
                            >
                              <span className="group-hover:translate-x-1 transition-transform duration-200">
                                {item.label}
                              </span>
                              {item.badge && (
                                <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 bg-neutral-100 text-neutral-900 rounded-xs">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Editorial Highlight Card */}
                {activeCategory.featuredCard && (
                  <div className="col-span-4 pl-6 border-l border-neutral-100">
                    <Link
                      href={activeCategory.featuredCard.href}
                      onClick={() => setActiveMegaMenu(null)}
                      className="group block relative h-full overflow-hidden bg-neutral-100 rounded-xs"
                    >
                      <div className="relative aspect-4/3 w-full overflow-hidden">
                        <Image
                          src={activeCategory.featuredCard.image}
                          alt={activeCategory.featuredCard.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          sizes="(max-width: 1200px) 300px, 400px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-neutral-300">
                            CAMPAIGN FEATURE
                          </p>
                          <h5 className="text-sm font-semibold tracking-wider uppercase mt-1">
                            {activeCategory.featuredCard.title}
                          </h5>
                          <p className="text-[11px] text-neutral-200 mt-1 line-clamp-2 leading-relaxed">
                            {activeCategory.featuredCard.subtitle}
                          </p>
                          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white mt-3 group-hover:underline underline-offset-4">
                            <span>{activeCategory.featuredCard.cta}</span>
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* SEARCH MODAL OVERLAY (Versace / Chanel Style) */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setSearchOpen(false)}
            aria-hidden="true"
          />

          <div className="relative bg-white border-b border-neutral-200 shadow-2xl z-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
              {/* Header with Close */}
              <div className="flex items-center justify-between pb-6 border-b border-neutral-200">
                <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-bold text-neutral-400">
                  MAISON SEARCH
                </span>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-1.5 rounded text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Big Search Input */}
              <div className="mt-6 relative">
                <div className="flex items-center border-b-2 border-neutral-900 pb-3">
                  <Search className="w-6 h-6 text-neutral-900 shrink-0 mr-3" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="WHAT ARE YOU SEARCHING FOR?"
                    className="w-full text-base sm:text-xl font-medium tracking-wider uppercase placeholder:text-neutral-300 text-neutral-950 focus:outline-hidden bg-transparent"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-neutral-400 hover:text-black p-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Search Suggestions Tags */}
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-[0.16em] text-neutral-400 mr-2">
                  SUGGESTIONS:
                </span>
                {SEARCH_SUGGESTIONS.map((tag, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSearchQuery(tag)}
                    className="text-[11px] tracking-wider uppercase font-medium px-3 py-1 bg-neutral-100 hover:bg-neutral-900 hover:text-white transition-colors rounded-full cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Live Search Results */}
              <div className="mt-8">
                {isSearching ? (
                  <div className="py-12 text-center text-xs text-neutral-400 tracking-widest uppercase">
                    Searching collections...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div>
                    <h5 className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400 mb-4">
                      SEARCH RESULTS ({searchResults.length})
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {searchResults.map((product) => {
                        const img = product.images?.[0]?.secure_url || "";
                        return (
                          <Link
                            key={product.id}
                            href={`/product/${product.slug}`}
                            onClick={() => setSearchOpen(false)}
                            className="group block space-y-2"
                          >
                            <div className="relative aspect-3/4 bg-neutral-100 rounded-xs overflow-hidden border border-neutral-200">
                              {img && (
                                <Image
                                  src={img}
                                  alt={product.name}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                                  sizes="160px"
                                />
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-neutral-900 uppercase tracking-wider truncate group-hover:underline">
                                {product.name}
                              </p>
                              <p className="text-xs font-bold text-neutral-900 mt-0.5">
                                {formatPrice(product.price)}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ) : searchQuery ? (
                  <div className="py-12 text-center text-xs text-neutral-500">
                    No silhouettes found matching &quot;{searchQuery}&quot;. Try another term.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HAUTE COUTURE MOBILE DRAWER (Chanel Style Slide-Over with smooth CSS transitions) */}
      <div
        className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ease-in-out ${
          mobileDrawerOpen ? "visible pointer-events-auto" : "invisible pointer-events-none delay-300"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-in-out cursor-pointer ${
            mobileDrawerOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileDrawerOpen(false)}
          aria-hidden="true"
        />

        <div className="fixed inset-y-0 left-0 max-w-full flex pr-10">
          <div
            className={`w-screen max-w-sm sm:max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
              mobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200">
                <Link
                  href="/"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="relative h-7 w-28"
                >
                  <Image
                    src="/images/logo.png"
                    alt="DNORA"
                    fill
                    className="object-contain"
                  />
                </Link>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-md text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search input */}
              <div className="px-6 py-4 border-b border-neutral-100 bg-[#f4f4f5]">
                <button
                  type="button"
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    setSearchOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 bg-white border border-neutral-200 rounded text-xs text-neutral-400 tracking-wider uppercase cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Search Maison...</span>
                  </span>
                  <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">
                    OPEN
                  </span>
                </button>
              </div>

              {/* Navigation Categories Accordion */}
              <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-neutral-100">
                {navCategories.map((cat) => {
                  const hasSubs = !!(cat.subcategories && cat.subcategories.length > 0);
                  const isExpanded = mobileAccordion === cat.id;

                  return (
                    <div key={cat.id} className="py-3">
                      <div className="flex items-center justify-between">
                        <Link
                          href={cat.href}
                          onClick={() => setMobileDrawerOpen(false)}
                          className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-900 hover:text-black"
                        >
                          {cat.label}
                        </Link>
                        {hasSubs && (
                          <button
                            type="button"
                            onClick={() => setMobileAccordion(isExpanded ? null : cat.id)}
                            className="p-1 text-neutral-400 hover:text-black cursor-pointer"
                            aria-label={`Toggle ${cat.label}`}
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-200 ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        )}
                      </div>

                      {hasSubs && isExpanded && (
                        <div className="mt-3 pl-3 border-l-2 border-neutral-900 space-y-4 pt-1 animate-in fade-in duration-150">
                          {cat.subcategories!.map((group, groupIdx) => (
                            <div key={groupIdx} className="space-y-2">
                              <span className="text-[9.5px] uppercase tracking-[0.18em] font-bold text-neutral-400 block">
                                {group.title}
                              </span>
                              <ul className="space-y-2">
                                {group.items.map((sub, sIdx) => (
                                  <li key={sIdx}>
                                    <Link
                                      href={sub.href}
                                      onClick={() => setMobileDrawerOpen(false)}
                                      className="text-xs text-neutral-700 hover:text-black block"
                                    >
                                      {sub.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Member Services & Concierge Footer */}
              <div className="p-6 border-t border-neutral-200 bg-[#f4f4f5] space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/account?tab=orders"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="flex items-center gap-2 p-2.5 bg-white border border-neutral-200 rounded text-xs font-semibold uppercase tracking-wider text-neutral-800 hover:border-black transition-colors"
                  >
                    <Package className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Track Order</span>
                  </Link>
                  <Link
                    href="/account"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="flex items-center gap-2 p-2.5 bg-white border border-neutral-200 rounded text-xs font-semibold uppercase tracking-wider text-neutral-800 hover:border-black transition-colors"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Client Portal</span>
                  </Link>
                </div>

                <div className="text-[11px] text-neutral-500 space-y-1">
                  <p className="flex items-center gap-1.5 font-medium">
                    <Phone className="w-3 h-3 text-neutral-400" />
                    <span>VIP Concierge: {topbarConfig.concierge_phone || "+39 02 8901 3450"}</span>
                  </p>
                  <p className="flex items-center gap-1.5 font-medium">
                    <Mail className="w-3 h-3 text-neutral-400" />
                    <span>{topbarConfig.concierge_email || "concierge@dnora.luxury"}</span>
                  </p>
                </div>

                <p className="text-[9.5px] uppercase font-bold tracking-[0.2em] text-neutral-400 text-center pt-2">
                  FLORENCE • MILAN • MUMBAI
                </p>
              </div>
            </div>
          </div>
        </div>
    </>
  );
}
