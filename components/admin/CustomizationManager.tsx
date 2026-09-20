"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Save,
  ExternalLink,
  Sliders,
  Loader2,
  Sparkles,
  Flame,
  ShoppingBag,
  Megaphone,
  Video,
  Star,
  Layers,
  Info,
  Eye,
  ChevronLeft,
  ChevronRight,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import { HomepageConfig, HeroBanner, AnnouncementConfig, ProductCategory, Product, SeenOnYouVideo, CustomerReview } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { PageLinkSelect } from "@/components/admin/PageLinkSelect";
import { SectionStyleFields } from "@/components/admin/SectionStyleFields";
import { getResolvedFontFamily } from "@/lib/font-constants";

// Embedded Section Managers
import { AnnouncementBarManager } from "@/components/admin/customization/AnnouncementBarManager";
import { HeroBannerSectionManager } from "@/components/admin/customization/HeroBannerSectionManager";
import { CategorySectionManager } from "@/components/admin/customization/CategorySectionManager";
import { ProductSelectorManager } from "@/components/admin/customization/ProductSelectorManager";
import { SeenOnYouManager } from "@/components/admin/customization/SeenOnYouManager";
import { MiddleBannerSectionManager } from "@/components/admin/customization/MiddleBannerSectionManager";
import { ReviewSectionManager } from "@/components/admin/customization/ReviewSectionManager";

export const DEFAULT_CONFIG: HomepageConfig = {
  topbar: {
    enabled: true,
    text: "COMPLIMENTARY WHITE-GLOVE EXPRESS DELIVERY ON ALL LUXURY ORDERS",
    link: "/shop",
  },
  hero: {
    enabled: true,
    height: "82vh",
  },
  categories: {
    enabled: true,
    title: "CATEGORIES",
    heading_color: "#0F172A",
    heading_font_size: "32px",
    heading_font_family: "arial-rounded",
    heading_font_weight: "800",
    card_gap: 24,
    card_size: "md",
    card_width: 112,
  },
  best_sellers: {
    enabled: true,
    title: "BEST SELLERS",
    view_all_link: "/shop?best_seller=true",
    view_all_text: "VIEW ALL",
    heading_color: "#0F172A",
    heading_font_size: "32px",
    heading_font_family: "arial-rounded",
    heading_font_weight: "800",
    card_gap: 20,
    card_size: "md",
    card_width: 260,
  },
  new_in: {
    enabled: true,
    title: "NEW IN",
    view_all_link: "/shop?new_arrival=true",
    view_all_text: "VIEW ALL",
    heading_color: "#0F172A",
    heading_font_size: "32px",
    heading_font_family: "arial-rounded",
    heading_font_weight: "800",
    card_gap: 20,
    card_size: "md",
    card_width: 260,
  },
  middle_banner: {
    enabled: true,
    eyebrow: "Atelier Edition • Florence",
    title: "ARCHITECTURAL LEATHER",
    description:
      "Sculpted with uncompromising discipline. Cut from certified full-grain Tuscan calfskin and finished with bespoke satin metal hardware.",
    button_text: "DISCOVER THE ATELIER",
    button_link: "/shop",
    image_url:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1800&q=85",
    media_type: "image",
    height: "450px",
  },
  seen_on_you: {
    enabled: true,
    title: "SEEN ON YOU",
    heading_color: "#0F172A",
    heading_font_size: "32px",
    heading_font_family: "arial-rounded",
    heading_font_weight: "800",
    card_gap: 12,
    card_size: "md",
    card_width: 280,
  },
  customer_reviews: {
    enabled: true,
    title: "CUSTOMER REVIEWS",
  },
  footer: {
    subtitle: "Artisan Handbags • Florence • New York",
    story_text:
      "Architectural silhouettes, meticulous artisan leatherwork, and timeless aesthetics designed for the modern woman. Handcrafted with bespoke calfskin and precision hardware.",
    instagram_url: "https://instagram.com/dnoralifestyle",
    facebook_url: "https://facebook.com/dnoralifestyle",
    pinterest_url: "https://pinterest.com/dnoralifestyle",
  },
};

export type TabKey =
  | "topbar"
  | "hero"
  | "categories"
  | "bestsellers"
  | "newin"
  | "middlebanner"
  | "seenonyou"
  | "reviews"
  | "footer";

export const SECTION_SLUG_MAP: Record<string, TabKey> = {
  announcementbar: "topbar",
  annoucemnetbar: "topbar",
  "announcement-bar": "topbar",
  announcement: "topbar",
  topbar: "topbar",
  herobanner: "hero",
  "hero-banner": "hero",
  hero: "hero",
  category: "categories",
  catogory: "categories",
  categories: "categories",
  bestsellers: "bestsellers",
  "best-sellers": "bestsellers",
  middlebanner: "middlebanner",
  "middle-banner": "middlebanner",
  newin: "newin",
  "new-in": "newin",
  seenonyou: "seenonyou",
  "seen-on-you": "seenonyou",
  customerreview: "reviews",
  "customer-review": "reviews",
  customerreviews: "reviews",
  "customer-reviews": "reviews",
  reviews: "reviews",
  footer: "footer",
};

export const SECTION_META: Record<
  TabKey,
  { label: string; slug: string; description: string; icon: React.ComponentType<{ className?: string }> }
