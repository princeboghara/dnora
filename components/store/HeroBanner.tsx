"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
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
  ctaText?: string;
}

const DEFAULT_SLIDES: BannerSlide[] = INITIAL_BANNERS.map((b) => ({
  id: b.id,
  title: b.title,
  subtitle: b.subtitle,
  href: b.cta_link || "/shop",
  desktopImg: b.desktop_image_url,
  mobileImg: b.mobile_image_url || b.desktop_image_url,
  ctaText: b.cta_text || "SHOP THE COLLECTION",
}));

export function HeroBanner() {
  const [slides, setSlides] = useState<BannerSlide[]>(DEFAULT_SLIDES);
  const [hasMounted, setHasMounted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    setHasMounted(true);
    async function loadBanners() {
      try {
        const banners = await getActiveHeroBanners();
        if (banners) {
          const mapped: BannerSlide[] = banners.map((b) => ({
            id: b.id,
            title: b.title,
            subtitle: b.subtitle,
            href: b.cta_link || "/shop",
            desktopImg: b.desktop_image_url,
            mobileImg: b.mobile_image_url || b.desktop_image_url,
            ctaText: b.cta_text || "SHOP THE COLLECTION",
          }));
          setSlides(mapped);
        }
      } catch (err) {
        console.error("Failed to load hero banners:", err);
      }
    }
    loadBanners();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const prevSlide = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (slides.length > 1) {
      setCurrentIdx((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  const nextSlide = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (slides.length > 1) {
      setCurrentIdx((prev) => (prev + 1) % slides.length);
    }
  };

  // If mounted and all hero banners are deleted or inactive, completely hide Hero Banner from homepage
  if (hasMounted && slides.length === 0) {
    return null;
  }

  const activeSlide = slides[currentIdx % (slides.length || 1)] || slides[0];
  if (!activeSlide) return null;

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
            {/* Auto-responsive single image scaling across all device viewports */}
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

            {/* Bottom vignette gradient & typography: perfectly centered and legible on mobile & desktop */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 flex flex-col justify-end p-6 sm:p-12 md:p-16 text-[#FBF9F5]">
              <div className="max-w-4xl space-y-1.5 sm:space-y-2">
                <span className="text-[9px] sm:text-xs uppercase tracking-[0.3em] text-[#C5A880] font-mono font-semibold">
                  Atelier Campaign
                </span>
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

      {/* Slide Navigation Controls */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-all border border-white/20"
            aria-label="Previous Banner"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-all border border-white/20"
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
                className={`h-1.5 transition-all rounded-full ${
                  idx === currentIdx ? "w-6 bg-[#C5A880]" : "w-1.5 bg-white/50"
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
