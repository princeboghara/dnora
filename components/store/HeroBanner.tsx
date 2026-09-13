"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight, Volume2, VolumeX, Play, Pause } from "lucide-react";
import { Banner } from "@/types";
import { getActiveHeroBanners } from "@/lib/services/cms-service";

interface BannerSlide {
  id: string;
  title?: string;
  subtitle?: string;
  href: string;
  desktopImg: string;
  mobileImg?: string;
  videoUrl?: string;
  ctaText?: string;
  durationSeconds?: number;
}

function mapBannersToSlides(banners: Banner[]): BannerSlide[] {
  return banners.map((b) => ({
    id: b.id,
    title: b.title || undefined,
    subtitle: b.subtitle || undefined,
    href: b.cta_link || "/shop",
    desktopImg: b.desktop_image_url,
    mobileImg: b.mobile_image_url || b.desktop_image_url,
    videoUrl: b.video_url || undefined,
    ctaText: b.cta_text || undefined,
    durationSeconds: b.duration_seconds || 5,
  }));
}

export function HeroBanner({ initialBanners }: { initialBanners?: Banner[] }) {
  // Never default to dummy video or fake Charles & Keith items
  const [slides, setSlides] = useState<BannerSlide[]>(() => {
    return initialBanners && initialBanners.length > 0
      ? mapBannersToSlides(initialBanners)
      : [];
  });
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const imageTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync active banners from storefront service
  useEffect(() => {
    async function loadBanners() {
      try {
        const banners = await getActiveHeroBanners();
        setSlides(banners && banners.length > 0 ? mapBannersToSlides(banners) : []);
      } catch (err) {
        console.error("Failed to load hero banners:", err);
      }
    }
    loadBanners();
  }, []);

  const nextSlide = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (slides.length > 1) {
      setCurrentIdx((prev) => (prev + 1) % slides.length);
    }
  };

  const prevSlide = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (slides.length > 1) {
      setCurrentIdx((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  // Manage video playback across slide changes
  useEffect(() => {
    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      if (idx === currentIdx) {
        if (isPlaying) {
          video.currentTime = 0;
          video.play().catch(() => {});
        }
      } else {
        video.pause();
      }
    });
  }, [currentIdx, isPlaying]);

  // Slideshow auto-advance logic:
  // - If Video: advances when video finishes playing (onEnded)
  // - If Image: advances after durationSeconds (defaults to 5s)
  useEffect(() => {
    if (imageTimerRef.current) {
      clearTimeout(imageTimerRef.current);
      imageTimerRef.current = null;
    }

    if (slides.length <= 1) return;

    const activeSlide = slides[currentIdx % slides.length];
    if (!activeSlide || activeSlide.videoUrl) return;

    const duration = (activeSlide.durationSeconds || 5) * 1000;
    imageTimerRef.current = setTimeout(() => {
      setCurrentIdx((prev) => (prev + 1) % slides.length);
    }, duration);

    return () => {
      if (imageTimerRef.current) {
        clearTimeout(imageTimerRef.current);
        imageTimerRef.current = null;
      }
    };
  }, [currentIdx, slides]);

  // Video onEnded handler
  const handleVideoEnded = () => {
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

  // If no banners are active, cleanly render nothing (NO dummy video!)
  if (slides.length === 0) {
    return null;
  }

  const activeSlide = slides[currentIdx % (slides.length || 1)] || slides[0];
  if (!activeSlide) return null;
  const hasActiveVideo = Boolean(activeSlide.videoUrl);
  const hasNarrative = Boolean(
    activeSlide.title || activeSlide.subtitle || activeSlide.ctaText
  );

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
                  loop={slides.length === 1}
                  muted={isMuted}
                  playsInline
                  preload="auto"
                  onEnded={handleVideoEnded}
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
                  alt={slide.title || "Banner"}
                  fill
                  priority={idx === 0}
                  unoptimized
                  className="w-full h-full object-cover object-center transform transition-transform duration-1000 ease-out group-hover:scale-105"
                />
              </picture>
            )}

            {/* Optional bottom vignette gradient & typography (subtle minimal gradient so video stays bright) */}
            {hasNarrative && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent flex flex-col justify-end p-6 sm:p-12 md:p-16 text-[#FBF9F5]">
                <div className="max-w-4xl space-y-1.5 sm:space-y-2">
                  {slide.title && (
                    <h2 className="font-sans font-light text-2xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-[0.14em] text-white leading-tight max-w-3xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                      {slide.title}
                    </h2>
                  )}
                  {slide.subtitle && (
                    <p className="text-xs sm:text-sm md:text-base text-[#F0EBE3] max-w-xl font-light line-clamp-2 leading-relaxed drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">
                      {slide.subtitle}
                    </p>
                  )}
                  {slide.ctaText && (
                    <div className="pt-2 sm:pt-3">
                      <span className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#C5A880] text-[#111111] text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] shadow-lg group-hover:bg-[#DFCAAB] transition-colors">
                        <span>{slide.ctaText}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 transition-all text-xs font-mono shadow-md cursor-pointer hover:border-[#C5A880]"
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
            className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 transition-all shadow-md cursor-pointer hover:border-[#C5A880]"
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      )}

      {/* Slide Navigation Controls: repositioned lower, miniaturized, transparent glassmorphism */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            className="absolute left-3 sm:left-6 bottom-3 sm:bottom-5 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/25 hover:bg-black/50 text-white/80 hover:text-white backdrop-blur-xs flex items-center justify-center transition-all border border-white/20 cursor-pointer shadow-sm"
            aria-label="Previous Banner"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-3 sm:right-6 bottom-3 sm:bottom-5 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/25 hover:bg-black/50 text-white/80 hover:text-white backdrop-blur-xs flex items-center justify-center transition-all border border-white/20 cursor-pointer shadow-sm"
            aria-label="Next Banner"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
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
