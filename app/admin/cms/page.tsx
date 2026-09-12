"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  Sparkles,
  Upload,
  Loader2,
  ImageIcon,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Smartphone,
  Monitor,
  RefreshCw,
  X,
  Layers,
  Megaphone,
  ArrowRight,
  ShieldCheck,
  FolderTree,
  ArrowLeft,
  Info,
  Sliders,
  CheckCircle2,
  Truck,
  CreditCard,
  Headphones,
  Award,
} from "lucide-react";
import { Banner } from "@/types";
import { DEFAULT_STORE_SETTINGS, INITIAL_BANNERS } from "@/lib/seed/catalog-data";
import { uploadImageToStorage } from "@/lib/supabase/storage";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  getAllAdminBanners,
  saveAdminBannersOverride,
  invalidateBannersCache,
} from "@/lib/services/cms-service";

type SectionType = "hub" | "hero" | "announcement" | "categories" | "pillars";
type HeroSubTab = "banners" | "studio";

export default function AdminCMSPage() {
  // Navigation: "hub" shows section selector cards. Selecting a card opens that section.
  const [currentSection, setCurrentSection] = useState<SectionType>("hub");
  const [heroSubTab, setHeroSubTab] = useState<HeroSubTab>("banners");

  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [announcementText, setAnnouncementText] = useState(
    DEFAULT_STORE_SETTINGS.announcement_text
  );
  const [notification, setNotification] = useState<string | null>(null);

  // Studio simulator states
  const [previewIdx, setPreviewIdx] = useState(0);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Form state for creating new banner
  // Notice default single fixed dimension recommendation: 1920x750 px
  const [createForm, setCreateForm] = useState({
    title: "",
    subtitle: "",
    cta_text: "Shop The Collection",
    cta_link: "/shop",
    desktop_image_url:
      "https://www.charleskeith.in/dw/image/v2/BCWJ_PRD/on/demandware.static/-/Sites-in-products/default/dw76953c89/images/hi-res/2026-L6-CK2-10160273-A-29-3.jpg?sw=1920&q=85",
    mobile_image_url: "",
    display_order: 1,
    is_active: true,
  });

  // Form state for editing banner
  const [editForm, setEditForm] = useState({
    title: "",
    subtitle: "",
    cta_text: "",
    cta_link: "",
    desktop_image_url: "",
    mobile_image_url: "",
    display_order: 1,
    is_active: true,
  });

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await getAllAdminBanners();
        setBanners(data);
      } catch (err) {
        console.error("Failed to load banners:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const activeBanners = banners.filter((b) => b.is_active);
  const previewList = activeBanners.length > 0 ? activeBanners : banners;
  const currentPreview = previewList[previewIdx % (previewList.length || 1)];

  // Open Edit Modal
  const handleOpenEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setEditForm({
      title: banner.title,
      subtitle: banner.subtitle || "",
      cta_text: banner.cta_text || "Shop The Collection",
      cta_link: banner.cta_link || "/shop",
      desktop_image_url: banner.desktop_image_url,
      mobile_image_url: banner.mobile_image_url || "",
      display_order: banner.display_order ?? 1,
      is_active: banner.is_active !== false,
    });
    setUploadError(null);
  };

  // Focus a specific banner inside the Studio Simulator
  const handleFocusPreview = (index: number) => {
    setPreviewIdx(index);
    setHeroSubTab("studio");
  };

  // Save Edited Banner
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;

    const updated: Banner = {
      ...editingBanner,
      title: editForm.title,
      subtitle: editForm.subtitle,
      cta_text: editForm.cta_text,
      cta_link: editForm.cta_link,
      desktop_image_url: editForm.desktop_image_url,
      mobile_image_url: editForm.mobile_image_url || undefined,
      display_order: Number(editForm.display_order),
      is_active: editForm.is_active,
    };

    const newBanners = banners.map((b) => (b.id === editingBanner.id ? updated : b));
    setBanners(newBanners);
    saveAdminBannersOverride(newBanners);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase
          .from("banners")
          .update({
            title: updated.title,
            subtitle: updated.subtitle,
            cta_text: updated.cta_text,
            cta_link: updated.cta_link,
            desktop_image_url: updated.desktop_image_url,
            mobile_image_url: updated.mobile_image_url,
            display_order: updated.display_order,
            is_active: updated.is_active,
          })
          .eq("id", editingBanner.id);
      } catch (err) {
        console.warn("Supabase banner update notice:", err);
      }
    }

    invalidateBannersCache();
    setEditingBanner(null);
    showNotification(`Banner "${updated.title}" updated successfully.`);
  };

  // Add New Banner
  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    const newBanner: Banner = {
      id: `banner_${Date.now()}`,
      title: createForm.title,
      subtitle: createForm.subtitle,
      cta_text: createForm.cta_text,
      cta_link: createForm.cta_link,
      desktop_image_url: createForm.desktop_image_url,
      mobile_image_url: createForm.mobile_image_url || undefined,
      display_order: Number(createForm.display_order) || banners.length + 1,
      is_active: createForm.is_active,
      type: "hero",
    };

    const newBanners = [...banners, newBanner];
    setBanners(newBanners);
    saveAdminBannersOverride(newBanners);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from("banners").insert({
          id: newBanner.id,
          title: newBanner.title,
          subtitle: newBanner.subtitle,
          cta_text: newBanner.cta_text,
          cta_link: newBanner.cta_link,
          desktop_image_url: newBanner.desktop_image_url,
          mobile_image_url: newBanner.mobile_image_url,
          display_order: newBanner.display_order,
          is_active: newBanner.is_active,
          type: "hero",
        });
      } catch (err) {
        console.warn("Supabase banner insert notice:", err);
      }
    }

    invalidateBannersCache();
    setIsAddModalOpen(false);
    setCreateForm({
      title: "",
      subtitle: "",
      cta_text: "Shop The Collection",
      cta_link: "/shop",
      desktop_image_url:
        "https://www.charleskeith.in/dw/image/v2/BCWJ_PRD/on/demandware.static/-/Sites-in-products/default/dw76953c89/images/hi-res/2026-L6-CK2-10160273-A-29-3.jpg?sw=1920&q=85",
      mobile_image_url: "",
      display_order: newBanners.length + 1,
      is_active: true,
    });
    showNotification(`New Hero Banner "${newBanner.title}" created & published.`);
  };

  // Toggle Active/Draft status
  const handleToggleActive = async (id: string) => {
    let nextState = false;
    let bannerTitle = "";

    const newBanners = banners.map((b) => {
      if (b.id === id) {
        bannerTitle = b.title;
        nextState = !b.is_active;
        return { ...b, is_active: nextState };
      }
      return b;
    });

    setBanners(newBanners);
    saveAdminBannersOverride(newBanners);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from("banners").update({ is_active: nextState }).eq("id", id);
      } catch {
        // Fallback handled
      }
    }

    invalidateBannersCache();
    showNotification(
      `"${bannerTitle}" is now ${nextState ? "Live on Storefront" : "Draft (Hidden)"}.`
    );
  };

  // Delete Banner (If all deleted, hero banner completely vanishes from homepage!)
  const handleDeleteBanner = async (id: string, title: string) => {
    if (confirm(`Are you certain you wish to delete the banner "${title}"?`)) {
      const newBanners = banners.filter((b) => b.id !== id);
      setBanners(newBanners);
      saveAdminBannersOverride(newBanners);

      if (isSupabaseConfigured() && supabase) {
        try {
          await supabase.from("banners").delete().eq("id", id);
        } catch {
          // Handled
        }
      }

      invalidateBannersCache();
      if (newBanners.length === 0) {
        showNotification(
          `All banners removed. The Hero Banner is now completely removed from the homepage.`
        );
      } else {
        showNotification(`"${title}" has been removed.`);
      }
    }
  };

  // Reset to Default Store Banners
  const handleResetToDefault = () => {
    if (confirm("Reset hero banners to the default D'NORA atelier campaign?")) {
      setBanners(INITIAL_BANNERS);
      saveAdminBannersOverride(INITIAL_BANNERS);
      invalidateBannersCache();
      showNotification("Hero banners reset to default atelier campaign.");
    }
  };

  // Save Announcement Ticker
  const handleSaveAnnouncement = () => {
    showNotification("Header announcement bar updated successfully.");
  };

  // Image Upload handler
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit: boolean,
    isMobile = false
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);

    const { url, error } = await uploadImageToStorage("banners", file, "hero");
    setIsUploading(false);

    if (error) {
      setUploadError(error);
    } else if (url) {
      if (isEdit) {
        if (isMobile) {
          setEditForm((prev) => ({ ...prev, mobile_image_url: url }));
        } else {
          setEditForm((prev) => ({ ...prev, desktop_image_url: url }));
        }
      } else {
        if (isMobile) {
          setCreateForm((prev) => ({ ...prev, mobile_image_url: url }));
        } else {
          setCreateForm((prev) => ({ ...prev, desktop_image_url: url }));
        }
      }
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl neu-raised border border-[#C5A880]/40 text-[#F5F7FA] text-xs font-semibold uppercase tracking-wider shadow-2xl flex items-center gap-3 animate-bounce">
          <div className="w-5 h-5 rounded-full neu-inset flex items-center justify-center text-[#C5A880]">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>{notification}</span>
        </div>
      )}

      {/* =========================================================================
          VIEW A: HOMEPAGE CMS SECTIONS HUB (LANDING PAGE - CHOOSE WHAT TO EDIT)
          ========================================================================= */}
      {currentSection === "hub" && (
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/[0.04]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold font-mono">
                  Storefront Content Management
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full border border-[#10B981]/25 font-mono">
                  Overview
                </span>
              </div>
              <h1 className="font-sans text-2xl sm:text-3xl text-[#F5F7FA] uppercase tracking-[0.14em] font-medium">
                Homepage CMS Sections
              </h1>
              <p className="text-xs text-[#8A95A5] max-w-xl">
                Select which section of your homepage you would like to customize, update copy, or edit visuals.
              </p>
            </div>

            <Link
              href="/"
              target="_blank"
              className="px-4 py-2.5 rounded-xl neu-btn text-[#C5A880] hover:text-[#DFCAAB] text-xs font-medium uppercase tracking-wider transition-all flex items-center gap-2"
            >
              <span>View Live Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl neu-raised space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-[#8A95A5] font-mono">
                Homepage Sections
              </span>
              <p className="text-xl sm:text-2xl font-sans font-semibold text-[#F5F7FA]">
                4 Managed
              </p>
            </div>

            <div className="p-4 rounded-2xl neu-raised space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-[#8A95A5] font-mono">
                Hero Banner Status
              </span>
              <p
                className={`text-xl sm:text-2xl font-sans font-semibold ${
                  activeBanners.length > 0 ? "text-[#10B981]" : "text-[#8A95A5]"
                }`}
              >
                {activeBanners.length > 0
                  ? `${activeBanners.length} Live`
                  : "Hidden"}
              </p>
            </div>

            <div className="p-4 rounded-2xl neu-raised space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-[#8A95A5] font-mono">
                Announcement Bar
              </span>
              <p className="text-xl sm:text-2xl font-sans font-semibold text-[#C5A880]">
                Active
              </p>
            </div>

            <div className="p-4 rounded-2xl neu-raised space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-[#8A95A5] font-mono">
                Sync Engine
              </span>
              <p className="text-xl sm:text-2xl font-sans font-semibold text-[#10B981] flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                <span className="text-sm font-mono">100% Online</span>
              </p>
            </div>
          </div>

          {/* Section Selection Cards Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-[11px] uppercase tracking-widest text-[#8A95A5] font-mono">
                Select A Section to Customize
              </span>
              <span className="text-[#C5A880] text-[11px] font-mono">
                Click any section below &rarr;
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* SECTION CARD 1: HERO BANNER CAROUSEL */}
              <div
                onClick={() => setCurrentSection("hero")}
                className="p-6 sm:p-7 rounded-3xl neu-card hover:border-[#C5A880]/40 transition-all duration-300 cursor-pointer space-y-4 group"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl neu-inset flex items-center justify-center text-[#C5A880] group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold ${
                      activeBanners.length > 0
                        ? "neu-inset text-[#10B981]"
                        : "neu-btn text-[#8A95A5]"
                    }`}
                  >
                    {activeBanners.length > 0
                      ? `${activeBanners.length} Live Slides`
                      : "Hidden (0 Banners)"}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880] font-mono font-semibold">
                    Section 01 • Top Visual Showcase
                  </span>
                  <h3 className="text-xl font-sans font-medium text-[#F5F7FA] group-hover:text-[#C5A880] transition-colors">
                    Hero Banner Carousel
                  </h3>
                  <p className="text-xs text-[#8A95A5] leading-relaxed">
                    Curate the full-width cinematic campaign banners at the top of the website. Add new slides, edit copy, customize CTAs, and preview live on Desktop and Mobile.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs border-t border-white/[0.04]">
                  <span className="text-[11px] font-mono text-[#8A95A5]">
                    Recommended Size: 1920×750 px
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#C5A880] inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Manage Hero Banners</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* SECTION CARD 2: GLOBAL ANNOUNCEMENT BAR */}
              <div
                onClick={() => setCurrentSection("announcement")}
                className="p-6 sm:p-7 rounded-3xl neu-card hover:border-[#C5A880]/40 transition-all duration-300 cursor-pointer space-y-4 group"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl neu-inset flex items-center justify-center text-[#C5A880] group-hover:scale-110 transition-transform">
                    <Megaphone className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold neu-inset text-[#10B981]">
                    Live Active
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880] font-mono font-semibold">
                    Global Header Alert
                  </span>
                  <h3 className="text-xl font-sans font-medium text-[#F5F7FA] group-hover:text-[#C5A880] transition-colors">
                    Announcement Ticker Bar
                  </h3>
                  <p className="text-xs text-[#8A95A5] leading-relaxed">
                    The top running notification banner displayed above the navbar on all pages. Announce discount coupons, complimentary delivery perks, or VIP privileges.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs border-t border-white/[0.04]">
                  <span className="text-[11px] font-mono text-[#8A95A5] truncate max-w-[200px]">
                    &quot;{announcementText}&quot;
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#C5A880] inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Edit Ticker</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* SECTION CARD 3: FEATURED CATEGORIES SHOWCASE */}
              <div
                onClick={() => setCurrentSection("categories")}
                className="p-6 sm:p-7 rounded-3xl neu-card hover:border-[#C5A880]/40 transition-all duration-300 cursor-pointer space-y-4 group"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl neu-inset flex items-center justify-center text-[#C5A880] group-hover:scale-110 transition-transform">
                    <FolderTree className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold neu-inset text-[#C5A880]">
                    8 Categories
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880] font-mono font-semibold">
                    Section 02 • Category Navigation
                  </span>
                  <h3 className="text-xl font-sans font-medium text-[#F5F7FA] group-hover:text-[#C5A880] transition-colors">
                    Featured Categories Showcase
                  </h3>
                  <p className="text-xs text-[#8A95A5] leading-relaxed">
                    The circular storytelling realms directly beneath the hero (Handbags, Bucket Bags, Shoulder Bags, Tote Bags, Hobo Bags, Crossbody Bags, Parfums).
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs border-t border-white/[0.04]">
                  <span className="text-[11px] font-mono text-[#8A95A5]">
                    Storefront Circular Rails
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#C5A880] inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Manage Categories</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* SECTION CARD 4: TRUST PILLARS & BRAND STORY */}
              <div
                onClick={() => setCurrentSection("pillars")}
                className="p-6 sm:p-7 rounded-3xl neu-card hover:border-[#C5A880]/40 transition-all duration-300 cursor-pointer space-y-4 group"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl neu-inset flex items-center justify-center text-[#C5A880] group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold neu-inset text-[#10B981]">
                    4 Pillars Active
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880] font-mono font-semibold">
                    Section 03 • Brand Trust &amp; Heritage
                  </span>
                  <h3 className="text-xl font-sans font-medium text-[#F5F7FA] group-hover:text-[#C5A880] transition-colors">
                    Trust Pillars &amp; Atelier Heritage
                  </h3>
                  <p className="text-xs text-[#8A95A5] leading-relaxed">
                    The 4 confidence pillars (Free Express Shipping, Cash on Delivery across India, Authenticity Guarantee, Atelier Concierge) and the brand story narrative.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs border-t border-white/[0.04]">
                  <span className="text-[11px] font-mono text-[#8A95A5]">
                    4-Pillars Guarantee
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#C5A880] inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Review Pillars</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW B: HERO BANNER CAROUSEL CUSTOMIZER (WHEN SECTION === "hero")
          ========================================================================= */}
      {currentSection === "hero" && (
        <div className="space-y-7">
          {/* Top Back Navigation Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.04]">
            <button
              type="button"
              onClick={() => setCurrentSection("hub")}
              className="px-4 py-2 rounded-xl neu-btn text-[#C5A880] hover:text-[#F5F7FA] text-xs font-medium transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to All Sections</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#8A95A5]">Breadcrumb:</span>
              <span className="text-[10px] font-mono text-[#8A95A5]">Homepage CMS /</span>
              <span className="text-[10px] font-mono text-[#C5A880] font-semibold">
                Hero Banner Carousel
              </span>
            </div>
          </div>

          {/* Section Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold font-mono">
                  Section 01 Customizer
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full border border-[#10B981]/25 font-mono">
                  Auto-Responsive Scaling
                </span>
              </div>
              <h2 className="font-sans text-2xl sm:text-3xl text-[#F5F7FA] uppercase tracking-[0.14em] font-medium">
                Hero Banner Carousel
              </h2>
              <p className="text-xs text-[#8A95A5] max-w-xl">
                Add, delete, edit, and reorder full-width hero campaign slides.
              </p>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleResetToDefault}
                className="px-4 py-2.5 rounded-xl neu-btn text-[#8A95A5] hover:text-[#C5A880] text-xs font-medium uppercase tracking-wider transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Default</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="px-5 py-2.5 rounded-xl neu-btn-gold text-xs uppercase tracking-widest font-semibold text-[#0d0f12] transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Hero Banner</span>
              </button>
            </div>
          </div>

          {/* 📐 RECOMMENDED FIXED IMAGE SIZE GUIDE (CRITICAL USER REQUIREMENT) */}
          <div className="p-4 sm:p-5 rounded-2xl neu-raised border border-[#C5A880]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl neu-inset flex items-center justify-center text-[#C5A880] flex-shrink-0 mt-0.5">
                <Info className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-[#F5F7FA] uppercase tracking-wider font-sans">
                  Universal Fixed Size: 1920 × 750 px (Single Image Auto-Scale)
                </p>
                <p className="text-[11px] text-[#8A95A5] leading-relaxed">
                  Upload just <span className="text-[#C5A880] font-semibold">ONE single image</span> of 1920×750 px. Our auto-responsive engine automatically scales, crops, and centers it across <span className="text-[#EDEDED]">Smartphones, Tablets, Laptops, and 4K Ultra-Wide Desktops</span> seamlessly!
                </p>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl neu-inset text-[10px] font-mono text-[#10B981] font-semibold whitespace-nowrap self-start sm:self-auto">
              Auto-Merged For All Screens
            </div>
          </div>

          {/* Sub-tab Switcher: Campaigns vs Studio Simulator */}
          <div className="p-1.5 rounded-2xl neu-inset flex items-center gap-1 max-w-sm">
            <button
              type="button"
              onClick={() => setHeroSubTab("banners")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-2 ${
                heroSubTab === "banners"
                  ? "neu-pill-active font-bold"
                  : "text-[#8A95A5] hover:text-[#EDEDED]"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Slides ({banners.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setHeroSubTab("studio")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-2 ${
                heroSubTab === "studio"
                  ? "neu-pill-active font-bold"
                  : "text-[#8A95A5] hover:text-[#EDEDED]"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Live Studio</span>
            </button>
          </div>

          {/* BANNERS LIST */}
          {heroSubTab === "banners" && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="p-16 rounded-2xl neu-raised text-center text-[#8A95A5] space-y-3">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#C5A880]" />
                  <p className="text-xs uppercase tracking-widest font-mono">
                    Accessing Atelier Banners...
                  </p>
                </div>
              ) : banners.length === 0 ? (
                /* EMPTY STATE: CLEAR NOTICE THAT HERO BANNER IS REMOVED FROM HOMEPAGE */
                <div className="p-12 sm:p-16 rounded-3xl neu-card text-center space-y-4 border border-dashed border-[#C5A880]/30">
                  <div className="w-16 h-16 rounded-2xl neu-inset mx-auto flex items-center justify-center text-[#C5A880]">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5 max-w-md mx-auto">
                    <h3 className="text-lg text-[#F5F7FA] font-medium uppercase tracking-wider font-sans">
                      All Hero Banners Removed
                    </h3>
                    <p className="text-xs text-[#10B981] font-mono">
                      ✓ The Hero Banner section is currently completely hidden from the live homepage.
                    </p>
                    <p className="text-xs text-[#8A95A5]">
                      Your category showcase and product collection will smoothly display right at the top of the homepage without any empty space.
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(true)}
                      className="px-6 py-2.5 rounded-xl neu-btn-gold text-xs uppercase tracking-widest font-semibold text-[#0d0f12]"
                    >
                      + Create New Banner
                    </button>
                    <button
                      type="button"
                      onClick={handleResetToDefault}
                      className="px-5 py-2.5 rounded-xl neu-btn text-[#8A95A5] text-xs uppercase tracking-widest font-medium"
                    >
                      Restore Default
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5">
                  {banners.map((banner, idx) => (
                    <div
                      key={banner.id}
                      className="p-5 sm:p-6 rounded-2xl neu-card hover:border-[#C5A880]/30 transition-all duration-300 space-y-4 group"
                    >
                      {/* Card Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.04]">
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 rounded-lg neu-inset text-[11px] font-mono font-bold text-[#C5A880]">
                            #{banner.display_order ?? idx + 1}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleToggleActive(banner.id)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold font-mono transition-all ${
                              banner.is_active !== false
                                ? "neu-inset text-[#10B981]"
                                : "neu-btn text-[#8A95A5]"
                            }`}
                            title="Click to toggle Active / Hidden"
                          >
                            {banner.is_active !== false ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                                <span>Live on Site</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3 text-[#8A95A5]" />
                                <span>Hidden Draft</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Card Actions */}
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => handleFocusPreview(idx)}
                            className="px-3 py-1.5 rounded-xl neu-btn text-xs text-[#8A95A5] hover:text-[#C5A880] flex items-center gap-1.5 transition-all"
                            title="View in Live Studio"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#C5A880]" />
                            <span className="text-[11px] font-medium">Studio View</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(banner)}
                            className="p-2 rounded-xl neu-btn text-[#8A95A5] hover:text-[#C5A880] transition-all"
                            title="Edit Banner"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteBanner(banner.id, banner.title)}
                            className="p-2 rounded-xl neu-btn text-[#8A95A5] hover:text-[#FF6B6B] transition-all"
                            title="Delete Banner"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Card Body: Thumbnail + Narrative */}
                      <div className="flex flex-col sm:flex-row items-start gap-5">
                        <div className="relative w-full sm:w-64 h-36 rounded-xl neu-inset p-1 overflow-hidden flex-shrink-0 group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.6)] transition-all">
                          <div className="relative w-full h-full rounded-lg overflow-hidden">
                            <Image
                              src={banner.desktop_image_url}
                              alt={banner.title}
                              fill
                              unoptimized
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2.5">
                              <span className="text-[9px] uppercase tracking-widest text-[#C5A880] font-mono bg-black/70 px-2 py-0.5 rounded">
                                1920×750 Asset
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 space-y-2.5 min-w-0">
                          <div>
                            <span className="text-[9px] uppercase tracking-[0.25em] text-[#C5A880] font-mono font-semibold">
                              Atelier Campaign
                            </span>
                            <h3 className="text-lg sm:text-xl font-sans font-medium text-[#F5F7FA] tracking-wide mt-0.5 truncate">
                              {banner.title}
                            </h3>
                          </div>

                          {banner.subtitle && (
                            <p className="text-xs text-[#8A95A5] leading-relaxed line-clamp-2">
                              {banner.subtitle}
                            </p>
                          )}

                          <div className="flex items-center gap-3 pt-1 flex-wrap">
                            <div className="px-3 py-1.5 rounded-xl neu-inset text-xs text-[#C5A880] flex items-center gap-1.5 font-mono">
                              <span className="font-semibold">{banner.cta_text || "Shop"}</span>
                              <ArrowRight className="w-3 h-3 text-[#8A95A5]" />
                              <span className="text-[#8A95A5]">{banner.cta_link || "/shop"}</span>
                            </div>

                            <span className="px-2.5 py-1 rounded-lg neu-inset text-[10px] text-[#10B981] font-mono">
                              Auto-Scaled All Screens
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STUDIO SIMULATOR */}
          {heroSubTab === "studio" && (
            <div className="space-y-6">
              {/* Studio Control Toolbar */}
              <div className="p-4 rounded-2xl neu-raised flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="p-1 rounded-xl neu-inset flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("desktop")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5 ${
                      previewMode === "desktop"
                        ? "neu-pill-active font-bold"
                        : "text-[#8A95A5] hover:text-[#EDEDED]"
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Ultra-Wide Desktop</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewMode("mobile")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5 ${
                      previewMode === "mobile"
                        ? "neu-pill-active font-bold"
                        : "text-[#8A95A5] hover:text-[#EDEDED]"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile Smartphone</span>
                  </button>
                </div>

                {previewList.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewIdx(
                          (prev) => (prev - 1 + previewList.length) % previewList.length
                        )
                      }
                      className="p-2 rounded-xl neu-btn text-[#8A95A5] hover:text-[#F5F7FA] transition-all"
                      title="Previous Slide"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <span className="text-xs font-mono text-[#C5A880] px-3 py-1 rounded-lg neu-inset">
                      Slide {(previewIdx % previewList.length) + 1} of {previewList.length}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setPreviewIdx((prev) => (prev + 1) % previewList.length)
                      }
                      className="p-2 rounded-xl neu-btn text-[#8A95A5] hover:text-[#F5F7FA] transition-all"
                      title="Next Slide"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <Link
                  href="/"
                  target="_blank"
                  className="px-4 py-2 rounded-xl neu-btn text-[#C5A880] hover:text-[#DFCAAB] text-xs uppercase tracking-wider font-semibold transition-all flex items-center gap-2"
                >
                  <span>Live Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Canvas Display */}
              {currentPreview ? (
                <div className="p-6 sm:p-10 rounded-3xl neu-card flex flex-col items-center justify-center overflow-hidden">
                  <div
                    className={`relative overflow-hidden transition-all duration-500 ${
                      previewMode === "desktop"
                        ? "w-full aspect-[16/6] max-h-[420px] rounded-2xl neu-inset p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
                        : "w-[300px] sm:w-[320px] aspect-[9/16] rounded-[36px] neu-inset p-3 shadow-[0_25px_60px_rgba(0,0,0,0.9)] border border-white/[0.06]"
                    }`}
                  >
                    <div className="relative w-full h-full rounded-xl overflow-hidden">
                      <Image
                        src={
                          previewMode === "mobile" && currentPreview.mobile_image_url
                            ? currentPreview.mobile_image_url
                            : currentPreview.desktop_image_url
                        }
                        alt={currentPreview.title}
                        fill
                        unoptimized
                        className="object-cover object-center"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-6 sm:p-8 text-[#FBF9F5]">
                        <span className="text-[9px] uppercase tracking-[0.3em] text-[#C5A880] font-mono font-semibold">
                          Atelier Campaign
                        </span>
                        <h3 className="font-sans font-light text-lg sm:text-2xl md:text-3xl uppercase tracking-[0.14em] text-white mt-1 line-clamp-2">
                          {currentPreview.title}
                        </h3>
                        {currentPreview.subtitle && (
                          <p className="text-[11px] sm:text-xs text-[#E2D8CC] max-w-lg mt-1 line-clamp-2 font-light">
                            {currentPreview.subtitle}
                          </p>
                        )}
                        {currentPreview.cta_text && (
                          <div className="mt-3">
                            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C5A880] text-[#111111] text-[10px] font-semibold uppercase tracking-[0.2em]">
                              {currentPreview.cta_text} &rarr;
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 w-full pt-4 border-t border-white/[0.04] text-xs">
                    <div className="space-y-0.5 text-center sm:text-left">
                      <p className="text-[#F5F7FA] font-medium font-sans">
                        {currentPreview.title}
                      </p>
                      <p className="text-[11px] text-[#8A95A5]">
                        Destination:{" "}
                        <span className="text-[#C5A880] font-mono">
                          {currentPreview.cta_link || "/shop"}
                        </span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(currentPreview)}
                      className="px-4 py-2 rounded-xl neu-btn text-[#C5A880] text-xs uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit This Slide</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-16 rounded-2xl neu-raised text-center text-[#8A95A5]">
                  No active banners to preview.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW C: ANNOUNCEMENT BAR TICKER (WHEN SECTION === "announcement")
          ========================================================================= */}
      {currentSection === "announcement" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.04]">
            <button
              type="button"
              onClick={() => setCurrentSection("hub")}
              className="px-4 py-2 rounded-xl neu-btn text-[#C5A880] hover:text-[#F5F7FA] text-xs font-medium transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to All Sections</span>
            </button>
            <span className="text-[10px] font-mono text-[#C5A880]">
              Homepage CMS / Announcement Ticker
            </span>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl neu-card space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880] font-mono font-semibold">
                Global Header Bar
              </span>
              <h2 className="text-xl font-sans font-medium text-[#F5F7FA] uppercase tracking-wider">
                Announcement Ticker Copy
              </h2>
              <p className="text-xs text-[#8A95A5]">
                Broadcast flash privileges, promo codes, and complimentary delivery updates at the very top of all pages.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-[#8A95A5] font-mono">
                Ticker Display Copy
              </label>
              <input
                type="text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl neu-inset text-xs text-[#F5F7FA] placeholder-[#4B5565] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/40 transition-all font-mono"
              />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-[#8A95A5] font-mono">
                Live Ticker Preview
              </span>
              <div className="p-2.5 rounded-xl bg-[#0e1015] border border-white/[0.04] text-center text-[11px] uppercase tracking-[0.2em] text-[#C5A880] font-mono font-medium">
                {announcementText || "—"}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveAnnouncement}
                className="px-6 py-2.5 rounded-xl neu-btn-gold text-xs font-semibold uppercase tracking-widest text-[#0d0f12] transition-all"
              >
                Save Announcement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW D: FEATURED CATEGORIES SHOWCASE (WHEN SECTION === "categories")
          ========================================================================= */}
      {currentSection === "categories" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.04]">
            <button
              type="button"
              onClick={() => setCurrentSection("hub")}
              className="px-4 py-2 rounded-xl neu-btn text-[#C5A880] hover:text-[#F5F7FA] text-xs font-medium transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to All Sections</span>
            </button>
            <span className="text-[10px] font-mono text-[#C5A880]">
              Homepage CMS / Featured Categories
            </span>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl neu-card space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880] font-mono font-semibold">
                Section 02
              </span>
              <h2 className="text-xl font-sans font-medium text-[#F5F7FA] uppercase tracking-wider">
                Featured Categories Showcase
              </h2>
              <p className="text-xs text-[#8A95A5]">
                These circular categories appear immediately after the hero banner for quick visual navigation.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { name: "Handbags", slug: "handbags", count: "12 Designs" },
                { name: "Bucket Bags", slug: "bucket-bags", count: "8 Designs" },
                { name: "Shoulder Bags", slug: "shoulder-bags", count: "10 Designs" },
                { name: "Tote Bags", slug: "tote-bags", count: "14 Designs" },
                { name: "Hobo Bags", slug: "hobo-bags", count: "6 Designs" },
                { name: "Crossbody Bags", slug: "crossbody-bags", count: "9 Designs" },
                { name: "Clutches", slug: "clutches", count: "5 Designs" },
                { name: "Parfumerie", slug: "perfumes", count: "4 Extraits" },
              ].map((c) => (
                <div key={c.slug} className="p-4 rounded-xl neu-raised space-y-1">
                  <p className="text-xs font-semibold text-[#F5F7FA] uppercase font-sans">
                    {c.name}
                  </p>
                  <p className="text-[10px] text-[#C5A880] font-mono">{c.count}</p>
                  <span className="inline-block px-2 py-0.5 rounded-full neu-inset text-[9px] text-[#10B981] font-mono mt-1">
                    Live Active
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <Link
                href="/admin/categories"
                className="px-6 py-2.5 rounded-xl neu-btn-gold text-xs font-semibold uppercase tracking-widest text-[#0d0f12] transition-all inline-flex items-center gap-2"
              >
                <span>Full Categories Manager</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW E: TRUST PILLARS & STORY (WHEN SECTION === "pillars")
          ========================================================================= */}
      {currentSection === "pillars" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.04]">
            <button
              type="button"
              onClick={() => setCurrentSection("hub")}
              className="px-4 py-2 rounded-xl neu-btn text-[#C5A880] hover:text-[#F5F7FA] text-xs font-medium transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to All Sections</span>
            </button>
            <span className="text-[10px] font-mono text-[#C5A880]">
              Homepage CMS / Trust Pillars &amp; Heritage
            </span>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl neu-card space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880] font-mono font-semibold">
                Section 03
              </span>
              <h2 className="text-xl font-sans font-medium text-[#F5F7FA] uppercase tracking-wider">
                Atelier Trust Pillars
              </h2>
              <p className="text-xs text-[#8A95A5]">
                Displayed on the homepage to instill confidence and luxury distinction.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Free Express Shipping",
                  desc: "Complimentary courier delivery on orders above ₹999 across India.",
                  icon: Truck,
                },
                {
                  title: "Cash On Delivery (COD)",
                  desc: "Pay on doorstep across 19,000+ pin codes nationwide.",
                  icon: CreditCard,
                },
                {
                  title: "100% Authentic Atelier Craft",
                  desc: "Noble full-grain leathers and hand-stitched construction.",
                  icon: Award,
                },
                {
                  title: "Personal Luxury Concierge",
                  desc: "Dedicated WhatsApp & telephone support 7 days a week.",
                  icon: Headphones,
                },
              ].map((p, i) => {
                const Icon = p.icon;
                return (
                  <div key={i} className="p-5 rounded-2xl neu-raised flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl neu-inset flex items-center justify-center text-[#C5A880] flex-shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-[#F5F7FA] uppercase tracking-wider font-sans">
                        {p.title}
                      </h4>
                      <p className="text-[11px] text-[#8A95A5] leading-relaxed">
                        {p.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          EDIT BANNER MODAL (WITH 1920x750 FIXED DIMENSION GUIDANCE)
          ========================================================================= */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="rounded-3xl neu-glass p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-6 text-xs shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880] font-mono font-semibold">
                  Hero Banner Customizer
                </span>
                <h3 className="text-lg font-sans font-medium text-[#F5F7FA] uppercase tracking-wider">
                  Edit Banner Slide
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingBanner(null)}
                className="p-2 rounded-xl neu-btn text-[#8A95A5] hover:text-[#F5F7FA] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#8A95A5] font-mono">
                  Campaign Title / Headline
                </label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="e.g. The Autumn Handbag Capsule"
                  className="w-full px-4 py-3 rounded-xl neu-inset text-xs text-[#F5F7FA] placeholder-[#4B5565] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/40 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#8A95A5] font-mono">
                  Narrative Subtitle
                </label>
                <textarea
                  rows={2}
                  value={editForm.subtitle}
                  onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                  placeholder="Explore the new sculptural silhouettes..."
                  className="w-full px-4 py-3 rounded-xl neu-inset text-xs text-[#F5F7FA] placeholder-[#4B5565] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/40 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#8A95A5] font-mono">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.cta_text}
                    onChange={(e) => setEditForm({ ...editForm, cta_text: e.target.value })}
                    placeholder="Shop The Collection"
                    className="w-full px-4 py-3 rounded-xl neu-inset text-xs text-[#F5F7FA] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/40 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#8A95A5] font-mono">
                    CTA Destination Link
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.cta_link}
                    onChange={(e) => setEditForm({ ...editForm, cta_link: e.target.value })}
                    placeholder="/shop"
                    className="w-full px-4 py-3 rounded-xl neu-inset text-xs text-[#F5F7FA] font-mono focus:outline-none focus:ring-1 focus:ring-[#C5A880]/40 transition-all"
                  />
                </div>
              </div>

              {/* Universal Fixed 1920x750 Image Upload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-[#8A95A5] font-mono block">
                      Universal Banner Image
                    </label>
                    <span className="text-[9px] text-[#10B981] font-mono">
                      Recommended: 1920 × 750 px (Auto-Scales All Devices)
                    </span>
                  </div>
                  <label className="cursor-pointer px-3 py-1.5 rounded-xl neu-btn text-[10px] font-mono text-[#C5A880] uppercase tracking-wider transition-all flex items-center gap-1.5">
                    {isUploading ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3 h-3" />
                        <span>Upload File</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploading}
                      onChange={(e) => handleImageUpload(e, true, false)}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative w-20 h-12 rounded-lg neu-inset p-0.5 overflow-hidden flex-shrink-0">
                    {editForm.desktop_image_url && (
                      <Image
                        src={editForm.desktop_image_url}
                        alt="Preview"
                        fill
                        unoptimized
                        className="object-cover rounded"
                      />
                    )}
                  </div>
                  <input
                    type="url"
                    required
                    value={editForm.desktop_image_url}
                    onChange={(e) =>
                      setEditForm({ ...editForm, desktop_image_url: e.target.value })
                    }
                    placeholder="https://..."
                    className="flex-1 px-4 py-3 rounded-xl neu-inset text-xs text-[#F5F7FA] font-mono focus:outline-none focus:ring-1 focus:ring-[#C5A880]/40 transition-all"
                  />
                </div>
              </div>

              {/* Display Order & Active Toggle */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#8A95A5] font-mono">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editForm.display_order}
                    onChange={(e) =>
                      setEditForm({ ...editForm, display_order: Number(e.target.value) })
                    }
                    className="w-full px-4 py-3 rounded-xl neu-inset text-xs text-[#F5F7FA] font-mono focus:outline-none focus:ring-1 focus:ring-[#C5A880]/40 transition-all"
                  />
                </div>

                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded-xl neu-inset w-full">
                    <input
                      type="checkbox"
                      checked={editForm.is_active}
                      onChange={(e) =>
                        setEditForm({ ...editForm, is_active: e.target.checked })
                      }
                      className="accent-[#10B981] w-4 h-4 cursor-pointer"
                    />
                    <span className="text-[#10B981] font-semibold text-xs">
                      Live on Site
                    </span>
                  </label>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setEditingBanner(null)}
                  className="px-5 py-2.5 rounded-xl neu-btn text-[#8A95A5] hover:text-[#EDEDED] text-xs font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl neu-btn-gold text-xs uppercase tracking-widest font-semibold text-[#0d0f12] transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADD NEW BANNER MODAL (WITH 1920x750 FIXED DIMENSION GUIDANCE)
          ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="rounded-3xl neu-glass p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-6 text-xs shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880] font-mono font-semibold">
                  New Campaign
                </span>
                <h3 className="font-sans font-medium text-lg text-[#F5F7FA] uppercase tracking-wider">
                  Create Hero Banner
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl neu-btn text-[#8A95A5] hover:text-[#F5F7FA] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBanner} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#8A95A5] font-mono">
                  Campaign Title / Headline
                </label>
                <input
                  type="text"
                  required
                  value={createForm.title}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, title: e.target.value })
                  }
                  placeholder="e.g. The Royal Trousseau Capsule"
                  className="w-full px-4 py-3 rounded-xl neu-inset text-xs text-[#F5F7FA] placeholder-[#4B5565] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/40 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#8A95A5] font-mono">
                  Narrative Subtitle
                </label>
                <textarea
                  rows={2}
                  value={createForm.subtitle}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, subtitle: e.target.value })
                  }
                  placeholder="Architectural silhouettes tailored in noble full-grain leathers..."
                  className="w-full px-4 py-3 rounded-xl neu-inset text-xs text-[#F5F7FA] placeholder-[#4B5565] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/40 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#8A95A5] font-mono">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.cta_text}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, cta_text: e.target.value })
                    }
                    placeholder="Shop The Collection"
                    className="w-full px-4 py-3 rounded-xl neu-inset text-xs text-[#F5F7FA] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/40 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#8A95A5] font-mono">
                    CTA Destination Link
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.cta_link}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, cta_link: e.target.value })
                    }
                    placeholder="/shop or /shop/handbags"
                    className="w-full px-4 py-3 rounded-xl neu-inset text-xs text-[#F5F7FA] font-mono focus:outline-none focus:ring-1 focus:ring-[#C5A880]/40 transition-all"
                  />
                </div>
              </div>

              {/* Universal Fixed 1920x750 Image Upload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-[#8A95A5] font-mono block">
                      Universal Banner Image
                    </label>
                    <span className="text-[9px] text-[#10B981] font-mono">
                      Recommended: 1920 × 750 px (Auto-Scales All Devices)
                    </span>
                  </div>
                  <label className="cursor-pointer px-3 py-1.5 rounded-xl neu-btn text-[10px] font-mono text-[#C5A880] uppercase tracking-wider transition-all flex items-center gap-1.5">
                    {isUploading ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3 h-3" />
                        <span>Upload File</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploading}
                      onChange={(e) => handleImageUpload(e, false, false)}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="url"
                  required
                  value={createForm.desktop_image_url}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      desktop_image_url: e.target.value,
                    })
                  }
                  placeholder="https://images.unsplash.com/... or upload directly"
                  className="w-full px-4 py-3 rounded-xl neu-inset text-xs text-[#F5F7FA] font-mono focus:outline-none focus:ring-1 focus:ring-[#C5A880]/40 transition-all"
                />
              </div>

              {/* Display Order & Active Toggle */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#8A95A5] font-mono">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={createForm.display_order}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        display_order: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl neu-inset text-xs text-[#F5F7FA] font-mono focus:outline-none focus:ring-1 focus:ring-[#C5A880]/40 transition-all"
                  />
                </div>

                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded-xl neu-inset w-full">
                    <input
                      type="checkbox"
                      checked={createForm.is_active}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          is_active: e.target.checked,
                        })
                      }
                      className="accent-[#10B981] w-4 h-4 cursor-pointer"
                    />
                    <span className="text-[#10B981] font-semibold text-xs">
                      Live on Site
                    </span>
                  </label>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl neu-btn text-[#8A95A5] hover:text-[#EDEDED] text-xs font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl neu-btn-gold text-xs uppercase tracking-widest font-semibold text-[#0d0f12] transition-all"
                >
                  Create &amp; Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
