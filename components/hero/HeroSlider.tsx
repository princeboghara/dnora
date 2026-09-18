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
          {/* Eyebrow / Collection Drop Tag */}
          {currentBanner.subtitle && (
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#FAF9F6]/90 font-semibold mb-3 drop-shadow-sm">
              {currentBanner.subtitle}
            </span>
          )}

          {/* Editorial Campaign Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold text-[#FAF9F6] tracking-tight leading-[1.06] mb-3 drop-shadow-sm">
            {currentBanner.title}
          </h1>

          {/* Short Supporting Editorial Text */}
          <p className="text-xs sm:text-sm text-[#FAF9F6]/85 max-w-xl font-normal leading-relaxed mb-6 drop-shadow-sm">
            Handcrafted architectural silhouettes sculpted from full-grain Italian leather.
          </p>

          {/* Minimal Editorial CTA Button */}
          <div>
            <Link
              href={currentBanner.button_link || "/shop"}
              className="group inline-flex items-center gap-3 px-8 sm:px-10 py-3.5 sm:py-4 bg-[#FAF9F6] text-[#0E0E0E] border border-[#0E0E0E] hover:bg-[#0E0E0E] hover:text-[#FAF9F6] text-[11px] sm:text-xs uppercase tracking-[0.24em] font-bold rounded-xs transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
            >
              <span>{currentBanner.button_text || "SHOP COLLECTION"}</span>
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

      {/* Minimalist Progress Indicators on bottom left (No capsule button) */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-6 sm:bottom-8 left-6 sm:left-12 z-20 pointer-events-auto flex items-center gap-1.5 sm:gap-2">
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
                  width: isActive ? "28px" : "8px",
                  backgroundColor: isActive ? "#FAF9F6" : "rgba(255, 255, 255, 0.35)",
                }}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
