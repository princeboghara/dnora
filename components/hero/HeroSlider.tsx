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
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Touch swipe refs
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

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

  // Handle Slide Timing (Image vs Video) with pause support
  useEffect(() => {
    if (!currentBanner || activeBanners.length <= 1 || isPaused) return;

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
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {
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
  }, [currentIndex, currentBanner, goToNext, activeBanners.length, isPaused]);

  // Keyboard navigation (ArrowLeft, ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) {
      goToNext(); // Swiped left -> next
    } else if (distance < -50) {
      goToPrev(); // Swiped right -> prev
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!currentBanner) return null;

  const alignmentClasses = {
    left: "items-start text-left",
    center: "items-center text-center",
    right: "items-end text-right",
  };

  const currentAlign = currentBanner.text_alignment || "left";

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-[82vh] min-h-[580px] max-h-[920px] bg-[#0E0E0E] overflow-hidden select-none"
      aria-label="Hero Showcase Carousel"
    >
      {/* Background Media Layer */}
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

        {/* Refined Luxury Scrim Overlay (Miraggio subtle vignette) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/30 pointer-events-none" />
      </div>

      {/* Hero Typography & CTA Content Area */}
      <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-6 sm:px-12 flex flex-col justify-end pb-24 sm:pb-28">
        <div
          className={`max-w-2xl flex flex-col ${alignmentClasses[currentAlign]} animate-in fade-in slide-in-from-bottom-6 duration-700`}
        >
          {/* Subtitle / Collection Drop Tag */}
          {currentBanner.subtitle && (
            <span className="text-[11px] sm:text-xs uppercase tracking-[0.28em] text-[#C5A880] font-bold mb-3 drop-shadow-sm">
              {currentBanner.subtitle}
            </span>
          )}

          {/* Editorial Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-heading font-extrabold text-[#FAF9F6] tracking-tight leading-[1.08] mb-6 drop-shadow-sm">
            {currentBanner.title}
          </h1>

          {/* Miraggio Styled CTA Button */}
          <div>
            <Link
              href={currentBanner.button_link || "/shop"}
              className="group inline-flex items-center gap-3 px-8 sm:px-10 py-3.5 sm:py-4 bg-[#FAF9F6] text-[#0E0E0E] text-[11px] sm:text-xs uppercase tracking-[0.22em] font-bold hover:bg-[#C5A880] hover:text-[#0E0E0E] transition-all rounded-sm shadow-xl hover:shadow-2xl cursor-pointer"
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
          type="button"
          onClick={() => setIsMuted(!isMuted)}
          className="absolute top-6 right-6 z-20 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white/90 backdrop-blur-md transition-all border border-white/15 cursor-pointer"
          aria-label={isMuted ? "Unmute video" : "Mute video"}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      )}

      {/* MIRAGGIO-INSPIRED CLEAN BOTTOM AREA CONTROLS (< >) */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-8 inset-x-0 z-20 pointer-events-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-12 flex items-center justify-between gap-2">
            {/* Left: Minimalist Progress Pill Indicators */}
            <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
              {activeBanners.map((banner, index) => {
                const isActive = index === currentIndex;
                return (
                  <button
                    key={banner.id}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    className="h-1 sm:h-1.5 rounded-full transition-all duration-400 overflow-hidden cursor-pointer focus:outline-none"
                    style={{
                      width: isActive ? "32px" : "10px",
                      backgroundColor: isActive ? "#FAF9F6" : "rgba(255, 255, 255, 0.4)",
                    }}
                  />
                );
              })}
            </div>

            {/* Right: Clean Bottom Navigation Dock with < > Controls and Slide Counter */}
            <div className="flex items-center gap-1 pointer-events-auto bg-black/60 sm:bg-black/45 hover:bg-black/70 backdrop-blur-md border border-white/25 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg transition-colors">
              {/* Previous (<) Control */}
              <button
                type="button"
                onClick={goToPrev}
                aria-label="Previous slide"
                className="p-1.5 sm:p-1 rounded-full text-white/90 hover:text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>

              {/* Slide Counter (e.g. 01 / 04) */}
              <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-white/95 px-1.5 sm:px-2 select-none">
                {String(currentIndex + 1).padStart(2, "0")}&nbsp;/&nbsp;{String(activeBanners.length).padStart(2, "0")}
              </span>

              {/* Next (>) Control */}
              <button
                type="button"
                onClick={goToNext}
                aria-label="Next slide"
                className="p-1.5 sm:p-1 rounded-full text-white/90 hover:text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
