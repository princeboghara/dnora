"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  Sparkles,
  Loader2,
  ImageIcon,
  Film,
  CheckCircle2,
  AlertCircle,
  Clock,
  Link2,
  Sliders,
} from "lucide-react";
import { Banner, Category, Product } from "@/types";
import { uploadImageToStorage } from "@/lib/supabase/storage";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  getStagedHeroBanners,
  saveStagedHeroBanners,
} from "@/lib/services/cms-service";
import {
  getAllAdminCategories,
  getProducts,
} from "@/lib/services/catalog-service";

export default function NewHeroBannerPage() {
  const router = useRouter();

  // Media type: Image vs Video
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic destinations
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isCustomLink, setIsCustomLink] = useState(false);

  // Load available store destinations
  useEffect(() => {
    async function loadDestinations() {
      try {
        const [cats, prods] = await Promise.all([
          getAllAdminCategories(),
          getProducts(),
        ]);
        setCategories(cats || []);
        setProducts(prods || []);
      } catch (err) {
        console.warn("Failed to load catalog destinations:", err);
      }
    }
    loadDestinations();
  }, []);

  // Form inputs (NO Charles & Keith defaults, NO fallback videos, NO display order input!)
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    cta_text: "",
    cta_link: "/shop",
    desktop_image_url: "",
    mobile_image_url: "",
    video_url: "",
    duration_seconds: 5,
    is_active: true,
  });

  // Handle direct file upload to Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    let uploadedUrl: string | null = null;
    if (isSupabaseConfigured() && supabase) {
      try {
        const folder = mediaType === "video" ? "hero-videos" : "hero";
        const { url, error } = await uploadImageToStorage("banners", file, folder);
        if (error) {
          console.warn("Storage upload note:", error);
        } else if (url) {
          uploadedUrl = url;
        }
      } catch (err) {
        console.warn("Storage exception:", err);
      }
    }

    // Fallback object URL if storage isn't configured so user can preview immediately
    if (!uploadedUrl) {
      uploadedUrl = URL.createObjectURL(file);
    }

    setIsUploading(false);

    if (uploadedUrl) {
      if (mediaType === "video") {
        setForm((prev) => ({ ...prev, video_url: uploadedUrl! }));
      } else {
        setForm((prev) => ({ ...prev, desktop_image_url: uploadedUrl! }));
      }
    }
  };

  // Submit banner to staging
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mediaType === "image" && !form.desktop_image_url.trim()) {
      setUploadError("Please upload or enter an image URL for the banner.");
      return;
    }

    if (mediaType === "video" && !form.video_url.trim()) {
      setUploadError("Please upload or enter a video URL for the banner.");
      return;
    }

    setIsSubmitting(true);
    try {
      const currentStaged = await getStagedHeroBanners();

      const newId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `banner_${Date.now()}`;

      const newBanner: Banner = {
        id: newId,
        title: form.title.trim() || undefined,
        subtitle: form.subtitle.trim() || undefined,
        cta_text: form.cta_text.trim() || undefined,
        cta_link: form.cta_link.trim() || undefined,
        desktop_image_url:
          mediaType === "image"
            ? form.desktop_image_url.trim()
            : form.desktop_image_url.trim() || "",
        mobile_image_url: form.mobile_image_url.trim() || undefined,
        video_url: mediaType === "video" ? form.video_url.trim() : undefined,
        duration_seconds:
          mediaType === "image" ? Number(form.duration_seconds) || 5 : undefined,
        display_order: currentStaged.length + 1,
        is_active: form.is_active,
        type: "hero",
      };

      const updated = [...currentStaged, newBanner];
      await saveStagedHeroBanners(updated);

      router.push("/admin/cms/hero");
    } catch (err) {
      console.error("Failed to add hero banner:", err);
      setUploadError("Failed to save hero banner. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 text-[#334155]">
      {/* Back link & Title */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/cms/hero"
            className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0F172A] transition-colors mb-2 font-mono uppercase"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Hero Banners</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
            Add New Hero Banner
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Configure visual media and optional narrative. Changes will be saved to Staging for live preview.
          </p>
        </div>
      </div>

      {uploadError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Main Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-6 neu-flat border border-slate-200/80 shadow-sm space-y-6"
      >
        {/* SECTION 1: MEDIA TYPE SELECTION */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider">
            1. Select Media Format <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setMediaType("image")}
              className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                mediaType === "image"
                  ? "neu-inset bg-[#F8FAFC] border-[#C5A880] text-[#9E7D4E] font-semibold ring-1 ring-[#C5A880]/30"
                  : "neu-btn text-slate-600 hover:text-slate-900 border-slate-200"
              }`}
            >
              <div className="w-9 h-9 rounded-xl neu-inset bg-white flex items-center justify-center text-[#C5A880]">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold block uppercase tracking-wide">
                  Still Imagery
                </span>
                <span className="text-[11px] text-slate-500">
                  High-res banner photo (JPEG, PNG, WebP)
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMediaType("video")}
              className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                mediaType === "video"
                  ? "neu-inset bg-[#F8FAFC] border-[#C5A880] text-[#9E7D4E] font-semibold ring-1 ring-[#C5A880]/30"
                  : "neu-btn text-slate-600 hover:text-slate-900 border-slate-200"
              }`}
            >
              <div className="w-9 h-9 rounded-xl neu-inset bg-white flex items-center justify-center text-[#C5A880]">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold block uppercase tracking-wide">
                  Cinematic Video Film
                </span>
                <span className="text-[11px] text-slate-500">
                  Auto-playing MP4/WebM luxury video
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* SECTION 2: MEDIA UPLOAD & SOURCE */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider">
            2. Upload Visual Media <span className="text-rose-500">*</span>
          </label>

          {/* Upload Dropzone */}
          <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#C5A880] bg-[#F8FAFC] text-center space-y-3 transition-colors">
            <div className="w-12 h-12 rounded-2xl neu-inset bg-white mx-auto flex items-center justify-center text-[#C5A880]">
              {isUploading ? (
                <Loader2 className="w-6 h-6 animate-spin text-[#C5A880]" />
              ) : mediaType === "video" ? (
                <Film className="w-6 h-6" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-[#0F172A]">
                {isUploading
                  ? "Uploading media to Atelier Cloud..."
                  : `Click to select and upload ${mediaType === "video" ? "Video" : "Image"} file`}
              </p>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                {mediaType === "video"
                  ? "MP4 or WebM (recommended resolution: 1920x750 or 1080p, under 50MB)"
                  : "PNG, JPG, or WebP (recommended resolution: 1920x750 or 2560x1080)"}
              </p>
            </div>

            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold tracking-wide uppercase transition-colors cursor-pointer shadow-xs">
              <Upload className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Browse Files</span>
              <input
                type="file"
                accept={mediaType === "video" ? "video/mp4,video/webm" : "image/*"}
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>

          {/* Direct URL input fallback */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5" />
              <span>Or enter direct media URL:</span>
            </span>
            {mediaType === "video" ? (
              <input
                type="url"
                placeholder="https://.../video.mp4"
                value={form.video_url}
                onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-hidden focus:border-[#C5A880]"
              />
            ) : (
              <input
                type="url"
                placeholder="https://.../image.webp"
                value={form.desktop_image_url}
                onChange={(e) =>
                  setForm({ ...form, desktop_image_url: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-hidden focus:border-[#C5A880]"
              />
            )}
          </div>

          {/* Media Preview Card if selected */}
          {((mediaType === "video" && form.video_url) ||
            (mediaType === "image" && form.desktop_image_url)) && (
            <div className="p-3 bg-slate-900 rounded-2xl text-white space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span className="font-mono">Media Attached Preview</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              </div>
              <div className="relative w-full aspect-[16/7] rounded-xl overflow-hidden bg-black">
                {mediaType === "video" ? (
                  <video
                    src={form.video_url}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src={form.desktop_image_url}
                    alt="Preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: IMAGE SLIDE DURATION (ONLY FOR IMAGES) */}
        {mediaType === "image" && (
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                  3. Image Slide Duration
                </label>
                <p className="text-[11px] text-[#64748B]">
                  How many seconds this image remains visible before swiping to the next slide.
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 font-mono text-xs font-bold">
                {form.duration_seconds} Seconds
              </span>
            </div>

            <div className="flex items-center gap-3">
              {[3, 5, 7, 10, 15].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setForm({ ...form, duration_seconds: sec })}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                    form.duration_seconds === sec
                      ? "bg-[#0F172A] text-white shadow-xs"
                      : "bg-[#F1F5F9] text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {sec}s
                </button>
              ))}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-slate-500">Custom:</span>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={form.duration_seconds}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      duration_seconds: Math.max(1, Number(e.target.value) || 5),
                    })
                  }
                  className="w-16 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-center focus:outline-hidden focus:border-[#C5A880]"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: HEADLINE & NARRATIVE (COMPLETELY OPTIONAL) */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Headline &amp; Narrative{" "}
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-normal lowercase tracking-normal">
                  (Optional - omit for clean visual banner)
                </span>
              </label>
              <p className="text-[11px] text-[#64748B]">
                If left blank, the banner will render as a pure visual without text or buttons.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Title / Headline */}
            <div>
              <label className="block text-[11px] font-medium text-[#475569] mb-1">
                Headline / Title (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. THE ART OF EVERYDAY LUXURY"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-[#C5A880]"
              />
            </div>

            {/* Subtitle / Narrative */}
            <div>
              <label className="block text-[11px] font-medium text-[#475569] mb-1">
                Subtitle / Narrative (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Handcrafted Italian Nappa Leather, Haute Parfumerie & Modern Indian Heirlooms"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-[#C5A880]"
              />
            </div>

            {/* CTA Button Text & Destination URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-[#475569] mb-1">
                  CTA Button Label (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shop The Collection"
                  value={form.cta_text}
                  onChange={(e) => setForm({ ...form, cta_text: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-[#C5A880]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#475569] mb-1">
                  CTA Destination URL (Optional)
                </label>
                <select
                  value={isCustomLink ? "custom" : form.cta_link}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "custom") {
                      setIsCustomLink(true);
                    } else {
                      setIsCustomLink(false);
                      setForm({ ...form, cta_link: val });
                    }
                  }}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-[#C5A880] bg-white cursor-pointer"
                >
                  <optgroup label="Storefront Pages">
                    <option value="/shop">All Creations / Entire Catalog (/shop)</option>
                    <option value="/shop?filter=new">New Arrivals Showcase (/shop?filter=new)</option>
                    <option value="/shop?filter=bestseller">Bestsellers Showcase (/shop?filter=bestseller)</option>
                    <option value="/about">Atelier Heritage &amp; Craft (/about)</option>
                    <option value="/contact">Client Concierge &amp; Inquiry (/contact)</option>
                    <option value="/faq">Authenticity &amp; Advisory (/faq)</option>
                    <option value="/cart">Shopping Bag (/cart)</option>
                    <option value="/wishlist">Patron Wishlist (/wishlist)</option>
                  </optgroup>

                  {categories.length > 0 && (
                    <optgroup label="Category Realms">
                      {categories.map((c) => (
                        <option key={c.id} value={`/shop/${c.slug}`}>
                          {c.name} (/shop/{c.slug})
                        </option>
                      ))}
                    </optgroup>
                  )}

                  {products.length > 0 && (
                    <optgroup label="Direct Product Pages">
                      {products.map((p) => (
                        <option key={p.id} value={`/product/${p.id}`}>
                          {p.name} (/product/{p.id})
                        </option>
                      ))}
                    </optgroup>
                  )}

                  <optgroup label="Custom Destination">
                    <option value="custom">Enter Custom Path / External Link...</option>
                  </optgroup>
                </select>

                {isCustomLink && (
                  <input
                    type="text"
                    placeholder="/custom-path or https://..."
                    value={form.cta_link}
                    onChange={(e) => setForm({ ...form, cta_link: e.target.value })}
                    className="w-full mt-2 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-hidden focus:border-[#C5A880]"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
          <Link
            href="/admin/cms/hero"
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold tracking-wider uppercase transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#9E7D4E] text-[#111111] hover:brightness-105 font-bold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#111111]" />
                <span>Saving to Staging...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#111111]" />
                <span>Save Banner to Staging</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
