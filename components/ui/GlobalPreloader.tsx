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

  // 2. Intercept internal link clicks for smooth route transition
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

    document.addEventListener("click", handleAnchorClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleAnchorClick, { capture: true });
    };
  }, []);

  // 3. Reset route transition when pathname or searchParams change
  useEffect(() => {
    if (isRouteNavigating) {
      const timer = setTimeout(() => {
        setIsRouteNavigating(false);
      }, 350);
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

      {/* Top Gold Progress Rail during Route Transitions */}
      {isRouteNavigating && (
        <div className="fixed top-0 left-0 right-0 z-[9998] h-[2.5px] bg-[#FAF8F5]/60 pointer-events-none overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#C5A880] via-[#9E7D4E] to-[#C5A880] animate-pulse w-full shadow-[0_0_12px_rgba(197,168,128,0.8)]" />
        </div>
      )}
    </>
  );
}
