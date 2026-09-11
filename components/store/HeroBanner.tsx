"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { INITIAL_BANNERS } from "@/lib/seed/catalog-data";

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
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadBanners() {
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase
            .from("banners")
            .select("*")
            .eq("is_active", true)
            .order("display_order", { ascending: true });

          if (!error && data && data.length > 0) {
            const mapped: BannerSlide[] = data.map((b) => ({
              id: b.id,
              title: b.title,
              subtitle: b.subtitle,
              href: b.cta_link || "/shop",
              desktopImg: b.desktop_image_url,
              mobileImg: b.mobile_image_url || b.desktop_image_url,
              ctaText: b.cta_text || "DISCOVER THE ATELIER",
            }));
            setSlides(mapped);
          }
        } catch {
          // Ignored
        }
      }
      setIsLoading(false);
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

  // If live banners exist in database, display dynamic slider
  if (slides.length > 0) {
    const activeSlide = slides[currentIdx];
    return (
      <div className="relative w-full overflow-hidden bg-[#111317] select-none">
        <Link
          href={activeSlide.href}
          className="block relative w-full aspect-[640/800] sm:aspect-[3840/1300] overflow-hidden group"
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
              <picture className="block w-full h-full">
                {slide.mobileImg && (
                  <source media="(max-width: 639px)" srcSet={slide.mobileImg} />
                )}
                <Image
                  src={slide.desktopImg}
                  alt={slide.title}
                  fill
                  priority={idx === 0}
                  unoptimized
                  className="w-full h-full object-cover object-center"
                />
              </picture>

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6 sm:p-12 text-[#FBF9F5]">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold">
                  Atelier Campaign
                </span>
                <h2 className="font-sans font-medium text-2xl sm:text-4xl lg:text-5xl uppercase tracking-[0.12em] max-w-2xl text-white mt-1">
                  {slide.title}
                </h2>
                {slide.subtitle && (
                  <p className="text-xs sm:text-sm text-[#E2D8CC] max-w-xl mt-2 line-clamp-2">
                    {slide.subtitle}
                  </p>
                )}
                {slide.ctaText && (
                  <div className="mt-4">
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C5A880] text-[#111111] text-[11px] font-semibold uppercase tracking-[0.2em] group-hover:bg-[#DFCAAB] transition-colors">
                      {slide.ctaText} &rarr;
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </Link>

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

  // Pristine, clean luxury typographic hero state when database banners are cleared
  return (
    <div className="relative w-full bg-[#10131A] text-[#FBF9F5] border-b border-[#222834] overflow-hidden select-none py-20 sm:py-28 lg:py-36 px-4 sm:px-6 lg:px-8">
      {/* Subtle radial ambient background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(197,168,128,0.12),transparent_65%)] pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A202C]/80 border border-[#C5A880]/30 text-[#C5A880] text-[10px] uppercase tracking-[0.3em] font-semibold">
          <Sparkles className="w-3 h-3" />
          <span>Haute Maroquinerie & Fine Luxury</span>
        </div>

        <h1 className="font-sans font-light text-3xl sm:text-5xl lg:text-6xl text-[#FBF9F5] uppercase tracking-[0.15em] leading-tight">
          D&apos;NORA LUXURY ATELIER
        </h1>

        <p className="text-xs sm:text-sm md:text-base text-[#A1ADBE] max-w-xl mx-auto font-light leading-relaxed">
          Crafted with architectural minimalism, noble Italian leathers, and modern Indian heritage.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4">
          <Link
            href="/shop"
            className="px-7 py-3.5 bg-[#C5A880] text-[#111111] text-xs font-semibold uppercase tracking-[0.25em] hover:bg-[#DFCAAB] transition-colors inline-flex items-center gap-2"
          >
            <span>Explore Collection</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="/about"
            className="px-6 py-3.5 bg-transparent border border-[#2D3748] text-[#CBD5E1] text-xs font-semibold uppercase tracking-[0.25em] hover:border-[#C5A880] hover:text-[#FBF9F5] transition-colors"
          >
            <span>The Maison Heritage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
