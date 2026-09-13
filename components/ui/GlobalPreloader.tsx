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

      {/* Luxury Route Navigation Transition Screen */}
      {isRouteNavigating && (
        <div className="fixed inset-0 z-[9995] pointer-events-auto animate-in fade-in duration-200">
          <DnoraLoadingScreen
            fullScreen
            text="D'NORA LUXURY ESSENTIALS"
            subtitle="ENTERING ATELIER COLLECTION..."
          />
        </div>
      )}
    </>
  );
}
