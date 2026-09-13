"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Film,
  Video,
} from "lucide-react";
import { Banner, Category } from "@/types";
import { DEFAULT_STORE_SETTINGS } from "@/lib/seed/catalog-data";
import { uploadImageToStorage } from "@/lib/supabase/storage";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  getAllAdminBanners,
  saveAdminBannersOverride,
  invalidateBannersCache,
} from "@/lib/services/cms-service";
import { getAllAdminCategories } from "@/lib/services/catalog-service";

type SectionType = "hub" | "hero" | "announcement" | "categories" | "pillars";
type HeroSubTab = "banners" | "studio";

export const STOREFRONT_DESTINATIONS = [
  { value: "/shop", label: "All Creations / Entire Catalog (/shop)", defaultText: "Shop The Collection" },
  { value: "/shop?filter=new", label: "New Arrivals Showcase (/shop?filter=new)", defaultText: "Explore New Arrivals" },
  { value: "/shop?filter=bestseller", label: "Bestsellers Showcase (/shop?filter=bestseller)", defaultText: "Discover Bestsellers" },
  { value: "/about", label: "Atelier Heritage & Craft (/about)", defaultText: "Discover Our Heritage" },
  { value: "/contact", label: "Client Concierge (/contact)", defaultText: "Connect With Concierge" },
  { value: "/faq", label: "Authenticity & Advisory (/faq)", defaultText: "View Client Advisory" },
];

