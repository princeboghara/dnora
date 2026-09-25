"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { CampaignSlide } from "@/lib/data/store";

interface PromoBannerProps {
  slides?: CampaignSlide[];
  heading?: string;
  tagline?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export function PromoBanner({
  slides,
  heading = "THE ARCHITECTURE OF LUXURY",
  tagline = "THE FLORENTINE ATELIER",
  description = "Cut from full-grain vegetable-tanned Italian calfskin with hand-painted beveled edges and signature brushed champagne brass hardware.",
  buttonText = "EXPLORE THE CAMPAIGN",
  buttonLink = "/shop",
  imageUrl = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=85",
  isActive = true,
}: PromoBannerProps) {
  // Prepare slides list with fallback to top-level props
  const resolvedSlides: CampaignSlide[] = useMemo(() => {
    return slides && slides.length > 0
      ? slides
      : [
          {
            id: "fallback-slide",
            heading,
            tagline,
            description,
            button_text: buttonText,
            button_link: buttonLink,
            media_type: "image",
            media_url: imageUrl,
            duration_seconds: 6,
          },
        ];
  }, [slides, heading, tagline, description, buttonText, buttonLink, imageUrl]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const totalSlides = resolvedSlides.length;

  // Next Slide handler
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  // Previous Slide handler
  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Auto-advance timer (push transition)
  useEffect(() => {
    if (!isActive || totalSlides <= 1 || isHovered) return;

    const currentSlide = resolvedSlides[currentIndex];
    const duration = (currentSlide?.duration_seconds || 6) * 1000;

    const timer = setTimeout(() => {
      nextSlide();
    }, duration);

    return () => clearTimeout(timer);
  }, [isActive, currentIndex, isHovered, totalSlides, resolvedSlides, nextSlide]);

  // If explicitly inactive, do not render
  if (isActive === false) {
    return null;
  }

  // Handle Touch Swipe on Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    setTouchStartX(null);
  };

  return (
    <section
      aria-label="Campaign Banner Carousel"
      className="relative w-full bg-[#0A0A0A] text-white overflow-hidden my-4 sm:my-6 md:my-8 group select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Horizontal Push Track: Slides push sideways smoothly */}
      <div
        className="flex w-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {resolvedSlides.map((slide, idx) => (
          <div
            key={slide.id || idx}
            className="min-w-full w-full relative min-h-[420px] sm:min-h-[480px] md:min-h-[540px] flex items-center justify-center shrink-0 overflow-hidden"
          >
            {/* Background Media: Video or High-Res Image */}
            <div className="absolute inset-0 z-0">
              {slide.media_type === "video" ? (
                <video
                  src={slide.media_url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover scale-105 filter brightness-70 contrast-105"
                />
              ) : (
                <Image
                  src={slide.media_url}
                  alt={slide.heading || "DNORA Luxury Campaign"}
                  fill
                  sizes="100vw"
                  priority={idx === 0}
                  className="object-cover object-center scale-105 filter brightness-70 contrast-105"
                />
              )}

              {/* Cinematic Luxury Dark Gradients & Radial Vignette */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/80 pointer-events-none" />
              <div className="absolute inset-0 bg-radial-[circle_at_center,_transparent_20%,_rgba(0,0,0,0.6)_100%] pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none" />
            </div>

            {/* Content Shell with Luxury Typography */}
            <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 text-center py-14 sm:py-20 animate-in fade-in zoom-in-95 duration-500">
              {/* Tagline Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#E5C378] text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] mb-4 sm:mb-6 shadow-sm">
                <Sparkles className="w-3 h-3 text-[#E5C378]" />
                <span>{slide.tagline || "THE FLORENTINE ATELIER"}</span>
              </div>

              {/* Main Heading */}
              <h2
                style={{ fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif" }}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-[0.18em] uppercase text-white leading-tight mb-4 drop-shadow-md"
              >
                {slide.heading || "THE ARCHITECTURE OF LUXURY"}
              </h2>

              {/* Gold Divider Line */}
              <div className="w-12 h-[1.5px] bg-[#D4AF37] mx-auto mb-5 sm:mb-6 shadow-xs" />

              {/* Narrative Story */}
              {slide.description && (
                <p className="text-xs sm:text-sm md:text-base text-neutral-200 font-light leading-relaxed max-w-xl mx-auto mb-8 tracking-wide drop-shadow-sm">
                  {slide.description}
                </p>
              )}

              {/* CTA Action Button */}
              {slide.button_text && (
                <div>
                  <Link
                    href={slide.button_link || "/shop"}
                    className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-white text-black hover:bg-[#D4AF37] hover:text-black font-semibold text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-xl group rounded-xs"
                  >
                    <span>{slide.button_text}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows (Shown on multi-slide) */}
      {totalSlides > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous slide"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/80 text-white/80 hover:text-white backdrop-blur-md border border-white/10 flex items-center justify-center transition-all opacity-70 group-hover:opacity-100 cursor-pointer shadow-lg"
          >
            <ChevronLeft className="w-5 h-5 -ml-0.5" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next slide"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/80 text-white/80 hover:text-white backdrop-blur-md border border-white/10 flex items-center justify-center transition-all opacity-70 group-hover:opacity-100 cursor-pointer shadow-lg"
          >
            <ChevronRight className="w-5 h-5 -mr-0.5" />
          </button>
        </>
      )}

      {/* Slide Progress Indicator Dots / Dashes */}
      {totalSlides > 1 && (
        <div className="absolute bottom-5 sm:bottom-6 inset-x-0 z-20 flex items-center justify-center gap-2">
          {resolvedSlides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                idx === currentIndex
                  ? "w-8 bg-[#D4AF37] shadow-sm"
                  : "w-2.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default PromoBanner;