> = {
  topbar: {
    label: "Announcement Bar",
    slug: "announcementbar",
    description: "Multi-announcement header displayed at the top with auto-swipe rotation.",
    icon: Megaphone,
  },
  hero: {
    label: "Hero Banner",
    slug: "herobanner",
    description: "Cinematic full-bleed campaign showcase with video/image uploads, sizing, and slide timers.",
    icon: Layers,
  },
  categories: {
    label: "Category",
    slug: "category",
    description: "Circular silhouette carousel displayed below hero, with embedded Category Master.",
    icon: ShoppingBag,
  },
  bestsellers: {
    label: "Best Sellers",
    slug: "bestsellers",
    description: "Horizontal product showcase highlighting top trending silhouettes with product selector.",
    icon: Flame,
  },
  middlebanner: {
    label: "Middle Banner",
    slug: "middlebanner",
    description: "High-impact editorial campaign banner with video/image background, sizing, and CTA.",
    icon: Sliders,
  },
  newin: {
    label: "New In",
    slug: "newin",
    description: "Product carousel showcasing the latest boutique arrivals with product selector.",
    icon: Sparkles,
  },
  seenonyou: {
    label: "Seen On You",
    slug: "seenonyou",
    description: "Vertical 9:16 video reels and patron posts with media upload and content management.",
    icon: Video,
  },
  reviews: {
    label: "Customer Review",
    slug: "customerreview",
    description: "Patron praise and verified testimonial carousel with 5-star feedback.",
    icon: Star,
  },
  footer: {
    label: "Footer",
    slug: "footer",
    description: "Brand atelier story, policies, and official luxury social channels.",
    icon: Info,
  },
};

interface CustomizationManagerProps {
  activeSlug?: string;
  basePath?: string;
}

