"use client";

import React from "react";
import Image from "next/image";

interface LuxuryPageLoaderProps {
  isNavigating?: boolean;
  isFadingOut?: boolean;
  fullscreen?: boolean;
}

export function LuxuryPageLoader({
  isNavigating = true,
  isFadingOut = false,
  fullscreen = true,
}: LuxuryPageLoaderProps) {
  if (!isNavigating) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading DNORA page..."
      className={
        fullscreen
          ? `fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md transition-all duration-350 ease-out ${
              isFadingOut ? "opacity-0 scale-[1.02] pointer-events-none" : "opacity-100 scale-100"
            }`
          : `w-full py-20 flex flex-col items-center justify-center bg-transparent transition-all duration-350 ease-out ${
              isFadingOut ? "opacity-0 scale-[1.02] pointer-events-none" : "opacity-100 scale-100"
            }`
      }
    >
      <div className="flex flex-col items-center max-w-sm px-6 text-center select-none">
        {/* Exact DNORA Brand Logo Handwriting / Progressive Stroke Reveal Container */}
        <div className="relative w-64 sm:w-80 aspect-[384/90] flex items-center justify-center overflow-hidden">
          {/* 1. Faint, Soft Silhouette of the EXACT logo as guide */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.09] flex items-center justify-center">
            <Image
              src="/images/logo.png"
              alt=""
              fill
              priority
              sizes="(max-width: 640px) 256px, 320px"
              className="object-contain"
            />
          </div>

          {/* 2. Exact Letter Stroke Reveals (Pure GPU hardware-accelerated layers) */}
          {/* D - 1. Vertical Straight Line (Pela ubho line) */}
          <div
            className="absolute inset-0 pointer-events-none will-change-[clip-path,opacity]"
            style={{
              animation: "dnoraDrawDown 0.3s cubic-bezier(0.25, 1, 0.5, 1) forwards 0.05s",
              opacity: 0,
            }}
          >
            <Image
              src="/images/loader/d_stem.png"
              alt=""
              fill
              priority
              sizes="320px"
              className="object-contain"
            />
          </div>

          {/* D - 2. Curved Bowl (Pachi ) line) */}
          <div
            className="absolute inset-0 pointer-events-none will-change-[clip-path,opacity]"
            style={{
              animation: "dnoraDrawCurve 0.32s cubic-bezier(0.25, 1, 0.5, 1) forwards 0.32s",
              opacity: 0,
            }}
          >
            <Image
              src="/images/loader/d_curve.png"
              alt=""
              fill
              priority
              sizes="320px"
              className="object-contain"
            />
          </div>

          {/* N - Progressive Downward Draw */}
          <div
            className="absolute inset-0 pointer-events-none will-change-[clip-path,opacity]"
            style={{
              animation: "dnoraDrawDown 0.32s cubic-bezier(0.25, 1, 0.5, 1) forwards 0.60s",
              opacity: 0,
            }}
          >
            <Image
              src="/images/loader/n.png"
              alt=""
              fill
              priority
              sizes="320px"
              className="object-contain"
            />
          </div>

          {/* O - Soft Radial/Vertical Reveal */}
          <div
            className="absolute inset-0 pointer-events-none will-change-[clip-path,opacity,filter]"
            style={{
              animation: "dnoraDrawSoft 0.34s cubic-bezier(0.25, 1, 0.5, 1) forwards 0.86s",
              opacity: 0,
            }}
          >
            <Image
              src="/images/loader/o.png"
              alt=""
              fill
              priority
              sizes="320px"
              className="object-contain"
            />
          </div>

          {/* R - Progressive Downward Draw with Sweeping Leg */}
          <div
            className="absolute inset-0 pointer-events-none will-change-[clip-path,opacity]"
            style={{
              animation: "dnoraDrawDown 0.32s cubic-bezier(0.25, 1, 0.5, 1) forwards 1.12s",
              opacity: 0,
            }}
          >
            <Image
              src="/images/loader/r.png"
              alt=""
              fill
              priority
              sizes="320px"
              className="object-contain"
            />
          </div>

          {/* A - Progressive Downward Draw with Arch Crossbar */}
          <div
            className="absolute inset-0 pointer-events-none will-change-[clip-path,opacity]"
            style={{
              animation: "dnoraDrawDown 0.32s cubic-bezier(0.25, 1, 0.5, 1) forwards 1.38s",
              opacity: 0,
            }}
          >
            <Image
              src="/images/loader/a.png"
              alt=""
              fill
              priority
              sizes="320px"
              className="object-contain"
            />
          </div>

          {/* 3. Soft Consolidated Logo with Subtle Breathing & Sheen once completely drawn */}
          <div
            className="absolute inset-0 pointer-events-none flex items-center justify-center will-change-[opacity,transform]"
            style={{
              animation: "dnoraSoftBreathe 2.8s ease-in-out infinite 1.72s",
            }}
          >
            {/* Soft diagonal gleam passing across the letters */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-dnora-gleam pointer-events-none z-10" />
          </div>
        </div>

        {/* Minimal Luxury Progress Bar & Subtitle */}
        <div className="mt-5 w-36 h-[2px] bg-slate-200 overflow-hidden rounded-full relative">
          <div
            className="h-full bg-[#0E0E0E] rounded-full"
            style={{
              animation: "dnoraProgress 2s cubic-bezier(0.4, 0, 0.2, 1) infinite",
            }}
          />
        </div>

        <span className="mt-3 text-[10px] font-bold tracking-[0.28em] text-[#73706A] uppercase">
          Maison DNORA
        </span>
      </div>
    </div>
  );
}
