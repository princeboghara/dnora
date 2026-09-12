"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight, Volume2, VolumeX, Play, Pause } from "lucide-react";
import { Banner } from "@/types";
import { INITIAL_BANNERS } from "@/lib/seed/catalog-data";
import {
  getActiveHeroBanners,
} from "@/lib/services/cms-service";

interface BannerSlide {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  desktopImg: string;
  mobileImg?: string;
  videoUrl?: string;
  ctaText?: string;
}

function mapBannersToSlides(banners: Banner[]): BannerSlide[] {
  return banners.map((b) => ({
    id: b.id,
    title: b.title,
    subtitle: b.subtitle,
    href: b.cta_link || "/shop",
    desktopImg: b.desktop_image_url,
    mobileImg: b.mobile_image_url || b.desktop_image_url,
    videoUrl: b.video_url || undefined,
    ctaText: b.cta_text || "SHOP THE COLLECTION",
  }));
}

export function HeroBanner({ initialBanners }: { initialBanners?: Banner[] }) {
  const [slides, setSlides] = useState<BannerSlide[]>(() => {
    const list = initialBanners && initialBanners.length > 0 ? initialBanners : INITIAL_BANNERS;
    return mapBannersToSlides(list);
  });
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    async function loadBanners() {
      try {
        const banners = await getActiveHeroBanners();
        if (banners && banners.length > 0) {
          setSlides(mapBannersToSlides(banners));
        }
      } catch (err) {
        console.error("Failed to load hero banners:", err);
      }
    }
    loadBanners();
  }, []);

  // Manage video playback across slide changes
  useEffect(() => {
    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      if (idx === currentIdx) {
        if (isPlaying) {
          video.play().catch(() => {});
        }
      } else {
        video.pause();
      }
    });
  }, [currentIdx, isPlaying]);

  // Slideshow timer (only if more than 1 slide)
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const prevSlide = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (slides.length > 1) {
      setCurrentIdx((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  const nextSlide = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (slides.length > 1) {
      setCurrentIdx((prev) => (prev + 1) % slides.length);
    }
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMuted((prev) => {
      const next = !prev;
      const currentVideo = videoRefs.current[currentIdx];
      if (currentVideo) {
        currentVideo.muted = next;
      }
      return next;
    });
  };

  const togglePlayback = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPlaying((prev) => {
      const next = !prev;
      const currentVideo = videoRefs.current[currentIdx];
      if (currentVideo) {
        if (next) currentVideo.play().catch(() => {});
        else currentVideo.pause();
      }
      return next;
    });
  };

  if (slides.length === 0) {
    return null;
  }

  const activeSlide = slides[currentIdx % (slides.length || 1)] || slides[0];
  if (!activeSlide) return null;
  const hasActiveVideo = Boolean(activeSlide.videoUrl);

  return (
    <div
      className="relative w-full overflow-hidden bg-[#111317] select-none"
      suppressHydrationWarning
    >
      <Link
        href={activeSlide.href}
        className="block relative w-full aspect-[4/5] sm:aspect-[16/7] md:aspect-[21/9] max-h-[760px] min-h-[460px] sm:min-h-[520px] overflow-hidden group"
      >
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentIdx
                ? "opacity-100 z-10"
                : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* Cinematic AutoPlay Video or Responsive Picture */}
            {slide.videoUrl ? (
              <div className="relative w-full h-full overflow-hidden">
                <video
                  ref={(el) => {
                    videoRefs.current[idx] = el;
                    if (el && idx === currentIdx) {
                      el.play().catch(() => {});
                    }
                  }}
                  src={slide.videoUrl}
                  poster={slide.desktopImg}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover object-center transform transition-transform duration-1000 ease-out group-hover:scale-105"
                />
              </div>
            ) : (
              <picture className="block relative w-full h-full">
                {slide.mobileImg && slide.mobileImg !== slide.desktopImg && (
                  <source media="(max-width: 639px)" srcSet={slide.mobileImg} />
                )}
                <Image
                  src={slide.desktopImg}
                  alt={slide.title}
                  fill
                  priority={idx === 0}
                  unoptimized
                  className="w-full h-full object-cover object-center transform transition-transform duration-1000 ease-out group-hover:scale-105"
                />
              </picture>
            )}

            {/* Bottom vignette gradient & typography: perfectly centered and legible on mobile & desktop */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 flex flex-col justify-end p-6 sm:p-12 md:p-16 text-[#FBF9F5]">
              <div className="max-w-4xl space-y-1.5 sm:space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] sm:text-xs uppercase tracking-[0.3em] text-[#C5A880] font-mono font-semibold">
                    Atelier Campaign
                  </span>
                  {slide.videoUrl && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-white/90 text-[9px] uppercase tracking-wider backdrop-blur-md border border-white/10 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-pulse" />
                      Live Film
                    </span>
                  )}
                </div>
                <h2 className="font-sans font-light text-2xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-[0.14em] text-white leading-tight max-w-3xl">
                  {slide.title}
                </h2>
                {slide.subtitle && (
                  <p className="text-xs sm:text-sm md:text-base text-[#E2D8CC] max-w-xl font-light line-clamp-2 leading-relaxed">
                    {slide.subtitle}
                  </p>
                )}
                {slide.ctaText && (
                  <div className="pt-2 sm:pt-4">
                    <span className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#C5A880] text-[#111111] text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] shadow-lg group-hover:bg-[#DFCAAB] transition-colors">
                      <span>{slide.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </Link>

      {/* Luxury Cinematic Video Controls Floating Pill */}
      {hasActiveVideo && (
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          {/* Audio Unmute / Mute Button */}
          <button
            type="button"
            onClick={toggleSound}
            aria-label={isMuted ? "Unmute campaign audio" : "Mute campaign audio"}
            title={isMuted ? "Turn Sound On" : "Mute Sound"}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all text-xs font-mono shadow-md cursor-pointer hover:border-[#C5A880]"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[#C5A880]" />
                <span className="text-[10px] uppercase tracking-wider hidden sm:inline">Muted</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#C5A880]" />
                <span className="text-[10px] uppercase tracking-wider hidden sm:inline">Sound On</span>
              </>
            )}
          </button>

          {/* Video Play / Pause Button */}
          <button
            type="button"
            onClick={togglePlayback}
            aria-label={isPlaying ? "Pause campaign film" : "Play campaign film"}
            title={isPlaying ? "Pause Video" : "Play Video"}
            className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all shadow-md cursor-pointer hover:border-[#C5A880]"
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      )}

      {/* Slide Navigation Controls */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-all border border-white/20 cursor-pointer"
            aria-label="Previous Banner"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-all border border-white/20 cursor-pointer"
            aria-label="Next Banner"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIdx(idx)}
                className={`h-1.5 transition-all rounded-full cursor-pointer ${
                  idx === currentIdx ? "w-6 bg-[#C5A880]" : "w-1.5 bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