export default function AdminCMSPage() {
  const router = useRouter();
  // Navigation: "hub" shows section selector cards. Selecting a card opens that section.
  const [currentSection, setCurrentSection] = useState<SectionType>("hub");
  const [heroSubTab, setHeroSubTab] = useState<HeroSubTab>("banners");

  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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
  const [createMediaType, setCreateMediaType] = useState<"image" | "video">("image");
  const [createForm, setCreateForm] = useState({
    title: "",
    subtitle: "",
    cta_text: "Shop The Collection",
    cta_link: "/shop",
    desktop_image_url: "",
    mobile_image_url: "",
    video_url: "",
    display_order: 1,
    is_active: true,
  });

  // Form state for editing banner
  const [editMediaType, setEditMediaType] = useState<"image" | "video">("image");
  const [editForm, setEditForm] = useState({
    title: "",
    subtitle: "",
    cta_text: "",
    cta_link: "",
    desktop_image_url: "",
    mobile_image_url: "",
    video_url: "",
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
        const [bannersData, categoriesData] = await Promise.all([
          getAllAdminBanners(),
          getAllAdminCategories(),
        ]);
        setBanners(bannersData);
        setCategories(categoriesData);
      } catch (err) {
        console.error("Failed to load CMS data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const isKnownDestination = (link: string) => {
    return (
      STOREFRONT_DESTINATIONS.some((d) => d.value === link) ||
      categories.some((c) => `/shop/${c.slug}` === link)
    );
  };

  const getDestinationDefaultText = (link: string) => {
    const preset = STOREFRONT_DESTINATIONS.find((d) => d.value === link);
    if (preset) return preset.defaultText;
    const cat = categories.find((c) => `/shop/${c.slug}` === link);
    if (cat) return `Explore ${cat.name}`;
    return "Shop Now";
  };

  const activeBanners = banners.filter((b) => b.is_active);
  const previewList = activeBanners.length > 0 ? activeBanners : banners;
  const currentPreview = previewList[previewIdx % (previewList.length || 1)];

  // Open Edit Modal
  const handleOpenEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setEditMediaType(banner.video_url ? "video" : "image");
    setEditForm({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      cta_text: banner.cta_text || "Shop The Collection",
      cta_link: banner.cta_link || "/shop",
      desktop_image_url: banner.desktop_image_url,
      mobile_image_url: banner.mobile_image_url || "",
      video_url: banner.video_url || "",
      display_order: banner.display_order ?? 1,
      is_active: banner.is_active !== false,
    });
    setUploadError(null);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setCreateMediaType("image");
    setCreateForm({
      title: "",
      subtitle: "",
      cta_text: "Shop The Collection",
      cta_link: "/shop",
      desktop_image_url: "",
      mobile_image_url: "",
      video_url: "",
      display_order: banners.length + 1,
      is_active: true,
    });
    setUploadError(null);
    setIsAddModalOpen(true);
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

    const finalVideoUrl =
      editMediaType === "video" && editForm.video_url?.trim()
        ? editForm.video_url.trim()
        : undefined;

    const updated: Banner = {
      ...editingBanner,
      title: editForm.title,
      subtitle: editForm.subtitle,
      cta_text: editForm.cta_text,
      cta_link: editForm.cta_link,
      desktop_image_url: editForm.desktop_image_url,
      mobile_image_url: editForm.mobile_image_url || undefined,
      video_url: finalVideoUrl,
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
            video_url: updated.video_url || null,
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
    const newBannerId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, "0")}`;

    const finalVideoUrl =
      createMediaType === "video" && createForm.video_url?.trim()
        ? createForm.video_url.trim()
        : undefined;

    const newBanner: Banner = {
      id: newBannerId,
      title: createForm.title,
      subtitle: createForm.subtitle,
      cta_text: createForm.cta_text,
      cta_link: createForm.cta_link,
      desktop_image_url: createForm.desktop_image_url,
      mobile_image_url: createForm.mobile_image_url || undefined,
      video_url: finalVideoUrl,
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
          video_url: newBanner.video_url || null,
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
      desktop_image_url: "",
      mobile_image_url: "",
      video_url: "",
      display_order: newBanners.length + 1,
      is_active: true,
    });
    setCreateMediaType("image");
    showNotification(`New Hero Banner "${newBanner.title}" created & published.`);
  };

  // Toggle Active/Draft status
  const handleToggleActive = async (id: string) => {
    let nextState = false;
    let bannerTitle = "";

    const newBanners = banners.map((b) => {
      if (b.id === id) {
        bannerTitle = b.title || "Banner";
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

  // Refresh Hero Banners directly from Supabase Database
  const handleRefreshBanners = async () => {
    setIsLoading(true);
    try {
      invalidateBannersCache();
      const b = await getAllAdminBanners();
      setBanners(b);
      showNotification("Hero banners refreshed from database.");
    } catch {
      showNotification("Failed to refresh hero banners.");
    } finally {
      setIsLoading(false);
    }
  };

  // Save Announcement Ticker
  const handleSaveAnnouncement = () => {
    showNotification("Header announcement bar updated successfully.");
  };

  // Media Upload handler (Supports Image & Video with offline preview fallback)
  const handleMediaUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit: boolean,
    mediaType: "image" | "video"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);

    let finalUrl: string | null = null;
    if (isSupabaseConfigured() && supabase) {
      const folder = mediaType === "video" ? "hero-videos" : "hero";
      const { url, error } = await uploadImageToStorage("banners", file, folder);
      if (error) {
        console.warn("Storage upload notice:", error);
      } else if (url) {
        finalUrl = url;
      }
    }

    // Fallback: create an object URL so user can preview and test immediately
    if (!finalUrl) {
      finalUrl = URL.createObjectURL(file);
    }

    setIsUploading(false);

    if (finalUrl) {
      if (isEdit) {
        if (mediaType === "video") {
          setEditForm((prev) => ({ ...prev, video_url: finalUrl! }));
        } else {
          setEditForm((prev) => ({ ...prev, desktop_image_url: finalUrl! }));
        }
      } else {
        if (mediaType === "video") {
          setCreateForm((prev) => ({ ...prev, video_url: finalUrl! }));
        } else {
          setCreateForm((prev) => ({ ...prev, desktop_image_url: finalUrl! }));
        }
      }
      showNotification(`${mediaType === "video" ? "Video" : "Image"} ready for preview!`);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl neu-raised bg-white border border-[#C5A880]/50 text-[#0F172A] text-xs font-semibold uppercase tracking-wider shadow-2xl flex items-center gap-3 animate-bounce">
          <div className="w-5 h-5 rounded-full neu-inset bg-[#F1F5F9] flex items-center justify-center text-[#9E7D4E]">
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
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#9E7D4E] font-semibold font-mono">
                  Storefront Content Management
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full border border-[#10B981]/25 font-mono font-medium">
                  Overview
                </span>
              </div>
              <h1 className="font-sans text-2xl sm:text-3xl text-[#0F172A] uppercase tracking-[0.14em] font-bold">
                Homepage CMS Sections
              </h1>
              <p className="text-xs text-[#475569] max-w-xl">
                Select which section of your homepage you would like to customize, update copy, or edit visuals.
              </p>
            </div>

            <Link
              href="/"
              target="_blank"
              className="px-4 py-2.5 rounded-xl neu-btn text-[#0F172A] hover:text-[#9E7D4E] text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2"
            >
              <span>View Live Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl neu-raised bg-white border border-slate-200/60 space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-[#64748B] font-mono">
                Homepage Sections
              </span>
              <p className="text-xl sm:text-2xl font-sans font-bold text-[#0F172A]">
                4 Managed
              </p>
            </div>

            <div className="p-4 rounded-2xl neu-raised bg-white border border-slate-200/60 space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-[#64748B] font-mono">
                Hero Banner Status
              </span>
              <p
                className={`text-xl sm:text-2xl font-sans font-bold ${
                  activeBanners.length > 0 ? "text-[#10B981]" : "text-[#64748B]"
                }`}
              >
                {activeBanners.length > 0
                  ? `${activeBanners.length} Live`
                  : "Hidden"}
              </p>
            </div>

            <div className="p-4 rounded-2xl neu-raised bg-white border border-slate-200/60 space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-[#64748B] font-mono">
                Announcement Bar
              </span>
              <p className="text-xl sm:text-2xl font-sans font-bold text-[#9E7D4E]">
                Active
              </p>
            </div>

            <div className="p-4 rounded-2xl neu-raised bg-white border border-slate-200/60 space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-[#64748B] font-mono">
                Sync Engine
              </span>
              <p className="text-xl sm:text-2xl font-sans font-bold text-[#10B981] flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                <span className="text-sm font-mono">100% Online</span>
              </p>
            </div>
          </div>

          {/* Section Selection Cards Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-[11px] uppercase tracking-widest text-[#475569] font-mono font-semibold">
                Select A Section to Customize
              </span>
              <span className="text-[#9E7D4E] text-[11px] font-mono font-semibold">
                Click any section below &rarr;
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* SECTION CARD 1: HERO BANNER CAROUSEL */}
              <div
                onClick={() => router.push("/admin/cms/hero")}
                className="p-6 sm:p-7 rounded-3xl neu-card bg-white border border-slate-200/80 hover:border-[#C5A880]/60 transition-all duration-300 cursor-pointer space-y-4 group"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl neu-inset bg-[#F1F5F9] flex items-center justify-center text-[#9E7D4E] group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold ${
                      activeBanners.length > 0
                        ? "neu-inset bg-[#F1F5F9] text-[#10B981]"
                        : "neu-btn text-[#64748B]"
                    }`}
                  >
                    {activeBanners.length > 0
                      ? `${activeBanners.length} Live Slides`
                      : "Hidden (0 Banners)"}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#9E7D4E] font-mono font-semibold">
                    Section 01 • Top Visual Showcase
                  </span>
                  <h3 className="text-xl font-sans font-bold text-[#0F172A] group-hover:text-[#9E7D4E] transition-colors">
                    Hero Banner Carousel
                  </h3>
                  <p className="text-xs text-[#475569] leading-relaxed">
                    Curate the full-width cinematic campaign banners at the top of the website. Add new slides, edit copy, customize CTAs, and preview live on Desktop and Mobile.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-200/80">
                  <span className="text-[11px] font-mono text-[#64748B]">
                    Recommended Size: 1920×750 px
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#9E7D4E] inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Manage Hero Banners</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* SECTION CARD 2: GLOBAL ANNOUNCEMENT BAR */}
              <div
                onClick={() => setCurrentSection("announcement")}
                className="p-6 sm:p-7 rounded-3xl neu-card bg-white border border-slate-200/80 hover:border-[#C5A880]/60 transition-all duration-300 cursor-pointer space-y-4 group"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl neu-inset bg-[#F1F5F9] flex items-center justify-center text-[#9E7D4E] group-hover:scale-110 transition-transform">
                    <Megaphone className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold neu-inset bg-[#F1F5F9] text-[#10B981]">
                    Live Active
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#9E7D4E] font-mono font-semibold">
                    Global Header Alert
                  </span>
                  <h3 className="text-xl font-sans font-bold text-[#0F172A] group-hover:text-[#9E7D4E] transition-colors">
                    Announcement Ticker Bar
                  </h3>
                  <p className="text-xs text-[#475569] leading-relaxed">
                    The top running notification banner displayed above the navbar on all pages. Announce discount coupons, complimentary delivery perks, or VIP privileges.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-200/80">
                  <span className="text-[11px] font-mono text-[#64748B] truncate max-w-[200px]">
                    &quot;{announcementText}&quot;
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#9E7D4E] inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Edit Ticker</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* SECTION CARD 3: FEATURED CATEGORIES SHOWCASE */}
              <div
                onClick={() => setCurrentSection("categories")}
                className="p-6 sm:p-7 rounded-3xl neu-card bg-white border border-slate-200/80 hover:border-[#C5A880]/60 transition-all duration-300 cursor-pointer space-y-4 group"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl neu-inset bg-[#F1F5F9] flex items-center justify-center text-[#9E7D4E] group-hover:scale-110 transition-transform">
                    <FolderTree className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold neu-inset bg-[#F1F5F9] text-[#9E7D4E]">
                    8 Categories
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#9E7D4E] font-mono font-semibold">
                    Section 02 • Category Navigation
                  </span>
                  <h3 className="text-xl font-sans font-bold text-[#0F172A] group-hover:text-[#9E7D4E] transition-colors">
                    Featured Categories Showcase
                  </h3>
                  <p className="text-xs text-[#475569] leading-relaxed">
                    The circular storytelling realms directly beneath the hero (Handbags, Bucket Bags, Shoulder Bags, Tote Bags, Hobo Bags, Crossbody Bags, Parfums).
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-200/80">
                  <span className="text-[11px] font-mono text-[#64748B]">
                    Storefront Circular Rails
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#9E7D4E] inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Manage Categories</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* SECTION CARD 4: TRUST PILLARS & BRAND STORY */}
              <div
                onClick={() => setCurrentSection("pillars")}
                className="p-6 sm:p-7 rounded-3xl neu-card bg-white border border-slate-200/80 hover:border-[#C5A880]/60 transition-all duration-300 cursor-pointer space-y-4 group"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl neu-inset bg-[#F1F5F9] flex items-center justify-center text-[#9E7D4E] group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold neu-inset bg-[#F1F5F9] text-[#10B981]">
                    4 Pillars Active
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#9E7D4E] font-mono font-semibold">
                    Section 03 • Brand Trust &amp; Heritage
                  </span>
                  <h3 className="text-xl font-sans font-bold text-[#0F172A] group-hover:text-[#9E7D4E] transition-colors">
                    Trust Pillars &amp; Atelier Heritage
                  </h3>
                  <p className="text-xs text-[#475569] leading-relaxed">
                    The 4 confidence pillars (Free Express Shipping, Cash on Delivery across India, Authenticity Guarantee, Atelier Concierge) and the brand story narrative.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-200/80">
                  <span className="text-[11px] font-mono text-[#64748B]">
                    4-Pillars Guarantee
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#9E7D4E] inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
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
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
            <button
              type="button"
              onClick={() => setCurrentSection("hub")}
              className="px-4 py-2 rounded-xl neu-btn text-[#0F172A] hover:text-[#9E7D4E] text-xs font-semibold transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to All Sections</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#64748B]">Breadcrumb:</span>
              <span className="text-[10px] font-mono text-[#64748B]">Homepage CMS /</span>
              <span className="text-[10px] font-mono text-[#9E7D4E] font-semibold">
                Hero Banner Carousel
              </span>
            </div>
          </div>

          {/* Section Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#9E7D4E] font-semibold font-mono">
                  Section 01 Customizer
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full border border-[#10B981]/25 font-mono font-medium">
                  Auto-Responsive Scaling
                </span>
              </div>
              <h2 className="font-sans text-2xl sm:text-3xl text-[#0F172A] uppercase tracking-[0.14em] font-bold">
                Hero Banner Carousel
              </h2>
              <p className="text-xs text-[#475569] max-w-xl">
                Add, delete, edit, and reorder full-width hero campaign slides.
              </p>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleRefreshBanners}
                className="px-4 py-2.5 rounded-xl neu-btn text-[#475569] hover:text-[#9E7D4E] text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Banners</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAdd}
                className="px-5 py-2.5 rounded-xl neu-btn-gold text-xs uppercase tracking-widest font-bold text-white transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Hero Banner</span>
              </button>
            </div>
          </div>

          {/* 📐 RECOMMENDED FIXED IMAGE SIZE GUIDE (CRITICAL USER REQUIREMENT) */}
          <div className="p-4 sm:p-5 rounded-2xl neu-raised bg-white border border-[#C5A880]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl neu-inset bg-[#F1F5F9] flex items-center justify-center text-[#9E7D4E] flex-shrink-0 mt-0.5">
                <Info className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-sans">
                  Universal Media Support: High-Res Image (1920 × 750) or Cinematic Video (Autoplay)
                </p>
                <p className="text-[11px] text-[#475569] leading-relaxed">
                  Choose <span className="text-[#9E7D4E] font-semibold">Image</span> or <span className="text-[#9E7D4E] font-semibold">Video</span> for each slide. Our luxury engine autoplays cinematic campaign films with audio toggles, and auto-scales images across Smartphones, Tablets, and 4K Desktops!
                </p>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl neu-inset bg-[#F1F5F9] text-[10px] font-mono text-[#10B981] font-semibold whitespace-nowrap self-start sm:self-auto">
              Auto-Merged For All Screens
            </div>
          </div>

          {/* Sub-tab Switcher: Campaigns vs Studio Simulator */}
          <div className="p-1.5 rounded-2xl neu-inset bg-[#F1F5F9] flex items-center gap-1 max-w-sm">
            <button
              type="button"
              onClick={() => setHeroSubTab("banners")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                heroSubTab === "banners"
                  ? "neu-pill-active font-bold text-[#0F172A]"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Slides ({banners.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setHeroSubTab("studio")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                heroSubTab === "studio"
                  ? "neu-pill-active font-bold text-[#0F172A]"
                  : "text-[#64748B] hover:text-[#0F172A]"
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
                <div className="p-16 rounded-2xl neu-raised bg-white text-center text-[#64748B] space-y-3">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#9E7D4E]" />
                  <p className="text-xs uppercase tracking-widest font-mono">
                    Accessing Atelier Banners...
                  </p>
                </div>
              ) : banners.length === 0 ? (
                /* EMPTY STATE: CLEAR NOTICE THAT HERO BANNER IS REMOVED FROM HOMEPAGE */
                <div className="p-12 sm:p-16 rounded-3xl neu-card bg-white text-center space-y-4 border border-dashed border-[#C5A880]/40">
                  <div className="w-16 h-16 rounded-2xl neu-inset bg-[#F1F5F9] mx-auto flex items-center justify-center text-[#9E7D4E]">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5 max-w-md mx-auto">
                    <h3 className="text-lg text-[#0F172A] font-bold uppercase tracking-wider font-sans">
                      All Hero Banners Removed
                    </h3>
                    <p className="text-xs text-[#10B981] font-mono font-medium">
                      ✓ The Hero Banner section is currently completely hidden from the live homepage.
                    </p>
                    <p className="text-xs text-[#475569]">
                      Your category showcase and product collection will smoothly display right at the top of the homepage without any empty space.
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleOpenAdd}
                      className="px-6 py-2.5 rounded-xl neu-btn-gold text-xs uppercase tracking-widest font-bold text-white cursor-pointer"
                    >
                      + Create New Banner
                    </button>
                    <button
                      type="button"
                      onClick={handleRefreshBanners}
                      className="px-5 py-2.5 rounded-xl neu-btn text-[#475569] hover:text-[#0F172A] text-xs uppercase tracking-widest font-semibold cursor-pointer"
                    >
                      Refresh Banners
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5">
                  {banners.map((banner, idx) => (
                    <div
                      key={banner.id}
                      className="p-5 sm:p-6 rounded-2xl neu-card bg-white border border-slate-200/80 hover:border-[#C5A880]/50 transition-all duration-300 space-y-4 group"
                    >
                      {/* Card Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 rounded-lg neu-inset bg-[#F1F5F9] text-[11px] font-mono font-bold text-[#9E7D4E]">
                            #{banner.display_order ?? idx + 1}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleToggleActive(banner.id)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold font-mono transition-all cursor-pointer ${
                              banner.is_active !== false
                                ? "neu-inset bg-[#F1F5F9] text-[#10B981]"
                                : "neu-btn text-[#64748B]"
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
                                <EyeOff className="w-3 h-3 text-[#64748B]" />
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
                            className="px-3 py-1.5 rounded-xl neu-btn text-xs text-[#475569] hover:text-[#9E7D4E] flex items-center gap-1.5 transition-all cursor-pointer"
                            title="View in Live Studio"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#9E7D4E]" />
                            <span className="text-[11px] font-medium">Studio View</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(banner)}
                            className="p-2 rounded-xl neu-btn text-[#475569] hover:text-[#9E7D4E] transition-all cursor-pointer"
                            title="Edit Banner"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteBanner(banner.id, banner.title || "Banner")}
                            className="p-2 rounded-xl neu-btn text-[#475569] hover:text-[#EF4444] transition-all cursor-pointer"
                            title="Delete Banner"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Card Body: Thumbnail + Narrative */}
                      <div className="flex flex-col sm:flex-row items-start gap-5">
                        <div className="relative w-full sm:w-64 h-36 rounded-xl neu-inset bg-[#F1F5F9] p-1 overflow-hidden flex-shrink-0 group-hover:shadow-md transition-all">
                          <div className="relative w-full h-full rounded-lg overflow-hidden">
                            <Image
                              src={banner.desktop_image_url}
                              alt={banner.title || "Banner"}
                              fill
                              unoptimized
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2.5">
                              <span className="text-[9px] uppercase tracking-widest text-[#DFCAAB] font-mono bg-black/70 px-2 py-0.5 rounded font-medium">
                                1920×750 Asset
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 space-y-2.5 min-w-0">
                          <div>
                            <span className="text-[9px] uppercase tracking-[0.25em] text-[#9E7D4E] font-mono font-semibold">
                              Atelier Campaign
                            </span>
                            <h3 className="text-lg sm:text-xl font-sans font-bold text-[#0F172A] tracking-wide mt-0.5 truncate">
                              {banner.title}
                            </h3>
                          </div>

                          {banner.subtitle && (
                            <p className="text-xs text-[#475569] leading-relaxed line-clamp-2">
                              {banner.subtitle}
                            </p>
                          )}

                          <div className="flex items-center gap-3 pt-1 flex-wrap">
                            <div className="px-3 py-1.5 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#9E7D4E] flex items-center gap-1.5 font-mono">
                              <span className="font-semibold">{banner.cta_text || "Shop"}</span>
                              <ArrowRight className="w-3 h-3 text-[#64748B]" />
                              <span className="text-[#475569]">{banner.cta_link || "/shop"}</span>
                            </div>

                            <span className="px-2.5 py-1 rounded-lg neu-inset bg-[#F1F5F9] text-[10px] text-[#10B981] font-mono font-medium">
                              Auto-Scaled All Screens
                            </span>

                            {banner.video_url && (
                              <span className="px-2.5 py-1 rounded-lg neu-inset bg-[#F1F5F9] text-[10px] text-[#9E7D4E] font-mono font-medium flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#9E7D4E] animate-pulse" />
                                <span>Cinematic Video Active</span>
                              </span>
                            )}
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
              <div className="p-4 rounded-2xl neu-raised bg-white border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="p-1 rounded-xl neu-inset bg-[#F1F5F9] flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("desktop")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      previewMode === "desktop"
                        ? "neu-pill-active font-bold text-[#0F172A]"
                        : "text-[#64748B] hover:text-[#0F172A]"
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Ultra-Wide Desktop</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewMode("mobile")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      previewMode === "mobile"
                        ? "neu-pill-active font-bold text-[#0F172A]"
                        : "text-[#64748B] hover:text-[#0F172A]"
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
                      className="p-2 rounded-xl neu-btn text-[#475569] hover:text-[#0F172A] transition-all cursor-pointer"
                      title="Previous Slide"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <span className="text-xs font-mono text-[#9E7D4E] font-semibold px-3 py-1 rounded-lg neu-inset bg-[#F1F5F9]">
                      Slide {(previewIdx % previewList.length) + 1} of {previewList.length}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setPreviewIdx((prev) => (prev + 1) % previewList.length)
                      }
                      className="p-2 rounded-xl neu-btn text-[#475569] hover:text-[#0F172A] transition-all cursor-pointer"
                      title="Next Slide"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <Link
                  href="/"
                  target="_blank"
                  className="px-4 py-2 rounded-xl neu-btn text-[#0F172A] hover:text-[#9E7D4E] text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-2"
                >
                  <span>Live Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Canvas Display */}
              {currentPreview ? (
                <div className="p-6 sm:p-10 rounded-3xl neu-card bg-white border border-slate-200/80 flex flex-col items-center justify-center overflow-hidden">
                  <div
                    className={`relative overflow-hidden transition-all duration-500 ${
                      previewMode === "desktop"
                        ? "w-full aspect-[16/6] max-h-[420px] rounded-2xl neu-inset p-1.5 shadow-lg border border-slate-200/80"
                        : "w-[300px] sm:w-[320px] aspect-[9/16] rounded-[36px] neu-inset p-3 shadow-2xl border border-slate-300"
                    }`}
                  >
                    <div className="relative w-full h-full rounded-xl overflow-hidden bg-black">
                      {currentPreview.video_url ? (
                        <video
                          src={currentPreview.video_url}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <Image
                          src={
                            previewMode === "mobile" && currentPreview.mobile_image_url
                              ? currentPreview.mobile_image_url
                              : currentPreview.desktop_image_url
                          }
                          alt={currentPreview.title || "Banner"}
                          fill
                          unoptimized
                          className="object-cover object-center"
                        />
                      )}

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

                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 w-full pt-4 border-t border-slate-200/80 text-xs">
                    <div className="space-y-0.5 text-center sm:text-left">
                      <p className="text-[#0F172A] font-bold font-sans">
                        {currentPreview.title}
                      </p>
                      <p className="text-[11px] text-[#475569]">
                        Destination:{" "}
                        <span className="text-[#9E7D4E] font-mono font-semibold">
                          {currentPreview.cta_link || "/shop"}
                        </span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(currentPreview)}
                      className="px-4 py-2 rounded-xl neu-btn text-[#0F172A] hover:text-[#9E7D4E] text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#9E7D4E]" />
                      <span>Edit This Slide</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-16 rounded-2xl neu-raised bg-white border border-slate-200/80 text-center text-[#64748B]">
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
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
            <button
              type="button"
              onClick={() => setCurrentSection("hub")}
              className="px-4 py-2 rounded-xl neu-btn text-[#0F172A] hover:text-[#9E7D4E] text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to All Sections</span>
            </button>
            <span className="text-[10px] font-mono text-[#9E7D4E] font-semibold">
              Homepage CMS / Announcement Ticker
            </span>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl neu-card bg-white border border-slate-200/80 space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#9E7D4E] font-mono font-semibold">
                Global Header Bar
              </span>
              <h2 className="text-xl font-sans font-bold text-[#0F172A] uppercase tracking-wider">
                Announcement Ticker Copy
              </h2>
              <p className="text-xs text-[#475569]">
                Broadcast flash privileges, promo codes, and complimentary delivery updates at the very top of all pages.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-[#475569] font-mono font-semibold">
                Ticker Display Copy
              </label>
              <input
                type="text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50 transition-all font-mono"
              />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-[#475569] font-mono font-semibold">
                Live Ticker Preview
              </span>
              <div className="p-3 rounded-xl bg-[#0F172A] border border-slate-700 text-center text-[11px] uppercase tracking-[0.2em] text-[#DFCAAB] font-mono font-semibold shadow-inner">
                {announcementText || "—"}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveAnnouncement}
                className="px-6 py-2.5 rounded-xl neu-btn-gold text-xs font-bold uppercase tracking-widest text-white transition-all cursor-pointer"
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
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
            <button
              type="button"
              onClick={() => setCurrentSection("hub")}
              className="px-4 py-2 rounded-xl neu-btn text-[#0F172A] hover:text-[#9E7D4E] text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to All Sections</span>
            </button>
            <span className="text-[10px] font-mono text-[#9E7D4E] font-semibold">
              Homepage CMS / Featured Categories
            </span>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl neu-card bg-white border border-slate-200/80 space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#9E7D4E] font-mono font-semibold">
                Section 02
              </span>
              <h2 className="text-xl font-sans font-bold text-[#0F172A] uppercase tracking-wider">
                Featured Categories Showcase
              </h2>
              <p className="text-xs text-[#475569]">
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
                <div key={c.slug} className="p-4 rounded-xl neu-raised bg-white border border-slate-200/60 space-y-1">
                  <p className="text-xs font-bold text-[#0F172A] uppercase font-sans">
                    {c.name}
                  </p>
                  <p className="text-[10px] text-[#9E7D4E] font-mono font-semibold">{c.count}</p>
                  <span className="inline-block px-2 py-0.5 rounded-full neu-inset bg-[#F1F5F9] text-[9px] text-[#10B981] font-mono font-semibold mt-1">
                    Live Active
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <Link
                href="/admin/categories"
                className="px-6 py-2.5 rounded-xl neu-btn-gold text-xs font-bold uppercase tracking-widest text-white transition-all inline-flex items-center gap-2 cursor-pointer"
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
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
            <button
              type="button"
              onClick={() => setCurrentSection("hub")}
              className="px-4 py-2 rounded-xl neu-btn text-[#0F172A] hover:text-[#9E7D4E] text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to All Sections</span>
            </button>
            <span className="text-[10px] font-mono text-[#9E7D4E] font-semibold">
              Homepage CMS / Trust Pillars &amp; Heritage
            </span>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl neu-card bg-white border border-slate-200/80 space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#9E7D4E] font-mono font-semibold">
                Section 03
              </span>
              <h2 className="text-xl font-sans font-bold text-[#0F172A] uppercase tracking-wider">
                Atelier Trust Pillars
              </h2>
              <p className="text-xs text-[#475569]">
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
                  <div key={i} className="p-5 rounded-2xl neu-raised bg-white border border-slate-200/60 flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl neu-inset bg-[#F1F5F9] flex items-center justify-center text-[#9E7D4E] flex-shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-sans">
                        {p.title}
                      </h4>
                      <p className="text-[11px] text-[#475569] leading-relaxed">
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
          EDIT BANNER MODAL (SIMPLE, CLEAN, LUXURY PROFESSIONAL)
          ========================================================================= */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Clean Header */}
            <div className="px-6 py-4 bg-[#FAF8F5] border-b border-slate-200/80 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#9E7D4E] font-mono font-bold">
                    Hero Slide Customizer
                  </span>
                  <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] font-mono font-semibold">
                    Editing #{editingBanner.display_order ?? 1}
                  </span>
                </div>
                <h3 className="text-lg font-sans font-bold text-[#0F172A] tracking-wide mt-0.5">
                  Edit Hero Banner
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingBanner(null)}
                className="w-8 h-8 rounded-xl neu-btn flex items-center justify-center text-[#64748B] hover:text-[#0F172A] transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveEdit} className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1 text-xs">
              
              {/* STEP 1: MEDIA FORMAT TOGGLE (IMAGE VS VIDEO) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] uppercase tracking-widest text-[#475569] font-mono font-bold">
                    1. Media Format (Image or Video)
                  </label>
                  <span className="text-[10px] text-[#9E7D4E] font-mono font-medium">
                    {editMediaType === "video" ? "🎬 Cinematic Video Film" : "🖼️ High-Resolution Static Image"}
                  </span>
                </div>

                {/* Media Switcher Segmented Pills */}
                <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl neu-inset bg-[#F1F5F9]">
                  <button
                    type="button"
                    onClick={() => setEditMediaType("image")}
                    className={`py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      editMediaType === "image"
                        ? "bg-white shadow-sm text-[#0F172A] border border-slate-200 font-bold"
                        : "text-[#64748B] hover:text-[#0F172A]"
                    }`}
                  >
                    <ImageIcon className="w-4 h-4 text-[#9E7D4E]" />
                    <span>Image Banner</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditMediaType("video")}
                    className={`py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      editMediaType === "video"
                        ? "bg-white shadow-sm text-[#0F172A] border border-[#9E7D4E]/50 text-[#9E7D4E] font-bold"
                        : "text-[#64748B] hover:text-[#0F172A]"
                    }`}
                  >
                    <Film className="w-4 h-4 text-[#9E7D4E]" />
                    <span className="flex items-center gap-1.5">
                      <span>Video Campaign</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                    </span>
                  </button>
                </div>

                {/* --- VIDEO CONFIGURATION PANEL --- */}
                {editMediaType === "video" ? (
                  <div className="p-4 rounded-2xl border border-[#C5A880]/40 bg-[#FAF8F5] space-y-3.5">
                    {/* Live Video Preview if URL exists */}
                    {editForm.video_url && (
                      <div className="relative aspect-[16/7] rounded-xl overflow-hidden bg-black border border-slate-200 shadow-inner group">
                        <video
                          src={editForm.video_url}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-sm px-2 py-0.5 rounded-lg text-[9px] font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Autoplay Video Active</span>
                        </div>
                      </div>
                    )}

                    {/* Upload Video File Button */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] uppercase tracking-wider text-[#475569] font-mono font-semibold">
                          Upload Video File (.mp4, .webm)
                        </label>
                        <span className="text-[9px] text-[#9E7D4E] font-mono">
                          Autoplays on page load
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center gap-2.5">
                        <label className="w-full sm:w-auto px-4 py-2.5 rounded-xl neu-btn text-xs font-semibold text-[#0F172A] hover:text-[#9E7D4E] cursor-pointer flex items-center justify-center gap-2 transition-all border border-slate-200">
                          {isUploading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-[#9E7D4E]" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 text-[#9E7D4E]" />
                              <span>Upload Video File</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="video/mp4,video/webm,video/ogg"
                            disabled={isUploading}
                            onChange={(e) => handleMediaUpload(e, true, "video")}
                            className="hidden"
                          />
                        </label>
                        <span className="text-[11px] text-[#64748B] font-mono">
                          or paste direct video URL below:
                        </span>
                      </div>
                      <input
                        type="text"
                        value={editForm.video_url}
                        onChange={(e) =>
                          setEditForm({ ...editForm, video_url: e.target.value })
                        }
                        placeholder="/videos/hero-banner.mp4 or https://cdn.example.com/campaign.mp4"
                        className="w-full px-3.5 py-2.5 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] font-mono focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                      />
                    </div>

                    {/* Poster / Fallback Image for Video */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] uppercase tracking-wider text-[#475569] font-mono font-semibold">
                          Poster / Fallback Image (Recommended)
                        </label>
                        <span className="text-[9px] text-[#64748B] font-mono">
                          Displays while video loads
                        </span>
                      </div>
                      <input
                        type="url"
                        required
                        value={editForm.desktop_image_url}
                        onChange={(e) =>
                          setEditForm({ ...editForm, desktop_image_url: e.target.value })
                        }
                        placeholder="https://..."
                        className="w-full px-3.5 py-2.5 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] font-mono focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                      />
                    </div>
                  </div>
                ) : (
                  /* --- IMAGE CONFIGURATION PANEL --- */
                  <div className="p-4 rounded-2xl border border-slate-200 bg-[#FAF8F5] space-y-3.5">
                    {/* Live Image Preview */}
                    {editForm.desktop_image_url && (
                      <div className="relative aspect-[16/7] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
                        <Image
                          src={editForm.desktop_image_url}
                          alt="Preview"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-sm px-2 py-0.5 rounded-lg text-[9px] font-mono text-[#DFCAAB] uppercase tracking-widest">
                          1920 × 750 Asset
                        </div>
                      </div>
                    )}

                    {/* Upload Image Button */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] uppercase tracking-wider text-[#475569] font-mono font-semibold">
                          Upload Banner Image
                        </label>
                        <span className="text-[9px] text-[#10B981] font-mono font-medium">
                          1920 × 750 px (Auto-Scales All Devices)
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center gap-2.5">
                        <label className="w-full sm:w-auto px-4 py-2.5 rounded-xl neu-btn text-xs font-semibold text-[#0F172A] hover:text-[#9E7D4E] cursor-pointer flex items-center justify-center gap-2 transition-all border border-slate-200">
                          {isUploading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-[#9E7D4E]" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 text-[#9E7D4E]" />
                              <span>Upload Image File</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploading}
                            onChange={(e) => handleMediaUpload(e, true, "image")}
                            className="hidden"
                          />
                        </label>
                        <span className="text-[11px] text-[#64748B] font-mono">
                          or paste image link below:
                        </span>
                      </div>
                      <input
                        type="url"
                        required
                        value={editForm.desktop_image_url}
                        onChange={(e) =>
                          setEditForm({ ...editForm, desktop_image_url: e.target.value })
                        }
                        placeholder="https://images.unsplash.com/... or CDN link"
                        className="w-full px-3.5 py-2.5 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] font-mono focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 2: CAMPAIGN TITLE & SUBTITLE */}
              <div className="space-y-3 pt-2 border-t border-slate-200/70">
                <label className="text-[11px] uppercase tracking-widest text-[#475569] font-mono font-bold block">
                  2. Headline &amp; Narrative
                </label>
                
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[#64748B] font-mono font-semibold">
                    Campaign Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="e.g. The Autumn Handbag Capsule"
                    className="w-full px-4 py-2.5 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] font-medium focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[#64748B] font-mono font-semibold">
                    Subtitle Narrative (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={editForm.subtitle}
                    onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                    placeholder="Explore new sculptural silhouettes..."
                    className="w-full px-4 py-2 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                  />
                </div>
              </div>

              {/* STEP 3: CALL TO ACTION */}
              <div className="space-y-3 pt-2 border-t border-slate-200/70">
                <label className="text-[11px] uppercase tracking-widest text-[#475569] font-mono font-bold block">
                  3. Call-To-Action Button
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-[#64748B] font-mono font-semibold">
                      Button Label
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.cta_text}
                      onChange={(e) => setEditForm({ ...editForm, cta_text: e.target.value })}
                      placeholder="Shop The Collection"
                      className="w-full px-4 py-2.5 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] font-semibold focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-[#64748B] font-mono font-semibold">
                      Destination Preset
                    </label>
                    <select
                      value={isKnownDestination(editForm.cta_link) ? editForm.cta_link : "custom"}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val !== "custom") {
                          setEditForm({
                            ...editForm,
                            cta_link: val,
                            cta_text: editForm.cta_text || getDestinationDefaultText(val),
                          });
                        }
                      }}
                      className="w-full px-4 py-2.5 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] font-medium focus:outline-none focus:ring-1 focus:ring-[#C5A880] cursor-pointer"
                    >
                      <optgroup label="Storefront Destinations">
                        {STOREFRONT_DESTINATIONS.map((d) => (
                          <option key={d.value} value={d.value}>
                            {d.label}
                          </option>
                        ))}
                      </optgroup>
                      {categories.length > 0 && (
                        <optgroup label="Product Categories">
                          {categories.map((c) => (
                            <option key={c.slug} value={`/shop/${c.slug}`}>
                              Category: {c.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      <option value="custom">Custom URL Link...</option>
                    </select>
                  </div>
                </div>

                <input
                  type="text"
                  required
                  value={editForm.cta_link}
                  onChange={(e) => setEditForm({ ...editForm, cta_link: e.target.value })}
                  placeholder="/shop or custom URL"
                  className="w-full px-4 py-2 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] font-mono focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                />
              </div>

              {/* STEP 4: DISPLAY ORDER & ACTIVE STATUS */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200/70">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[#64748B] font-mono font-semibold">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editForm.display_order}
                    onChange={(e) =>
                      setEditForm({ ...editForm, display_order: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                  />
                </div>

                <div className="flex items-end pb-0.5">
                  <label className="flex items-center gap-2.5 cursor-pointer p-2.5 rounded-xl neu-inset bg-[#F1F5F9] w-full select-none">
                    <input
                      type="checkbox"
                      checked={editForm.is_active}
                      onChange={(e) =>
                        setEditForm({ ...editForm, is_active: e.target.checked })
                      }
                      className="accent-[#10B981] w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#0F172A] block">
                        {editForm.is_active ? "Live on Site" : "Draft (Hidden)"}
                      </span>
                      <span className="text-[9px] text-[#64748B] font-mono">
                        {editForm.is_active ? "Visible to customers" : "Hidden from homepage"}
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingBanner(null)}
                  className="px-5 py-2.5 rounded-xl neu-btn text-[#64748B] hover:text-[#0F172A] text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-7 py-2.5 rounded-xl neu-btn-gold text-xs uppercase tracking-widest font-bold text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  Save Slide Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADD NEW BANNER MODAL (SIMPLE, CLEAN, LUXURY PROFESSIONAL)
          ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Clean Header */}
            <div className="px-6 py-4 bg-[#FAF8F5] border-b border-slate-200/80 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#9E7D4E] font-mono font-bold">
                    Hero Campaign Creator
                  </span>
                  <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#9E7D4E]/15 text-[#9E7D4E] font-mono font-semibold">
                    New Slide
                  </span>
                </div>
                <h3 className="text-lg font-sans font-bold text-[#0F172A] tracking-wide mt-0.5">
                  Create Hero Banner
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-xl neu-btn flex items-center justify-center text-[#64748B] hover:text-[#0F172A] transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleCreateBanner} className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1 text-xs">
              
              {/* STEP 1: MEDIA FORMAT TOGGLE (IMAGE VS VIDEO) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] uppercase tracking-widest text-[#475569] font-mono font-bold">
                    1. Media Format (Image or Video)
                  </label>
                  <span className="text-[10px] text-[#9E7D4E] font-mono font-medium">
                    {createMediaType === "video" ? "🎬 Cinematic Video Film" : "🖼️ High-Resolution Static Image"}
                  </span>
                </div>

                {/* Media Switcher Segmented Pills */}
                <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl neu-inset bg-[#F1F5F9]">
                  <button
                    type="button"
                    onClick={() => setCreateMediaType("image")}
                    className={`py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      createMediaType === "image"
                        ? "bg-white shadow-sm text-[#0F172A] border border-slate-200 font-bold"
                        : "text-[#64748B] hover:text-[#0F172A]"
                    }`}
                  >
                    <ImageIcon className="w-4 h-4 text-[#9E7D4E]" />
                    <span>Image Banner</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreateMediaType("video")}
                    className={`py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      createMediaType === "video"
                        ? "bg-white shadow-sm text-[#0F172A] border border-[#9E7D4E]/50 text-[#9E7D4E] font-bold"
                        : "text-[#64748B] hover:text-[#0F172A]"
                    }`}
                  >
                    <Film className="w-4 h-4 text-[#9E7D4E]" />
                    <span className="flex items-center gap-1.5">
                      <span>Video Campaign</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                    </span>
                  </button>
                </div>

                {/* --- VIDEO CONFIGURATION PANEL --- */}
                {createMediaType === "video" ? (
                  <div className="p-4 rounded-2xl border border-[#C5A880]/40 bg-[#FAF8F5] space-y-3.5">
                    {/* Live Video Preview if URL exists */}
                    {createForm.video_url && (
                      <div className="relative aspect-[16/7] rounded-xl overflow-hidden bg-black border border-slate-200 shadow-inner group">
                        <video
                          src={createForm.video_url}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-sm px-2 py-0.5 rounded-lg text-[9px] font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Autoplay Video Active</span>
                        </div>
                      </div>
                    )}

                    {/* Upload Video File Button */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] uppercase tracking-wider text-[#475569] font-mono font-semibold">
                          Upload Video File (.mp4, .webm)
                        </label>
                        <span className="text-[9px] text-[#9E7D4E] font-mono">
                          Autoplays on page load
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center gap-2.5">
                        <label className="w-full sm:w-auto px-4 py-2.5 rounded-xl neu-btn text-xs font-semibold text-[#0F172A] hover:text-[#9E7D4E] cursor-pointer flex items-center justify-center gap-2 transition-all border border-slate-200">
                          {isUploading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-[#9E7D4E]" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 text-[#9E7D4E]" />
                              <span>Upload Video File</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="video/mp4,video/webm,video/ogg"
                            disabled={isUploading}
                            onChange={(e) => handleMediaUpload(e, false, "video")}
                            className="hidden"
                          />
                        </label>
                        <span className="text-[11px] text-[#64748B] font-mono">
                          or paste direct video URL below:
                        </span>
                      </div>
                      <input
                        type="text"
                        value={createForm.video_url}
                        onChange={(e) =>
                          setCreateForm({ ...createForm, video_url: e.target.value })
                        }
                        placeholder="/videos/hero-banner.mp4 or https://cdn.example.com/campaign.mp4"
                        className="w-full px-3.5 py-2.5 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] font-mono focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                      />
                    </div>

                    {/* Poster / Fallback Image for Video */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] uppercase tracking-wider text-[#475569] font-mono font-semibold">
                          Poster / Fallback Image (Recommended)
                        </label>
                        <span className="text-[9px] text-[#64748B] font-mono">
                          Displays while video loads
                        </span>
                      </div>
                      <input
                        type="url"
                        required
                        value={createForm.desktop_image_url}
                        onChange={(e) =>
                          setCreateForm({ ...createForm, desktop_image_url: e.target.value })
                        }
                        placeholder="https://..."
                        className="w-full px-3.5 py-2.5 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] font-mono focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                      />
                    </div>
                  </div>
                ) : (
                  /* --- IMAGE CONFIGURATION PANEL --- */
                  <div className="p-4 rounded-2xl border border-slate-200 bg-[#FAF8F5] space-y-3.5">
                    {/* Live Image Preview */}
                    {createForm.desktop_image_url && (
                      <div className="relative aspect-[16/7] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
                        <Image
                          src={createForm.desktop_image_url}
                          alt="Preview"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-sm px-2 py-0.5 rounded-lg text-[9px] font-mono text-[#DFCAAB] uppercase tracking-widest">
                          1920 × 750 Asset
                        </div>
                      </div>
                    )}

                    {/* Upload Image Button */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] uppercase tracking-wider text-[#475569] font-mono font-semibold">
                          Upload Banner Image
                        </label>
                        <span className="text-[9px] text-[#10B981] font-mono font-medium">
                          1920 × 750 px (Auto-Scales All Devices)
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center gap-2.5">
                        <label className="w-full sm:w-auto px-4 py-2.5 rounded-xl neu-btn text-xs font-semibold text-[#0F172A] hover:text-[#9E7D4E] cursor-pointer flex items-center justify-center gap-2 transition-all border border-slate-200">
                          {isUploading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-[#9E7D4E]" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 text-[#9E7D4E]" />
                              <span>Upload Image File</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploading}
                            onChange={(e) => handleMediaUpload(e, false, "image")}
                            className="hidden"
                          />
                        </label>
                        <span className="text-[11px] text-[#64748B] font-mono">
                          or paste image link below:
                        </span>
                      </div>
                      <input
                        type="url"
                        required
                        value={createForm.desktop_image_url}
                        onChange={(e) =>
                          setCreateForm({ ...createForm, desktop_image_url: e.target.value })
                        }
                        placeholder="https://images.unsplash.com/... or CDN link"
                        className="w-full px-3.5 py-2.5 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] font-mono focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 2: CAMPAIGN TITLE & SUBTITLE */}
              <div className="space-y-3 pt-2 border-t border-slate-200/70">
                <label className="text-[11px] uppercase tracking-widest text-[#475569] font-mono font-bold block">
                  2. Headline &amp; Narrative
                </label>
                
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[#64748B] font-mono font-semibold">
                    Campaign Title
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                    placeholder="e.g. The Royal Capsule"
                    className="w-full px-4 py-2.5 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] font-medium focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[#64748B] font-mono font-semibold">
                    Subtitle Narrative (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={createForm.subtitle}
                    onChange={(e) => setCreateForm({ ...createForm, subtitle: e.target.value })}
                    placeholder="Architectural silhouettes tailored in noble leathers..."
                    className="w-full px-4 py-2 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                  />
                </div>
              </div>

              {/* STEP 3: CALL TO ACTION */}
              <div className="space-y-3 pt-2 border-t border-slate-200/70">
                <label className="text-[11px] uppercase tracking-widest text-[#475569] font-mono font-bold block">
                  3. Call-To-Action Button
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-[#64748B] font-mono font-semibold">
                      Button Label
                    </label>
                    <input
                      type="text"
                      required
                      value={createForm.cta_text}
                      onChange={(e) => setCreateForm({ ...createForm, cta_text: e.target.value })}
                      placeholder="Shop The Collection"
                      className="w-full px-4 py-2.5 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] font-semibold focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-[#64748B] font-mono font-semibold">
                      Destination Preset
                    </label>
                    <select
                      value={isKnownDestination(createForm.cta_link) ? createForm.cta_link : "custom"}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val !== "custom") {
                          setCreateForm({
                            ...createForm,
                            cta_link: val,
                            cta_text: createForm.cta_text || getDestinationDefaultText(val),
                          });
                        }
                      }}
                      className="w-full px-4 py-2.5 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] font-medium focus:outline-none focus:ring-1 focus:ring-[#C5A880] cursor-pointer"
                    >
                      <optgroup label="Storefront Destinations">
                        {STOREFRONT_DESTINATIONS.map((d) => (
                          <option key={d.value} value={d.value}>
                            {d.label}
                          </option>
                        ))}
                      </optgroup>
                      {categories.length > 0 && (
                        <optgroup label="Product Categories">
                          {categories.map((c) => (
                            <option key={c.slug} value={`/shop/${c.slug}`}>
                              Category: {c.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      <option value="custom">Custom URL Link...</option>
                    </select>
                  </div>
                </div>

                <input
                  type="text"
                  required
                  value={createForm.cta_link}
                  onChange={(e) => setCreateForm({ ...createForm, cta_link: e.target.value })}
                  placeholder="/shop or custom URL"
                  className="w-full px-4 py-2 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] font-mono focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                />
              </div>

              {/* STEP 4: DISPLAY ORDER & ACTIVE STATUS */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200/70">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[#64748B] font-mono font-semibold">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={createForm.display_order}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, display_order: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                  />
                </div>

                <div className="flex items-end pb-0.5">
                  <label className="flex items-center gap-2.5 cursor-pointer p-2.5 rounded-xl neu-inset bg-[#F1F5F9] w-full select-none">
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
                    <div>
                      <span className="text-xs font-bold text-[#0F172A] block">
                        {createForm.is_active ? "Live on Site" : "Draft (Hidden)"}
                      </span>
                      <span className="text-[9px] text-[#64748B] font-mono">
                        {createForm.is_active ? "Visible to customers" : "Hidden from homepage"}
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl neu-btn text-[#64748B] hover:text-[#0F172A] text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-7 py-2.5 rounded-xl neu-btn-gold text-xs uppercase tracking-widest font-bold text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
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
