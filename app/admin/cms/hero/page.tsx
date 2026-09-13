"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Smartphone,
  Send,
  Loader2,
  ArrowRight,
  GripVertical,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Film,
  ImageIcon,
  CheckCircle2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from "lucide-react";
import { Banner } from "@/types";
import {
  getStagedHeroBanners,
  saveStagedHeroBanners,
  publishHeroBannersToStorefront,
  getActiveHeroBanners,
} from "@/lib/services/cms-service";

export default function HeroBannerCmsPage() {
  const router = useRouter();

  // Banners state
  const [stagedBanners, setStagedBanners] = useState<Banner[]>([]);
  const [liveBanners, setLiveBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Drag and Drop state
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // Preview Simulator state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const previewVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const slideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Load initial banners
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [staged, live] = await Promise.all([
        getStagedHeroBanners(),
        getActiveHeroBanners(),
      ]);
      setStagedBanners(staged);
      setLiveBanners(live);
    } catch (err) {
      console.error("Failed to load hero banners:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Determine if there are unpublished draft changes
  const hasUnpublishedChanges = () => {
    if (stagedBanners.length !== liveBanners.length) return true;
    return JSON.stringify(stagedBanners) !== JSON.stringify(liveBanners);
  };

  const activeSlides = stagedBanners.filter((b) => b.is_active);
  const slides = activeSlides.length > 0 ? activeSlides : stagedBanners;
  const currentSlide = slides[currentIdx % (slides.length || 1)] || null;

  // Auto-advance logic for preview:
  // - If Video: advances automatically when video finishes (onEnded)
  // - If Image: advances automatically after duration_seconds (default 5s)
  useEffect(() => {
    if (slideTimerRef.current) {
      clearTimeout(slideTimerRef.current);
      slideTimerRef.current = null;
    }

    if (slides.length <= 1 || !currentSlide) return;

    // If current slide is an image, set slide duration timer
    if (!currentSlide.video_url) {
      const duration = (currentSlide.duration_seconds || 5) * 1000;
      slideTimerRef.current = setTimeout(() => {
        setCurrentIdx((prev) => (prev + 1) % slides.length);
      }, duration);
    }

    return () => {
      if (slideTimerRef.current) {
        clearTimeout(slideTimerRef.current);
        slideTimerRef.current = null;
      }
    };
  }, [currentIdx, slides.length, currentSlide]);

  // Video playback management across preview slides
  useEffect(() => {
    previewVideoRefs.current.forEach((v, idx) => {
      if (!v) return;
      if (idx === currentIdx) {
        if (isPlaying) {
          v.currentTime = 0;
          v.play().catch(() => {});
        }
      } else {
        v.pause();
      }
    });
  }, [currentIdx, isPlaying]);

  // When preview video finishes playing, advance slide
  const handleVideoEnded = () => {
    if (slides.length > 1) {
      setCurrentIdx((prev) => (prev + 1) % slides.length);
    }
  };

  const nextSlide = () => {
    if (slides.length > 1) {
      setCurrentIdx((prev) => (prev + 1) % slides.length);
    }
  };

  const prevSlide = () => {
    if (slides.length > 1) {
      setCurrentIdx((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  // Publish staged changes to live storefront
  const handlePublishToStorefront = async () => {
    setIsPublishing(true);
    try {
      const res = await publishHeroBannersToStorefront();
      if (res.success) {
        setLiveBanners(res.banners);
        showNotification(
          "Successfully published to Live Storefront! Changes are now visible on the homepage."
        );
      }
    } catch (err) {
      console.error("Publish error:", err);
      showNotification("Failed to publish to storefront. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  // Toggle active/inactive in staging
  const handleToggleActive = async (id: string) => {
    const updated = stagedBanners.map((b) =>
      b.id === id ? { ...b, is_active: !b.is_active } : b
    );
    setStagedBanners(updated);
    await saveStagedHeroBanners(updated);
    showNotification("Draft updated. Click 'Live to Storefront' to publish.");
  };

  // Delete banner from staging
  const handleDelete = async (id: string, title?: string) => {
    if (
      confirm(
        `Are you sure you want to delete banner "${title || "Untitled"}"?`
      )
    ) {
      const updated = stagedBanners.filter((b) => b.id !== id);
      setStagedBanners(updated);
      await saveStagedHeroBanners(updated);
      showNotification(
        "Banner deleted from staging. Click 'Live to Storefront' to apply on homepage."
      );
    }
  };

  // Drag and drop reordering
  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
  };

  const handleDrop = async (dropIdx: number) => {
    if (draggedIdx === null || draggedIdx === dropIdx) return;
    const reordered = [...stagedBanners];
    const [moved] = reordered.splice(draggedIdx, 1);
    reordered.splice(dropIdx, 0, moved);

    // Update display orders
    const finalOrdered = reordered.map((b, i) => ({
      ...b,
      display_order: i + 1,
    }));

    setStagedBanners(finalOrdered);
    setDraggedIdx(null);
    await saveStagedHeroBanners(finalOrdered);
    showNotification("Banners reordered. Click 'Live to Storefront' to apply.");
  };

  // Move up/down quick controls
  const handleMove = async (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= stagedBanners.length) return;

    const reordered = [...stagedBanners];
    const temp = reordered[idx];
    reordered[idx] = reordered[targetIdx];
    reordered[targetIdx] = temp;

    const finalOrdered = reordered.map((b, i) => ({
      ...b,
      display_order: i + 1,
    }));

    setStagedBanners(finalOrdered);
    await saveStagedHeroBanners(finalOrdered);
    showNotification("Banners reordered. Click 'Live to Storefront' to apply.");
  };

  const isChanged = hasUnpublishedChanges();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-[#334155]">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-[#1E293B] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#C5A880]/50 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 text-xs font-sans">
          <CheckCircle2 className="w-4 h-4 text-[#C5A880] shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* TOP ACTION BAR: Title, Staging Status, Publish Button, Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl neu-flat border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase font-mono tracking-widest text-[#64748B]">
            <span>Admin</span>
            <span>/</span>
            <span>Homepage CMS</span>
            <span>/</span>
            <span className="text-[#C5A880] font-bold">Hero Banner</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
              Hero Banner Management
            </h1>
            {isChanged ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-amber-50 text-amber-700 border border-amber-300 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                Draft Changes Staged
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Live on Storefront
              </span>
            )}
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Preview draft banners in real time. Changes go to the public homepage only after clicking Live to Storefront.
          </p>
        </div>

        {/* Buttons: Live to Storefront & Add Hero Banner */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handlePublishToStorefront}
            disabled={isPublishing || (!isChanged && stagedBanners.length === 0)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer ${
              isChanged
                ? "bg-gradient-to-r from-[#C5A880] via-[#DFCAAB] to-[#9E7D4E] text-[#111111] hover:brightness-105 ring-2 ring-[#C5A880]/50"
                : "bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed"
            }`}
            title="Publish all staged changes to the live storefront"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#111111]" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-[#111111]" />
                <span>Live to Storefront</span>
              </>
            )}
          </button>

          <Link
            href="/admin/cms/hero/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0F172A] text-white hover:bg-slate-800 font-semibold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#C5A880]" />
            <span>Add Hero Banner</span>
          </Link>
        </div>
      </div>

      {/* INTERACTIVE LIVE PREVIEW (AT THE TOP) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 neu-flat border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl neu-inset bg-[#F1F5F9] flex items-center justify-center text-[#C5A880]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-[#0F172A] uppercase">
                Interactive Staging Simulator
              </h2>
              <p className="text-[11px] text-[#64748B]">
                Real-time behavior preview: auto-swiping on video completion or image duration.
              </p>
            </div>
          </div>

          {/* Device & Playback Controls */}
          <div className="flex items-center gap-2">
            {/* View Switcher: Laptop vs Mobile */}
            <div className="flex items-center bg-[#F1F5F9] p-1 rounded-xl neu-inset">
              <button
                type="button"
                onClick={() => setPreviewDevice("desktop")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  previewDevice === "desktop"
                    ? "bg-white text-[#0F172A] shadow-xs font-semibold"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Laptop</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("mobile")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  previewDevice === "mobile"
                    ? "bg-white text-[#0F172A] shadow-xs font-semibold"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>

            {/* Sound & Play controls (only when slides exist) */}
            {slides.length > 0 && currentSlide?.video_url && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-xl neu-btn text-[#475569] hover:text-[#0F172A] cursor-pointer"
                  title={isMuted ? "Unmute Audio" : "Mute Audio"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-amber-600" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 rounded-xl neu-btn text-[#475569] hover:text-[#0F172A] cursor-pointer"
                  title={isPlaying ? "Pause Playback" : "Play"}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Live Preview Display Frame */}
        <div className="flex justify-center bg-[#0B0D10] rounded-2xl p-2 sm:p-4 overflow-hidden">
          <div
            className={`relative transition-all duration-300 overflow-hidden bg-[#111317] rounded-xl select-none ${
              previewDevice === "desktop"
                ? "w-full aspect-[16/7] md:aspect-[21/9] max-h-[500px] min-h-[340px]"
                : "w-[320px] sm:w-[360px] aspect-[4/5] min-h-[480px] shadow-2xl border-4 border-slate-700/50 rounded-3xl"
            }`}
          >
            {slides.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#C5A880]">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold tracking-wide uppercase text-white">
                    No Hero Banners Staged
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    The homepage hero section is currently hidden. Click &quot;Add Hero Banner&quot; below to add your first visual campaign slide.
                  </p>
                </div>
                <Link
                  href="/admin/cms/hero/new"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C5A880] text-black text-xs font-semibold uppercase tracking-wider"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create First Banner</span>
                </Link>
              </div>
            ) : (
              <>
                {/* Carousel Slides */}
                {slides.map((slide, idx) => {
                  const isActive = idx === currentIdx;
                  return (
                    <div
                      key={slide.id}
                      className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                        isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                      }`}
                    >
                      {/* Video or Image */}
                      {slide.video_url ? (
                        <video
                          ref={(el) => {
                            previewVideoRefs.current[idx] = el;
                          }}
                          src={slide.video_url}
                          poster={slide.desktop_image_url}
                          autoPlay
                          muted={isMuted}
                          playsInline
                          onEnded={handleVideoEnded}
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <div className="relative w-full h-full">
                          {slide.desktop_image_url ? (
                            <Image
                              src={
                                previewDevice === "mobile" && slide.mobile_image_url
                                  ? slide.mobile_image_url
                                  : slide.desktop_image_url
                              }
                              alt={slide.title || "Banner"}
                              fill
                              unoptimized
                              className="w-full h-full object-cover object-center"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400 text-xs">
                              No image media provided
                            </div>
                          )}
                        </div>
                      )}

                      {/* Optional Headline & Narrative Overlay (subtle gradient so video remains crisp & bright) */}
                      {(slide.title || slide.subtitle || slide.cta_text) && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent flex flex-col justify-end p-4 sm:p-8 text-white">
                          <div className="max-w-3xl space-y-1.5">
                            {slide.title && (
                              <h2 className="text-lg sm:text-2xl md:text-3xl font-light uppercase tracking-wider text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                                {slide.title}
                              </h2>
                            )}
                            {slide.subtitle && (
                              <p className="text-[11px] sm:text-xs text-slate-200 max-w-xl line-clamp-2 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                                {slide.subtitle}
                              </p>
                            )}
                            {slide.cta_text && (
                              <div className="pt-2">
                                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#C5A880] text-[#111111] text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                  <span>{slide.cta_text}</span>
                                  <ArrowRight className="w-3 h-3" />
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Navigation Chevrons */}
                {slides.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevSlide}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer transition-all border border-white/20"
                      aria-label="Previous Slide"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={nextSlide}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer transition-all border border-white/20"
                      aria-label="Next Slide"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    {/* Dots indicator */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
                      {slides.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setCurrentIdx(i)}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            i === currentIdx ? "w-5 bg-[#C5A880]" : "w-1.5 bg-white/40"
                          }`}
                          aria-label={`Go to slide ${i + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* HERO BANNERS LIST & DRAG-AND-DROP REORDER */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 neu-flat border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold tracking-tight text-[#0F172A] uppercase">
              Staged Banner Slides ({stagedBanners.length})
            </h2>
            <p className="text-[11px] text-[#64748B]">
              Drag slides up or down using the handle to rearrange carousel order. Order takes effect immediately in preview.
            </p>
          </div>

          <Link
            href="/admin/cms/hero/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold tracking-wide uppercase transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Add Banner</span>
          </Link>
        </div>

        {stagedBanners.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-3">
            <ImageIcon className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-xs">No banners exist in staging.</p>
            <Link
              href="/admin/cms/hero/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-semibold uppercase tracking-wider"
            >
              <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Create New Banner</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {stagedBanners.map((banner, idx) => {
              const isVideo = Boolean(banner.video_url);
              return (
                <div
                  key={banner.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={() => handleDrop(idx)}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${
                    draggedIdx === idx
                      ? "opacity-50 border-dashed border-[#C5A880] bg-[#F8FAFC]"
                      : "bg-[#F8FAFC] border-slate-200/80 hover:border-slate-300 hover:shadow-xs"
                  }`}
                >
                  {/* Left: Drag Handle, Thumbnail, Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Drag Handle */}
                    <div
                      className="cursor-grab active:cursor-grabbing p-1.5 text-slate-400 hover:text-slate-700 transition-colors"
                      title="Drag to reorder"
                    >
                      <GripVertical className="w-5 h-5" />
                    </div>

                    {/* Order Badge */}
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>

                    {/* Thumbnail / Video badge */}
                    <div className="relative w-20 h-14 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200">
                      {isVideo ? (
                        <>
                          <video
                            src={banner.video_url}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Film className="w-4 h-4 text-[#C5A880]" />
                          </span>
                        </>
                      ) : banner.desktop_image_url ? (
                        <Image
                          src={banner.desktop_image_url}
                          alt={banner.title || "Slide"}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-[#0F172A] truncate">
                          {banner.title || (
                            <span className="text-slate-400 italic">
                              Untitled Slide (Pure Visual)
                            </span>
                          )}
                        </span>
                        {isVideo ? (
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-mono uppercase font-bold">
                            Video Film
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[9px] font-mono uppercase font-bold">
                            Image ({banner.duration_seconds || 5}s)
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-[#64748B] truncate">
                        {banner.subtitle || "No narrative overlay specified"}
                      </p>

                      <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                        <span>Link: {banner.cta_link || "/shop"}</span>
                        <span>•</span>
                        <span>
                          {banner.is_active ? (
                            <span className="text-emerald-600 font-semibold">Active in Carousel</span>
                          ) : (
                            <span className="text-slate-400">Hidden (Inactive)</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions (Move Up/Down, Active Toggle, Edit, Delete) */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    {/* Move Up Button */}
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, "up")}
                      className={`p-1.5 rounded-lg border border-slate-200 ${
                        idx === 0
                          ? "opacity-30 cursor-not-allowed text-slate-400"
                          : "neu-btn text-slate-600 hover:text-slate-900 cursor-pointer"
                      }`}
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    {/* Move Down Button */}
                    <button
                      type="button"
                      disabled={idx === stagedBanners.length - 1}
                      onClick={() => handleMove(idx, "down")}
                      className={`p-1.5 rounded-lg border border-slate-200 ${
                        idx === stagedBanners.length - 1
                          ? "opacity-30 cursor-not-allowed text-slate-400"
                          : "neu-btn text-slate-600 hover:text-slate-900 cursor-pointer"
                      }`}
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Active / Inactive Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(banner.id)}
                      className={`p-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer ${
                        banner.is_active
                          ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                          : "text-slate-400 bg-slate-100 hover:bg-slate-200"
                      }`}
                      title={banner.is_active ? "Click to deactivate slide" : "Click to activate slide"}
                    >
                      {banner.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    {/* Edit Button */}
                    <Link
                      href={`/admin/cms/hero/edit/${banner.id}`}
                      className="p-1.5 rounded-lg neu-btn text-[#475569] hover:text-[#0F172A] border border-slate-200 transition-colors cursor-pointer"
                      title="Edit banner"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Link>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDelete(banner.id, banner.title)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                      title="Delete banner"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
