"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowRight, Volume2, VolumeX } from "lucide-react";
import { HeroBanner } from "@/types";

interface HeroSliderProps {
  banners: HeroBanner[];
}

export function HeroSlider({ banners }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeBanners = banners.filter((b) => b.is_active && b.status === "published");
  const currentBanner = activeBanners[currentIndex] || activeBanners[0];

  const goToNext = useCallback(() => {
    if (activeBanners.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  }, [activeBanners.length]);

  const goToPrev = useCallback(() => {
    if (activeBanners.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  }, [activeBanners.length]);

  // Handle Slide Timing (Image vs Video)
  useEffect(() => {
    if (!currentBanner || activeBanners.length <= 1) return;

    // Clear any previous timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (currentBanner.media_type === "image") {
      const durationMs = (currentBanner.duration_seconds || 5) * 1000;
      timerRef.current = setTimeout(() => {
        goToNext();
      }, durationMs);
    } else if (currentBanner.media_type === "video") {
      // If video, ensure video plays
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current
          .play()
          .catch(() => {
            // Autoplay might fail if browser restricts; fallback to duration
            timerRef.current = setTimeout(() => {
              goToNext();
            }, (currentBanner.duration_seconds || 8) * 1000);
          });
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentIndex, currentBanner, goToNext, activeBanners.length]);

  if (!currentBanner) return null;

  const alignmentClasses = {
    left: "items-start text-left",
    center: "items-center text-center",
    right: "items-end text-right",
  };

  const currentAlign = currentBanner.text_alignment || "left";

  return (
    <section className="relative w-full h-[82vh] min-h-[580px] max-h-[920px] bg-[#0E0E0E] overflow-hidden select-none">
      {/* Media Layer */}
      <div className="absolute inset-0 w-full h-full">
        {currentBanner.media_type === "video" ? (
          <video
            ref={videoRef}
            key={currentBanner.id}
            src={currentBanner.media_url}
            autoPlay
            muted={isMuted}
            playsInline
            onEnded={goToNext}
            className="w-full h-full object-cover transition-opacity duration-1000"
          />
        ) : (
          <div className="relative w-full h-full">
            <Image
              src={currentBanner.media_url}
              alt={currentBanner.title}
              fill
              priority
              fetchPriority="high"
              sizes="100vw"
              className="object-cover transition-transform duration-1000 ease-out"
            />
          </div>
        )}

        {/* Subtle Luxury Scrim Overlay for Typographic Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/35 pointer-events-none" />
      </div>

      {/* Hero Typography & CTA Content */}
      <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-6 sm:px-12 flex flex-col justify-end pb-16 sm:pb-24">
        <div className={`max-w-2xl flex flex-col ${alignmentClasses[currentAlign]} animate-in fade-in slide-in-from-bottom-6 duration-700`}>
          {/* Subtitle / Drop Label */}
          {currentBanner.subtitle && (
            <span className="text-xs sm:text-sm uppercase tracking-[0.25em] text-[#C5A880] font-semibold mb-3">
              {currentBanner.subtitle}
            </span>
          )}

          {/* Editorial Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-heading font-extrabold text-[#FAF9F6] tracking-tight leading-[1.08] mb-6">
            {currentBanner.title}
          </h1>

          {/* CTA Button */}
          <div>
            <Link
              href={currentBanner.button_link || "/shop"}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-[#FAF9F6] text-[#0E0E0E] text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#C5A880] hover:text-[#0E0E0E] transition-all rounded shadow-lg"
            >
              <span>{currentBanner.button_text || "Explore Collection"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Video Audio Control Toggle (if video) */}
      {currentBanner.media_type === "video" && (
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute top-6 right-6 z-20 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white/90 backdrop-blur-md transition-all border border-white/10"
          aria-label={isMuted ? "Unmute video" : "Mute video"}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      )}

      {/* Transparent Elegant Navigation Arrows (< >) */}
      {activeBanners.length > 1 && (
        <div className="absolute inset-y-0 inset-x-4 sm:inset-x-8 flex items-center justify-between pointer-events-none z-20">
          <button
            onClick={goToPrev}
            aria-label="Previous slide"
            className="pointer-events-auto p-2.5 sm:p-3 rounded-full bg-black/20 hover:bg-black/50 text-white/80 hover:text-white backdrop-blur-sm border border-white/10 transition-all"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={goToNext}
            aria-label="Next slide"
            className="pointer-events-auto p-2.5 sm:p-3 rounded-full bg-black/20 hover:bg-black/50 text-white/80 hover:text-white backdrop-blur-sm border border-white/10 transition-all"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      )}

      {/* Bottom Minimal Line Pagination Indicators */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 z-20 flex items-center justify-center gap-2">
          {activeBanners.map((banner, index) => (
            <button
              key={banner.id}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
              className="h-1 transition-all duration-300 rounded-full overflow-hidden"
              style={{
                width: index === currentIndex ? "32px" : "12px",
                backgroundColor: index === currentIndex ? "#FAF9F6" : "rgba(255, 255, 255, 0.3)",
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