export function CustomizationManager({
  activeSlug = "announcementbar",
}: CustomizationManagerProps) {
  const { showToast } = useToast();
  const [config, setConfig] = useState<HomepageConfig>(DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);

  // Normalize slug to TabKey
  const normalizedKey: TabKey =
    activeSlug && SECTION_SLUG_MAP[activeSlug.toLowerCase()]
      ? SECTION_SLUG_MAP[activeSlug.toLowerCase()]
      : "topbar";

  const [activeTab, setActiveTab] = useState<TabKey>(normalizedKey);

  // Dynamic Content States for Interactive Previews
  const [announcementsData, setAnnouncementsData] = useState<AnnouncementConfig | null>(null);
  const [currentAnnIndex, setCurrentAnnIndex] = useState(0);

  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [heroVideoMuted, setHeroVideoMuted] = useState(true);
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);

  const [categoriesList, setCategoriesList] = useState<ProductCategory[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [seenOnYouList, setSeenOnYouList] = useState<SeenOnYouVideo[]>([]);
  const [reviewsList, setReviewsList] = useState<CustomerReview[]>([]);

  // Staging states to prevent premature storefront alterations until "Publish Changes" is clicked
  const [pendingAnnouncements, setPendingAnnouncements] = useState<AnnouncementConfig | null>(null);
  const [stagedProductToggles, setStagedProductToggles] = useState<Map<string, "is_best_seller" | "is_new_arrival">>(new Map());

  const handleDraftProductToggle = (
    productId: string,
    flag: "is_best_seller" | "is_new_arrival"
  ) => {
    setStagedProductToggles((prev) => {
      const next = new Map(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.set(productId, flag);
      }
      return next;
    });
  };

  useEffect(() => {
    if (activeSlug && SECTION_SLUG_MAP[activeSlug.toLowerCase()]) {
      setActiveTab(SECTION_SLUG_MAP[activeSlug.toLowerCase()]);
    }
  }, [activeSlug]);

  // Load Homepage Config
  useEffect(() => {
    let isMounted = true;
    async function loadConfig() {
      try {
        const res = await fetch("/api/homepage-config");
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success && json.config) {
            setConfig({
              ...DEFAULT_CONFIG,
              ...json.config,
              topbar: { ...DEFAULT_CONFIG.topbar, ...(json.config.topbar || {}) },
              hero: { ...DEFAULT_CONFIG.hero, ...(json.config.hero || {}) },
              categories: { ...DEFAULT_CONFIG.categories, ...(json.config.categories || {}) },
              best_sellers: { ...DEFAULT_CONFIG.best_sellers, ...(json.config.best_sellers || {}) },
              new_in: { ...DEFAULT_CONFIG.new_in, ...(json.config.new_in || {}) },
              middle_banner: { ...DEFAULT_CONFIG.middle_banner, ...(json.config.middle_banner || {}) },
              seen_on_you: { ...DEFAULT_CONFIG.seen_on_you, ...(json.config.seen_on_you || {}) },
              customer_reviews: { ...DEFAULT_CONFIG.customer_reviews, ...(json.config.customer_reviews || {}) },
              footer: { ...DEFAULT_CONFIG.footer, ...(json.config.footer || {}) },
            });
          }
        }
      } catch (err) {
        console.error("Failed to load homepage config:", err);
      }
    }
    loadConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  // Load Announcements for Live Preview
  useEffect(() => {
    let isMounted = true;
    async function loadAnnouncements() {
      try {
        const res = await fetch("/api/announcements");
        if (res.ok) {
          const data: AnnouncementConfig = await res.json();
          if (isMounted) setAnnouncementsData(data);
        }
      } catch (err) {
        console.error("Failed to load announcements for preview:", err);
      }
    }
    loadAnnouncements();
    return () => {
      isMounted = false;
    };
  }, []);

  // Load Hero Banners for Live Preview
  useEffect(() => {
    let isMounted = true;
    async function loadHeroes() {
      try {
        const res = await fetch("/api/heroes?includeDrafts=true");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data.banners)) {
            setHeroBanners(data.banners);
          }
        }
      } catch (err) {
        console.error("Failed to load heroes for preview:", err);
      }
    }
    loadHeroes();
    return () => {
      isMounted = false;
    };
  }, []);

  // Load Categories for Live Preview
  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        const res = await fetch(`/api/categories?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.data)) {
            setCategoriesList(data.data);
          }
        }
      } catch (err) {
        console.error("Failed to load categories for preview:", err);
      }
    }
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Load Products for Best Sellers and New In
  useEffect(() => {
    let isMounted = true;
    async function loadProducts() {
      try {
        const res = await fetch(`/api/products?status=all&limit=100&t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data.products)) {
            setProductsList(data.products);
          }
        }
      } catch (err) {
        console.error("Failed to load products for preview:", err);
      }
    }
    loadProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Load Seen On You Videos for Live Preview
  useEffect(() => {
    let isMounted = true;
    async function loadSeenOnYou() {
      try {
        const res = await fetch(`/api/admin/seen-on-you?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.videos)) {
            setSeenOnYouList(data.videos);
          }
        }
      } catch (err) {
        console.error("Failed to load seen on you for preview:", err);
      }
    }
    loadSeenOnYou();
    return () => {
      isMounted = false;
    };
  }, []);

  // Load Customer Reviews for Live Preview
  useEffect(() => {
    let isMounted = true;
    async function loadReviews() {
      try {
        const res = await fetch(`/api/admin/reviews?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.reviews)) {
            setReviewsList(data.reviews);
          }
        }
      } catch (err) {
        console.error("Failed to load reviews for preview:", err);
      }
    }
    loadReviews();
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-swipe for Announcement Bar Preview
  const activeAnnouncements = (announcementsData?.items || []).filter((i) => i.is_active);
  const goToNextAnn = useCallback(() => {
    if (activeAnnouncements.length <= 1) return;
    setCurrentAnnIndex((prev) => (prev + 1) % activeAnnouncements.length);
  }, [activeAnnouncements.length]);

  const goToPrevAnn = useCallback(() => {
    if (activeAnnouncements.length <= 1) return;
    setCurrentAnnIndex((prev) => (prev - 1 + activeAnnouncements.length) % activeAnnouncements.length);
  }, [activeAnnouncements.length]);

  useEffect(() => {
    if (activeTab !== "topbar" || activeAnnouncements.length <= 1) return;
    const intervalSec = Math.max(2, announcementsData?.interval_seconds || 4);
    const timer = setInterval(() => {
      goToNextAnn();
    }, intervalSec * 1000);
    return () => clearInterval(timer);
  }, [activeTab, activeAnnouncements.length, announcementsData?.interval_seconds, goToNextAnn]);

  // Auto-swipe for Hero Banner Preview
  const activeHeroBanners = heroBanners.length > 0 ? heroBanners : [];
  const currentHero = activeHeroBanners[currentHeroIndex % Math.max(1, activeHeroBanners.length)];

  const goToNextHero = useCallback(() => {
    if (activeHeroBanners.length <= 1) return;
    setCurrentHeroIndex((prev) => (prev + 1) % activeHeroBanners.length);
  }, [activeHeroBanners.length]);

  const goToPrevHero = useCallback(() => {
    if (activeHeroBanners.length <= 1) return;
    setCurrentHeroIndex((prev) => (prev - 1 + activeHeroBanners.length) % activeHeroBanners.length);
  }, [activeHeroBanners.length]);

  // Auto-swipe hero images
  useEffect(() => {
    if (activeTab !== "hero" || !currentHero || activeHeroBanners.length <= 1) return;
    if (currentHero.media_type === "image") {
      const dur = Math.max(3, currentHero.duration_seconds || 5) * 1000;
      const timer = setTimeout(() => {
        goToNextHero();
      }, dur);
      return () => clearTimeout(timer);
    }
  }, [activeTab, currentHero, activeHeroBanners.length, goToNextHero]);

  // Save Configuration Handler - Commits all section settings, announcements, and product flags
  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Save Homepage Config (Typography, Spacing, Titles, Heights, etc.)
      const res = await fetch("/api/homepage-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to publish homepage settings");
      }

      // 2. Publish Pending Announcements (if any staged)
      if (pendingAnnouncements) {
        const annRes = await fetch("/api/announcements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            interval_seconds: pendingAnnouncements.interval_seconds,
            is_active: pendingAnnouncements.is_active,
            items: pendingAnnouncements.items,
          }),
        });
        if (annRes.ok) {
          setPendingAnnouncements(null);
        }
      }

      // 3. Publish Staged Product Flag Toggles (if any staged)
      if (stagedProductToggles.size > 0) {
        for (const [productId, toggleFlag] of Array.from(stagedProductToggles.entries())) {
          await fetch(`/api/products/${productId}/toggle`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ flag: toggleFlag }),
          });
        }
        setStagedProductToggles(new Map());
      }

      // 4. Publish Middle Banner directly to middle_banners table
      if (config.middle_banner) {
        await fetch("/api/middle-banner", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(config.middle_banner),
        });
      }

      showToast("Storefront changes published successfully!", "success");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to publish", "error");
    } finally {
      setSaving(false);
    }
  };

  const currentMeta = SECTION_META[activeTab] || SECTION_META.topbar;
  const CurrentIcon = currentMeta.icon;

  return (
    <div className="space-y-6">
      {/* ============================================================ */}
      {/* 1. TOP HEADER & PROMINENT PUBLISH BUTTON (LEVEL 1)           */}
      {/* ============================================================ */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs shrink-0">
            <CurrentIcon className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Live Storefront Sync
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {currentMeta.label}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900 tracking-tight">
              {currentMeta.label} Settings
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
              {currentMeta.description}
            </p>
          </div>
        </div>

        {/* Top Action Buttons (Reset button removed as requested) */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 flex-wrap sm:flex-nowrap">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-950 text-xs font-semibold rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] active:scale-95 transition-all"
            title="Preview on live storefront"
          >
            <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">View Live Store</span>
          </Link>

          {/* Big Tactile Soft 3D PUBLISH Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-b from-[#0F172A] to-[#1E293B] hover:from-[#1E293B] hover:to-[#0F172A] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-[0_4px_16px_rgba(15,23,42,0.25),inset_0_1px_0_rgba(255,255,255,0.25)] hover:shadow-[0_6px_20px_rgba(15,23,42,0.35)] active:translate-y-0.5 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] transition-all disabled:opacity-60 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-white" />
                <span>Publish Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. RESPONSIVE SIDE-BY-SIDE LAYOUT (LAPTOP & DESKTOP)          */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
        {/* Left Column: Realistic Storefront Live Preview (Sticky on laptop & desktop) */}
        <div className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-[0_4px_24px_rgba(15,23,42,0.04)]">
        {/* Preview Container Header */}
        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-xs" />
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-700 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
              <span>Realistic Storefront Live Preview</span>
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 bg-white px-2.5 py-0.5 rounded-full border border-slate-200/80 shadow-2xs">
            Section: {currentMeta.label}
          </span>
        </div>

        {/* Dynamic Section Live Visual Mocks */}
        <div className="p-6 sm:p-8 bg-[#FAFAFA] min-h-[160px] flex items-center justify-center">
          {/* 1. Topbar Announcement Live Preview with < and > Buttons */}
          {activeTab === "topbar" && (
            <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                <span>Storefront Announcement Bar Preview</span>
                {activeAnnouncements.length > 0 && (
                  <span className="font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    Slide {((currentAnnIndex % Math.max(1, activeAnnouncements.length)) + 1)} of {activeAnnouncements.length}
                  </span>
                )}
              </div>

              {/* Bar with < and > controls */}
              <div className="relative flex items-center justify-between bg-[#0E0E0E] text-white rounded-xl py-3 px-3 shadow-md">
                <button
                  type="button"
                  onClick={goToPrevAnn}
                  disabled={activeAnnouncements.length <= 1}
                  className="p-1 text-white/70 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                  title="Previous announcement"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex-1 text-center px-4">
                  {activeAnnouncements.length > 0 ? (
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <p className="text-[11px] sm:text-xs tracking-wider uppercase font-semibold">
                        {activeAnnouncements[currentAnnIndex % activeAnnouncements.length]?.text}
                      </p>
                      {activeAnnouncements[currentAnnIndex % activeAnnouncements.length]?.badge && (
                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white text-slate-900 font-bold">
                          {activeAnnouncements[currentAnnIndex % activeAnnouncements.length]?.badge}
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] sm:text-xs tracking-wider uppercase font-semibold">
                      {config.topbar?.text || "COMPLIMENTARY WHITE-GLOVE EXPRESS DELIVERY ON ALL LUXURY ORDERS"}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={goToNextAnn}
                  disabled={activeAnnouncements.length <= 1}
                  className="p-1 text-white/70 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                  title="Next announcement"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Slide Indicators */}
              {activeAnnouncements.length > 1 && (
                <div className="flex justify-center items-center gap-1.5 pt-1">
                  {activeAnnouncements.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentAnnIndex(idx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        idx === currentAnnIndex % activeAnnouncements.length
                          ? "w-6 bg-indigo-600"
                          : "w-2 bg-slate-200 hover:bg-slate-300"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. Hero Banner Live Preview with < and > Buttons */}
          {activeTab === "hero" && (
            <div className="w-full max-w-4xl space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                <span>Storefront Hero Showcase Preview</span>
                {activeHeroBanners.length > 0 && (
                  <span className="font-mono text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                    Slide {(currentHeroIndex % Math.max(1, activeHeroBanners.length)) + 1} of {activeHeroBanners.length}
                  </span>
                )}
              </div>

              <div
                style={{ height: config.hero?.height || "420px" }}
                className="relative w-full max-h-[520px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 shadow-lg flex items-center justify-center text-center p-6 text-white group"
              >
                {currentHero ? (
                  currentHero.media_type === "video" ? (
                    <video
                      ref={heroVideoRef}
                      key={currentHero.id}
                      src={currentHero.media_url}
                      autoPlay
                      muted={heroVideoMuted}
                      playsInline
                      onEnded={goToNextHero}
                      className="absolute inset-0 w-full h-full object-cover opacity-75"
                    />
                  ) : (
                    <img
                      key={currentHero.id}
                      src={currentHero.media_url}
                      alt={currentHero.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-1000"
                    />
                  )
                ) : (
                  <img
                    src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1400&q=80"
                    alt="Default Hero Showcase"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                  />
                )}

                {/* Subtle Luxury Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/30 pointer-events-none" />

                {/* Video Mute Toggle */}
                {currentHero?.media_type === "video" && (
                  <button
                    type="button"
                    onClick={() => setHeroVideoMuted(!heroVideoMuted)}
                    className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-xs transition-all cursor-pointer"
                  >
                    {heroVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                )}

                {/* Arrow Navigation Buttons (< and >) */}
                {activeHeroBanners.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={goToPrevHero}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs transition-all cursor-pointer"
                      title="Previous slide"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={goToNextHero}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs transition-all cursor-pointer"
                      title="Next slide"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Editorial Content */}
                <div className="relative z-10 space-y-2.5 max-w-lg">
                  {currentHero?.subtitle && (
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-200 block">
                      {currentHero.subtitle}
                    </span>
                  )}
                  <h2 className="text-xl sm:text-4xl font-heading font-extrabold uppercase tracking-tight text-white drop-shadow-md">
                    {currentHero?.title || "ARCHITECTURAL SILHOUETTES"}
                  </h2>
                  <div className="pt-2">
                    <span className="inline-block px-6 py-2.5 rounded-lg bg-white text-slate-950 text-xs font-bold uppercase tracking-wider shadow-md">
                      {currentHero?.button_text || "Explore Collection"}
                    </span>
                  </div>
                </div>

                {/* Bottom Slide Indicators */}
                {activeHeroBanners.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
                    {activeHeroBanners.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentHeroIndex(idx)}
                        className={`h-1 rounded-full transition-all cursor-pointer ${
                          idx === currentHeroIndex % activeHeroBanners.length
                            ? "w-8 bg-white"
                            : "w-2 bg-white/40 hover:bg-white/70"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. Categories Live Preview */}
          {activeTab === "categories" && (
            <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-xs">
              <h3
                className="tracking-tight uppercase transition-all mb-6"
                style={{
                  fontFamily: getResolvedFontFamily(config.categories?.heading_font_family),
                  color: config.categories?.heading_color || "#0F172A",
                  fontSize: `${Math.min(parseInt((config.categories?.heading_font_size || "32px").replace("px", ""), 10) || 32, 34)}px`,
                  fontWeight: config.categories?.heading_font_weight || "800",
                }}
              >
                {config.categories?.title || "CATEGORIES"}
              </h3>
              <div
                className="flex items-start justify-center overflow-x-auto py-2 transition-all"
                style={{ gap: `${config.categories?.card_gap ?? 24}px` }}
              >
                {categoriesList.length > 0 ? (
                  categoriesList.slice(0, 5).map((cat) => {
                    const catCirclePx =
                      config.categories?.card_width ||
                      (config.categories?.card_size === "sm" ? 88 : config.categories?.card_size === "lg" ? 144 : 112);
                    const catCircleScaled = Math.min(Math.max(Math.round(catCirclePx * 0.78), 60), 125);
                    return (
                      <div key={cat.id} className="flex flex-col items-center shrink-0 transition-all">
                        <div
                          style={{ width: `${catCircleScaled}px`, height: `${catCircleScaled}px` }}
                          className="relative rounded-full overflow-hidden bg-slate-100 border border-slate-200 shadow-sm transition-all"
                        >
                          <img src={cat.image_url || "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=300&q=80"} alt={cat.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="mt-2 text-[11px] font-bold uppercase tracking-wider text-slate-900">
                          {cat.name}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full py-8 text-center text-xs text-slate-400">
                    No categories in database. Add categories in Category Master below.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. Best Sellers Live Preview */}
          {activeTab === "bestsellers" && (
            <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 text-center shadow-xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Storefront Preview</span>
                <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {productsList.filter((p) => p.is_best_seller).length} Products Active
                </span>
              </div>
              <h3
                className="tracking-tight uppercase transition-all mb-4"
                style={{
                  fontFamily: getResolvedFontFamily(config.best_sellers?.heading_font_family),
                  color: config.best_sellers?.heading_color || "#0F172A",
                  fontSize: `${Math.min(parseInt((config.best_sellers?.heading_font_size || "32px").replace("px", ""), 10) || 32, 26)}px`,
                  fontWeight: config.best_sellers?.heading_font_weight || "800",
                }}
              >
                {config.best_sellers?.title || "BEST SELLERS"}
              </h3>
              <div
                className="flex items-stretch justify-start overflow-x-auto py-2 transition-all gap-3 pb-2"
                style={{ gap: `${Math.min(config.best_sellers?.card_gap ?? 20, 24)}px` }}
              >
                {productsList.filter((p) => p.is_best_seller).length > 0 ? (
                  productsList.filter((p) => p.is_best_seller).slice(0, 4).map((prod) => {
                    const img = (prod.images?.[0] as any)?.secure_url || (prod.images?.[0] as any)?.image_url || "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=400&q=80";
                    const bsCardPx =
                      config.best_sellers?.card_width ||
                      (config.best_sellers?.card_size === "sm" ? 200 : config.best_sellers?.card_size === "lg" ? 320 : 260);
                    const bsCardScaled = Math.min(Math.max(Math.round(bsCardPx * 0.58), 110), 200);
                    return (
                      <div
                        key={prod.id}
                        style={{ width: `${bsCardScaled}px` }}
                        className="bg-white border border-slate-200 rounded-xl overflow-hidden text-left shadow-xs shrink-0 flex flex-col justify-between transition-all"
                      >
                        <div>
                          <div className="aspect-[4/5] bg-slate-100 relative overflow-hidden">
                            <img src={img} alt={prod.name} className="w-full h-full object-cover" />
                            <span className="absolute top-1.5 left-1.5 bg-slate-900 text-white text-[8px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded shadow-xs">
                              Best Seller
                            </span>
                          </div>
                          <div className="p-2 space-y-0.5">
                            <p className="text-[11px] font-bold text-slate-900 truncate" title={prod.name}>{prod.name}</p>
                            <p className="text-[11px] font-semibold text-indigo-600">
                              ₹{Number(prod.price).toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                        <div className="p-1.5 pt-0 grid grid-cols-2 gap-1">
                          <span className="text-[8px] font-semibold uppercase py-1 text-center bg-white border border-slate-300 text-slate-800 rounded">Add</span>
                          <span className="text-[8px] font-bold uppercase py-1 text-center bg-slate-900 text-white rounded">Buy</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full py-8 text-center text-xs text-slate-400">
                    No products currently selected for Best Sellers. Select products on the right to show here.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. Middle Banner Live Preview with < and > Controls */}
          {activeTab === "middlebanner" && (
            <div
              style={{ height: config.middle_banner?.height || "340px" }}
              className="w-full max-w-3xl relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 p-8 sm:p-10 text-white shadow-md flex items-center"
            >
              {config.middle_banner?.media_type === "video" || (config.middle_banner?.media_url || "").endsWith(".mp4") ? (
                <video
                  src={config.middle_banner?.media_url || config.middle_banner?.image_url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
              ) : (
                <img
                  src={config.middle_banner?.media_url || config.middle_banner?.image_url || "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1800&q=85"}
                  alt="Middle Promo Banner Preview"
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent pointer-events-none" />

              <div className="relative z-10 max-w-md space-y-2 text-left">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-indigo-300">
                  {config.middle_banner?.eyebrow || "Atelier Edition • Florence"}
                </span>
                <h3 className="text-xl sm:text-2xl font-heading font-extrabold uppercase text-white">
                  {config.middle_banner?.title || "ARCHITECTURAL LEATHER"}
                </h3>
                <p className="text-xs text-slate-200 line-clamp-2">
                  {config.middle_banner?.description ||
                    "Sculpted with uncompromising discipline. Cut from certified full-grain Tuscan calfskin."}
                </p>
                <div className="pt-2">
                  <span className="inline-block px-4 py-2 bg-white text-slate-950 text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm">
                    {config.middle_banner?.button_text || "DISCOVER THE ATELIER"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 6. New In Live Preview */}
          {activeTab === "newin" && (
            <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 text-center shadow-xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Storefront Preview</span>
                <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {productsList.filter((p) => p.is_new_arrival).length} Products Active
                </span>
              </div>
              <h3
                className="tracking-tight uppercase transition-all mb-4"
                style={{
                  fontFamily: getResolvedFontFamily(config.new_in?.heading_font_family),
                  color: config.new_in?.heading_color || "#0F172A",
                  fontSize: `${Math.min(parseInt((config.new_in?.heading_font_size || "32px").replace("px", ""), 10) || 32, 26)}px`,
                  fontWeight: config.new_in?.heading_font_weight || "800",
                }}
              >
                {config.new_in?.title || "NEW IN"}
              </h3>
              <div
                className="flex items-stretch justify-start overflow-x-auto py-2 transition-all gap-3 pb-2"
                style={{ gap: `${Math.min(config.new_in?.card_gap ?? 20, 24)}px` }}
              >
                {productsList.filter((p) => p.is_new_arrival).length > 0 ? (
                  productsList.filter((p) => p.is_new_arrival).slice(0, 4).map((prod) => {
                    const img = (prod.images?.[0] as any)?.secure_url || (prod.images?.[0] as any)?.image_url || "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=400&q=80";
                    const newInCardPx =
                      config.new_in?.card_width ||
                      (config.new_in?.card_size === "sm" ? 200 : config.new_in?.card_size === "lg" ? 320 : 260);
                    const newInCardScaled = Math.min(Math.max(Math.round(newInCardPx * 0.58), 110), 200);
                    return (
                      <div
                        key={prod.id}
                        style={{ width: `${newInCardScaled}px` }}
                        className="bg-white border border-slate-200 rounded-xl overflow-hidden text-left shadow-xs shrink-0 flex flex-col justify-between transition-all"
                      >
                        <div>
                          <div className="aspect-[4/5] bg-slate-100 relative overflow-hidden">
                            <img src={img} alt={prod.name} className="w-full h-full object-cover" />
                            <span className="absolute top-1.5 left-1.5 bg-indigo-600 text-white text-[8px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded shadow-xs">
                              New In
                            </span>
                          </div>
                          <div className="p-2 space-y-0.5">
                            <p className="text-[11px] font-bold text-slate-900 truncate" title={prod.name}>{prod.name}</p>
                            <p className="text-[11px] font-semibold text-indigo-600">
                              ₹{Number(prod.price).toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                        <div className="p-1.5 pt-0 grid grid-cols-2 gap-1">
                          <span className="text-[8px] font-semibold uppercase py-1 text-center bg-white border border-slate-300 text-slate-800 rounded">Add</span>
                          <span className="text-[8px] font-bold uppercase py-1 text-center bg-slate-900 text-white rounded">Buy</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full py-8 text-center text-xs text-slate-400">
                    No products currently selected for New In. Select products on the right to show here.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 7. Seen On You Live Preview */}
          {activeTab === "seenonyou" && (
            <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-xs">
              <h3
                className="tracking-tight uppercase transition-all mb-6"
                style={{
                  fontFamily: getResolvedFontFamily(config.seen_on_you?.heading_font_family),
                  color: config.seen_on_you?.heading_color || "#0F172A",
                  fontSize: `${Math.min(parseInt((config.seen_on_you?.heading_font_size || "32px").replace("px", ""), 10) || 32, 34)}px`,
                  fontWeight: config.seen_on_you?.heading_font_weight || "800",
                }}
              >
                {config.seen_on_you?.title || "SEEN ON YOU"}
              </h3>
              <div
                className="flex items-center justify-center overflow-x-auto py-2 transition-all"
                style={{ gap: `${config.seen_on_you?.card_gap ?? 12}px` }}
              >
                {seenOnYouList.length > 0 ? (
                  seenOnYouList.slice(0, 4).map((reel) => {
                    const reelCardPx =
                      config.seen_on_you?.card_width ||
                      (config.seen_on_you?.card_size === "sm" ? 220 : config.seen_on_you?.card_size === "lg" ? 340 : 280);
                    const reelCardScaled = Math.min(Math.max(Math.round(reelCardPx * 0.48), 95), 180);
                    return (
                      <div
                        key={reel.id}
                        style={{ width: `${reelCardScaled}px` }}
                        className="relative aspect-[9/16] rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0 text-left shadow-xs transition-all"
                      >
                        <img
                          src={reel.thumbnail_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"}
                          alt={reel.customer_name}
                          className="absolute inset-0 w-full h-full object-cover opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                        <div className="absolute bottom-2 left-2 right-2 text-white">
                          <p className="text-[10px] font-bold text-white leading-tight">{reel.customer_name}</p>
                          {reel.caption && (
                            <p className="text-[9px] text-slate-300 line-clamp-1">{reel.caption}</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full py-8 text-center text-xs text-slate-400">
                    No videos in database. Upload videos in Seen On You Manager below.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 8. Customer Reviews Live Preview */}
          {activeTab === "reviews" && (
            <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-xs">
              <h3 className="text-xl sm:text-2xl font-heading font-extrabold uppercase text-slate-900 tracking-tight mb-6">
                {config.customer_reviews?.title || "CUSTOMER REVIEWS"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                {reviewsList.filter((r) => r.status === "active").length > 0 ? (
                  reviewsList
                    .filter((r) => r.status === "active")
                    .slice(0, 4)
                    .map((rev) => (
                      <div key={rev.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 shadow-2xs">
                        <div className="flex text-amber-400 gap-0.5 text-xs">
                          {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                        </div>
                        <p className="text-xs text-slate-700 italic line-clamp-3">&ldquo;{rev.review}&rdquo;</p>
                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <span className="font-bold text-slate-900">{rev.customer_name}</span>
                          {rev.product_name && <span className="text-slate-400 text-[10px]">{rev.product_name}</span>}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="col-span-2 py-8 text-center text-xs text-slate-400">
                    No active reviews in database. Add reviews in Customer Reviews Manager below.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 9. Footer Live Preview */}
          {activeTab === "footer" && (
            <div className="w-full max-w-3xl bg-slate-950 text-white rounded-2xl p-6 sm:p-8 space-y-4 text-center shadow-md">
              <span className="text-xs uppercase tracking-widest text-slate-400 font-bold block">
                {config.footer?.subtitle || "Artisan Handbags • Florence • New York"}
              </span>
              <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
                {config.footer?.story_text ||
                  "Architectural silhouettes, meticulous artisan leatherwork, and timeless aesthetics designed for the modern woman."}
              </p>
              <div className="flex justify-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800">
                <span>Instagram: {config.footer?.instagram_url ? "Connected" : "—"}</span>
                <span>Facebook: {config.footer?.facebook_url ? "Connected" : "—"}</span>
                <span>Pinterest: {config.footer?.pinterest_url ? "Connected" : "—"}</span>
              </div>
            </div>
          )}
        </div>
      </div>
        </div>

        {/* Right Column: Section Controls, Typography, & Embedded Managers */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-6">
          {/* --- 1. TOPBAR / ANNOUNCEMENT BAR --- */}
          {activeTab === "topbar" && (
            <div className="space-y-6">
              <AnnouncementBarManager
                isDraftMode={true}
                onConfigChange={(updated) => {
                  setAnnouncementsData(updated);
                  setPendingAnnouncements(updated);
                }}
              />
            </div>
          )}

        {/* --- 2. HERO BANNER --- */}
        {activeTab === "hero" && (
          <div className="space-y-6">
            <HeroBannerSectionManager
              currentHeight={config.hero?.height || "82vh"}
              onHeightChange={(height) => {
                setConfig((prev) => ({
                  ...prev,
                  hero: { ...prev.hero!, height },
                }));
              }}
              onBannersChange={(banners) => {
                setHeroBanners(banners);
              }}
            />
          </div>
        )}

        {/* --- 3. CATEGORIES --- */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            {/* Category Typography & Gap Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Categories Carousel Typography & Gap Styling
                </h3>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Section Heading Title
                </label>
                <input
                  type="text"
                  value={config.categories?.title || "CATEGORIES"}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      categories: { ...config.categories!, title: e.target.value },
                    })
                  }
                  className="w-full max-w-md px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-bold"
                />
              </div>

              <SectionStyleFields
                title="Categories"
                sampleTitle={config.categories?.title || "CATEGORIES"}
                sectionType="categories"
                values={{
                  heading_color: config.categories?.heading_color || "#0F172A",
                  heading_font_size: config.categories?.heading_font_size || "32px",
                  heading_font_family: config.categories?.heading_font_family || "arial-rounded",
                  heading_font_weight: config.categories?.heading_font_weight || "800",
                  card_gap: config.categories?.card_gap ?? 24,
                  card_size: config.categories?.card_size || "md",
                  card_width: config.categories?.card_width,
                }}
                defaultGap={24}
                onChange={(updates) =>
                  setConfig({
                    ...config,
                    categories: { ...config.categories!, ...updates },
                  })
                }
              />
            </div>

            {/* Embedded Category Master */}
            <CategorySectionManager
              onCategoriesChange={(cats) => {
                setCategoriesList(cats);
              }}
            />
          </div>
        )}

        {/* --- 4. BEST SELLERS --- */}
        {activeTab === "bestsellers" && (
          <div className="space-y-6">
            {/* Typography & Gap Styling */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Best Sellers Typography & Spacing
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Section Heading Title
                  </label>
                  <input
                    type="text"
                    value={config.best_sellers?.title || "BEST SELLERS"}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        best_sellers: { ...config.best_sellers!, title: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    &quot;View All&quot; Link URL
                  </label>
                  <PageLinkSelect
                    value={config.best_sellers?.view_all_link || "/shop?best_seller=true"}
                    onChange={(val) =>
                      setConfig({
                        ...config,
                        best_sellers: { ...config.best_sellers!, view_all_link: val },
                      })
                    }
                  />
                </div>
              </div>

              <SectionStyleFields
                title="Best Sellers"
                sampleTitle={config.best_sellers?.title || "BEST SELLERS"}
                sectionType="products"
                values={{
                  heading_color: config.best_sellers?.heading_color || "#0F172A",
                  heading_font_size: config.best_sellers?.heading_font_size || "32px",
                  heading_font_family: config.best_sellers?.heading_font_family || "arial-rounded",
                  heading_font_weight: config.best_sellers?.heading_font_weight || "800",
                  card_gap: config.best_sellers?.card_gap ?? 20,
                  card_size: config.best_sellers?.card_size || "md",
                  card_width: config.best_sellers?.card_width,
                }}
                defaultGap={20}
                onChange={(updates) =>
                  setConfig({
                    ...config,
                    best_sellers: { ...config.best_sellers!, ...updates },
                  })
                }
              />
            </div>

            {/* Embedded Product Selector for Best Sellers */}
            <ProductSelectorManager
              flag="is_best_seller"
              sectionTitle="Best Sellers"
              isDraftMode={true}
              onDraftToggle={handleDraftProductToggle}
              onProductsUpdated={(prods) => {
                setProductsList(prods);
              }}
            />
          </div>
        )}

        {/* --- 5. MIDDLE BANNER --- */}
        {activeTab === "middlebanner" && (
          <div className="space-y-6">
            <MiddleBannerSectionManager
              data={config.middle_banner!}
              onChange={(updated) => {
                setConfig({
                  ...config,
                  middle_banner: {
                    ...config.middle_banner!,
                    ...updated,
                  },
                });
              }}
            />
          </div>
        )}

        {/* --- 6. NEW IN --- */}
        {activeTab === "newin" && (
          <div className="space-y-6">
            {/* Typography & Gap Styling */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  New In Typography & Spacing
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Section Heading Title
                  </label>
                  <input
                    type="text"
                    value={config.new_in?.title || "NEW IN"}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        new_in: { ...config.new_in!, title: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    &quot;View All&quot; Link URL
                  </label>
                  <PageLinkSelect
                    value={config.new_in?.view_all_link || "/shop?new_arrival=true"}
                    onChange={(val) =>
                      setConfig({
                        ...config,
                        new_in: { ...config.new_in!, view_all_link: val },
                      })
                    }
                  />
                </div>
              </div>

              <SectionStyleFields
                title="New In"
                sampleTitle={config.new_in?.title || "NEW IN"}
                sectionType="products"
                values={{
                  heading_color: config.new_in?.heading_color || "#0F172A",
                  heading_font_size: config.new_in?.heading_font_size || "32px",
                  heading_font_family: config.new_in?.heading_font_family || "arial-rounded",
                  heading_font_weight: config.new_in?.heading_font_weight || "800",
                  card_gap: config.new_in?.card_gap ?? 20,
                  card_size: config.new_in?.card_size || "md",
                  card_width: config.new_in?.card_width,
                }}
                defaultGap={20}
                onChange={(updates) =>
                  setConfig({
                    ...config,
                    new_in: { ...config.new_in!, ...updates },
                  })
                }
              />
            </div>

            {/* Embedded Product Selector for New In */}
            <ProductSelectorManager
              flag="is_new_arrival"
              sectionTitle="New In"
              isDraftMode={true}
              onDraftToggle={handleDraftProductToggle}
              onProductsUpdated={(prods) => {
                setProductsList(prods);
              }}
            />
          </div>
        )}

        {/* --- 7. SEEN ON YOU --- */}
        {activeTab === "seenonyou" && (
          <div className="space-y-6">
            {/* Typography & Gap Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Seen On You Typography & Gap Styling
                </h3>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Section Heading Title
                </label>
                <input
                  type="text"
                  value={config.seen_on_you?.title || "SEEN ON YOU"}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      seen_on_you: { ...config.seen_on_you!, title: e.target.value },
                    })
                  }
                  className="w-full max-w-md px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-bold"
                />
              </div>

              <SectionStyleFields
                title="Seen On You"
                sampleTitle={config.seen_on_you?.title || "SEEN ON YOU"}
                sectionType="videos"
                values={{
                  heading_color: config.seen_on_you?.heading_color || "#0F172A",
                  heading_font_size: config.seen_on_you?.heading_font_size || "32px",
                  heading_font_family: config.seen_on_you?.heading_font_family || "arial-rounded",
                  heading_font_weight: config.seen_on_you?.heading_font_weight || "800",
                  card_gap: config.seen_on_you?.card_gap ?? 12,
                  card_size: config.seen_on_you?.card_size || "md",
                  card_width: config.seen_on_you?.card_width,
                }}
                defaultGap={12}
                onChange={(updates) =>
                  setConfig({
                    ...config,
                    seen_on_you: { ...config.seen_on_you!, ...updates },
                  })
                }
              />
            </div>

            {/* Embedded Seen On You Content Manager */}
            <SeenOnYouManager
              onVideosChange={(vids) => {
                setSeenOnYouList(vids);
              }}
            />
          </div>
        )}

        {/* --- 8. REVIEWS --- */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4 text-left">
              <h3 className="text-sm font-bold text-slate-900">
                Customer Reviews Section Heading
              </h3>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Section Heading Title
                </label>
                <input
                  type="text"
                  value={config.customer_reviews?.title || "CUSTOMER REVIEWS"}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      customer_reviews: { ...config.customer_reviews!, title: e.target.value },
                    })
                  }
                  className="w-full max-w-md px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-bold"
                />
              </div>
            </div>

            {/* Embedded Customer Reviews Database Manager */}
            <ReviewSectionManager
              onReviewsChange={(revs) => {
                setReviewsList(revs);
              }}
            />
          </div>
        )}

        {/* --- 9. FOOTER --- */}
        {activeTab === "footer" && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4 text-left">
            <h3 className="text-sm font-bold text-slate-900">
              Footer Atelier Story & Social Links
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Brand Tagline
              </label>
              <input
                type="text"
                value={config.footer?.subtitle || "Artisan Handbags • Florence • New York"}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    footer: { ...config.footer!, subtitle: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Atelier Story Text
              </label>
              <textarea
                rows={3}
                value={
                  config.footer?.story_text ||
                  "Architectural silhouettes, meticulous artisan leatherwork, and timeless aesthetics designed for the modern woman."
                }
                onChange={(e) =>
                  setConfig({
                    ...config,
                    footer: { ...config.footer!, story_text: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Instagram Link
                </label>
                <input
                  type="text"
                  value={config.footer?.instagram_url || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      footer: { ...config.footer!, instagram_url: e.target.value },
                    })
                  }
                  placeholder="https://instagram.com/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Facebook Link
                </label>
                <input
                  type="text"
                  value={config.footer?.facebook_url || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      footer: { ...config.footer!, facebook_url: e.target.value },
                    })
                  }
                  placeholder="https://facebook.com/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Pinterest Link
                </label>
                <input
                  type="text"
                  value={config.footer?.pinterest_url || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      footer: { ...config.footer!, pinterest_url: e.target.value },
                    })
                  }
                  placeholder="https://pinterest.com/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 font-mono"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);
}
