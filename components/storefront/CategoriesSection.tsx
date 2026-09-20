"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductCategory } from "@/types";
import { getResolvedFontFamily } from "@/lib/font-constants";

interface CategoriesSectionProps {
  categories: ProductCategory[];
  title?: string;
  headingColor?: string;
  headingFontSize?: string;
  headingFontFamily?: string;
  headingFontWeight?: string;
  cardGap?: number;
  cardSize?: "sm" | "md" | "lg";
  cardWidth?: number;
}

export function CategoriesSection({
  categories,
  title = "CATEGORIES",
  headingColor,
  headingFontSize,
  headingFontFamily,
  headingFontWeight,
  cardGap,
  cardSize = "md",
  cardWidth,
}: CategoriesSectionProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 260;
    scrollRef.current.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  if (!categories || categories.length === 0) return null;

  const resolvedFont = getResolvedFontFamily(headingFontFamily);

  return (
    <section id="categories" className="py-6 sm:py-8 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Section Header */}
        <div className="text-center max-w-xl mx-auto mb-3.5 sm:mb-5">
          <h2
            className="tracking-tight uppercase font-arial-rounded text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900"
            style={{
              fontFamily: resolvedFont,
              color: headingColor || undefined,
              fontSize: headingFontSize
                ? headingFontSize.includes("px")
                  ? headingFontSize
                  : `${headingFontSize}px`
                : undefined,
              fontWeight: headingFontWeight || undefined,
            }}
          >
            {title}
          </h2>
        </div>

        {/* Carousel Container with Subtle Chevron Controls */}
        <div className="relative max-w-5xl mx-auto px-2 sm:px-6">
          <button
            type="button"
            onClick={() => handleScroll("left")}
            aria-label="Previous categories"
            className="hidden sm:flex absolute -left-4 lg:-left-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-slate-200 shadow-sm items-center justify-center text-slate-900 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => handleScroll("right")}
            aria-label="Next categories"
            className="hidden sm:flex absolute -right-4 lg:-right-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-slate-200 shadow-sm items-center justify-center text-slate-900 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Horizontal Scrolling Medium Circular Cards Carousel */}
          {(() => {
            const circleSizeClass =
              cardWidth !== undefined
                ? ""
                : cardSize === "sm"
                ? "w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28"
                : cardSize === "lg"
                ? "w-28 h-28 sm:w-34 sm:h-34 md:w-38 md:h-38"
                : "w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32";

            const circleInlineStyle = cardWidth
              ? { width: `${cardWidth}px`, height: `${cardWidth}px` }
              : undefined;

            return (
              <div
                ref={scrollRef}
                className={cn(
                  "flex items-start justify-start sm:justify-center overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 pt-1 px-2",
                  cardGap === undefined && "gap-5 sm:gap-7 md:gap-8"
                )}
                style={{
                  scrollBehavior: "smooth",
                  gap: cardGap !== undefined ? `${cardGap}px` : undefined,
                }}
              >
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="group flex flex-col items-center shrink-0 snap-start select-none cursor-pointer focus:outline-none"
                  >
                    {/* Circle Card */}
                    <div
                      style={circleInlineStyle}
                      className={cn(
                        "relative rounded-full overflow-hidden bg-slate-100 border border-slate-200 group-hover:border-slate-900 shadow-xs transition-all duration-300",
                        circleSizeClass
                      )}
                    >
                      {category.image_url ? (
                        <Image
                          src={category.image_url}
                          alt={category.name}
                          fill
                          sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, 128px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                          {category.name.slice(0, 2)}
                        </div>
                      )}

                      {/* Low internet shimmer shine placeholder */}
                      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer-shine pointer-events-none" />

                      {/* Subtle Inner Ring */}
                      <div className="absolute inset-0 rounded-full border border-black/5 pointer-events-none group-hover:border-black/20 transition-colors" />
                    </div>

                    <div className="mt-2.5 text-center">
                      <span className="text-[11px] sm:text-xs font-heading font-medium uppercase tracking-[0.14em] text-[#0E0E0E] group-hover:underline block transition-all">
                        {category.name}
                      </span>
                    </div>
                  </Link>
                ))}

                {/* View All Silhouettes Circle */}
                <Link
                  href="/shop"
                  className="group flex flex-col items-center shrink-0 snap-start select-none cursor-pointer focus:outline-none"
                >
                  <div
                    style={circleInlineStyle}
                    className={cn(
                      "relative rounded-full overflow-hidden bg-slate-900 text-white border border-slate-900 flex flex-col items-center justify-center p-2 text-center transition-all duration-300 group-hover:bg-slate-800 shadow-xs",
                      circleSizeClass
                    )}
                  >
                    <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-slate-300">
                      All
                    </span>
                    <span className="text-[10px] sm:text-xs font-heading font-bold tracking-wider uppercase mt-0.5">
                      Bags
                    </span>
                    <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center mt-1.5 group-hover:scale-110 transition-transform">
                      <ArrowRight className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="mt-2.5 text-center">
                    <span className="text-[11px] sm:text-xs font-heading font-medium uppercase tracking-[0.14em] text-slate-900 group-hover:underline block">
                      View All
                    </span>
                  </div>
                </Link>
              </div>
            );
          })()}
        </div>
      </div>
    </section>
  );
}
