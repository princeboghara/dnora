"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { DnoraLoadingScreen } from "./DnoraLoadingScreen";

export function GlobalPreloader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initial visit preloader
  const [showInitial, setShowInitial] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Route change indicator state
  const [isRouteNavigating, setIsRouteNavigating] = useState(false);

  // 1. Initial Page Load Animation (1.2s authentic logo handwriting)
  useEffect(() => {
    // Start fade out after handwriting completes
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1250);

    // Completely unmount preloader after fade out finishes
    const unmountTimer = setTimeout(() => {
      setShowInitial(false);
    }, 1800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  // 2. Intercept internal link clicks and browser back/forward for smooth route transition
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Only trigger for internal links that are different from current page
      if (
        href.startsWith("/") &&
        !href.startsWith("/#") &&
        !href.startsWith("mailto:") &&
        !href.startsWith("tel:") &&
        target.target !== "_blank"
      ) {
        const urlWithoutHash = href.split("#")[0];
        const currentPath = window.location.pathname;

        if (urlWithoutHash !== currentPath) {
          setIsRouteNavigating(true);
        }
      }
    };

    const handlePopState = () => {
      setIsRouteNavigating(true);
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleAnchorClick, { capture: true });
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // 3. Reset route transition when pathname or searchParams change
  useEffect(() => {
    if (isRouteNavigating) {
      const timer = setTimeout(() => {
        setIsRouteNavigating(false);
      }, 550);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams, isRouteNavigating]);

  return (
    <>
      {/* Initial Website Visit / Refresh Preloader */}
      {showInitial && (
        <div
          className={`fixed inset-0 z-[9999] transition-all duration-600 ease-out pointer-events-auto ${
            isFadingOut
              ? "opacity-0 pointer-events-none scale-[1.01]"
              : "opacity-100 pointer-events-auto scale-100"
          }`}
        >
          <DnoraLoadingScreen
            fullScreen
            text="D'NORA LUXURY ESSENTIALS"
            subtitle="CRAFTING BESPOKE SILHOUETTES"
          />
        </div>
      )}

      {/* Luxury Route Navigation Transition Effects */}
      {isRouteNavigating && (
        <div className="fixed inset-0 z-[9995] pointer-events-none">
          {/* 1. Top High-Precision Golden Shimmer Rail */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#FAF8F5]/80 overflow-hidden shadow-[0_0_18px_rgba(197,168,128,0.9)]">
            <div className="h-full bg-gradient-to-r from-[#C5A880] via-[#F3E5D0] to-[#9E7D4E] animate-[shimmer_1.2s_infinite_linear] w-full" />
          </div>

          {/* 2. Ambient Silk Blur Backdrop */}
          <div className="absolute inset-0 bg-[#111111]/15 backdrop-blur-[2px] transition-opacity duration-300" />

          {/* 3. Centered Luxury Atelier Transition Capsule */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-[#141414]/95 text-[#F5F2EB] border border-[#C5A880]/50 backdrop-blur-xl px-6 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.35)] flex items-center gap-4 transform animate-in fade-in zoom-in-95 duration-200">
              {/* Golden Atelier Monogram */}
              <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-[#C5A880] via-[#E2CEB2] to-[#9E7D4E] p-[1.5px] shadow-sm flex-shrink-0">
                <div className="w-full h-full rounded-full bg-[#141414] flex items-center justify-center">
                  <span className="font-sans text-sm font-bold text-[#C5A880] tracking-tight">
                    D
                  </span>
                </div>
              </div>

              {/* Transition Text & Status */}
              <div className="text-left space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#F5F2EB]">
                    D&apos;NORA
                  </span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-ping" />
                </div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#C5A880] font-medium font-sans">
                  Entering Atelier Collection...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
