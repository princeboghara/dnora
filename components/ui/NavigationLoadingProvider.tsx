"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  Suspense,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { LuxuryPageLoader } from "./LuxuryPageLoader";

interface NavigationLoadingContextType {
  isNavigating: boolean;
  startTransition: () => void;
  stopTransition: () => void;
}

const NavigationLoadingContext = createContext<NavigationLoadingContextType>({
  isNavigating: false,
  startTransition: () => {},
  stopTransition: () => {},
});

export function usePageTransition() {
  return useContext(NavigationLoadingContext);
}

function NavigationWatcher({
  onRouteChanged,
}: {
  onRouteChanged: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip initial page mount so it doesn't cause an immediate start/stop glitch
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onRouteChanged();
  }, [pathname, searchParams, onRouteChanged]);

  return null;
}

export function NavigationLoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startTransition = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
    startTimeRef.current = Date.now();
    setIsFadingOut(false);
    setIsNavigating(true);
  }, []);

  const stopTransition = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current;
    // Guaranteed minimum display time (1600ms) so the full signature D-N-O-R-A sequence completes
    const minDisplayTime = 1600;
    const remaining = Math.max(0, minDisplayTime - elapsed);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setIsFadingOut(true);

      fadeTimerRef.current = setTimeout(() => {
        setIsNavigating(false);
        setIsFadingOut(false);
        timerRef.current = null;
        fadeTimerRef.current = null;
      }, 350); // 350ms graceful dissolve fadeout
    }, remaining);
  }, []);

  const handleRouteChanged = useCallback(() => {
    if (isNavigating) {
      stopTransition();
    }
  }, [isNavigating, stopTransition]);

  // Intercept internal link navigation clicks smoothly across the document
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      const target = anchor.getAttribute("target");
      const download = anchor.getAttribute("download");

      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        target === "_blank" ||
        download !== null
      ) {
        return;
      }

      // Ignore if modifier keys pressed (new tab/window)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      try {
        const targetUrl = new URL(href, window.location.origin);
        if (targetUrl.origin !== window.location.origin) {
          return;
        }

        // Ignore if clicking currently active route with same query
        if (
          targetUrl.pathname === window.location.pathname &&
          targetUrl.search === window.location.search
        ) {
          return;
        }

        startTransition();
      } catch {
        // invalid URL, ignore
      }
    };

    const handlePopState = () => {
      startTransition();
    };

    document.addEventListener("click", handleClick, { capture: true });
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      window.removeEventListener("popstate", handlePopState);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, [startTransition]);

  return (
    <NavigationLoadingContext.Provider
      value={{
        isNavigating,
        startTransition,
        stopTransition,
      }}
    >
      <Suspense fallback={null}>
        <NavigationWatcher onRouteChanged={handleRouteChanged} />
      </Suspense>
      {isNavigating && (
        <LuxuryPageLoader
          isNavigating={isNavigating}
          isFadingOut={isFadingOut}
          fullscreen
        />
      )}
      {children}
    </NavigationLoadingContext.Provider>
  );
}
