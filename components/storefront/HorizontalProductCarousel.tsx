"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Product } from "@/types";
import { ProductCard } from "./ProductCard";
import { getResolvedFontFamily } from "@/lib/font-constants";

interface HorizontalProductCarouselProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllLink: string;
  viewAllText?: string;
  headingColor?: string;
  headingFontSize?: string;
  headingFontFamily?: string;
  headingFontWeight?: string;
  cardGap?: number;
  cardSize?: "sm" | "md" | "lg";
  cardWidth?: number;
}

export function HorizontalProductCarousel({
  title,
  products,
  viewAllLink,
  viewAllText = "VIEW ALL",
  headingColor,
  headingFontSize,
  headingFontFamily,
  headingFontWeight,
  cardGap,
  cardSize = "md",
  cardWidth,
}: HorizontalProductCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Allow up to 10 products for a rich continuous scroll like Seen On You
  const displayProducts = products.slice(0, 10);

  if (displayProducts.length === 0) return null;

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth >= 640 ? 300 : container.clientWidth * 0.85;
    container.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  const resolvedFont = getResolvedFontFamily(headingFontFamily);

  return (
    <div className="w-full">
      {/* Centered Section Heading (Clean luxury typography, no extra subtitle text) */}
      <div className="text-center max-w-xl mx-auto mb-3.5 sm:mb-5">
        <h2
          className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight uppercase font-arial-rounded"
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

      {/* Full-width elegant container matching Seen On You */}
      <div className="relative max-w-6xl xl:max-w-7xl mx-auto px-1 sm:px-4">
        {/* Subtle Prev/Next Navigation Controls for Desktop */}
        <button
          type="button"
          onClick={() => handleScroll("left")}
          aria-label="Previous products"
          className="hidden sm:flex absolute -left-4 lg:-left-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-white/95 border border-slate-200 shadow-sm items-center justify-center text-slate-900 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => handleScroll("right")}
          aria-label="Next products"
          className="hidden sm:flex absolute -right-4 lg:-right-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-white/95 border border-slate-200 shadow-sm items-center justify-center text-slate-900 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Continuous Horizontal Scroll Track
            Mobile: w-[calc(50%-6px)] (2 per view, untouched mobile view)
            Laptop/Desktop: sm:w-[240px] md:w-[250px] lg:w-[260px] xl:w-[270px] (compact, proportionate, multiple cards visible)
        */}
        <div
          ref={scrollContainerRef}
          className={cn(
            "flex items-stretch overflow-x-auto snap-x snap-mandatory scrollbar-none pb-3 pt-1 px-1 -mx-1",
            cardGap === undefined && "gap-3 sm:gap-5 lg:gap-6"
          )}
          style={{
            scrollBehavior: "smooth",
            gap: cardGap !== undefined ? `${cardGap}px` : undefined,
          }}
        >
          {(() => {
            const cardWidthClass =
              cardWidth !== undefined
                ? "w-[calc(50%-6px)] sm:w-[var(--custom-card-w)]"
                : cardSize === "sm"
                ? "w-[calc(44%-4px)] sm:w-[190px] md:w-[200px] lg:w-[210px] xl:w-[220px]"
                : cardSize === "lg"
                ? "w-[calc(65%-8px)] sm:w-[290px] md:w-[310px] lg:w-[330px] xl:w-[350px]"
                : "w-[calc(50%-6px)] sm:w-[240px] md:w-[250px] lg:w-[260px] xl:w-[270px]";

            const cardCustomStyle = cardWidth
              ? ({ "--custom-card-w": `${cardWidth}px` } as React.CSSProperties)
              : undefined;

            return (
              <>
                {displayProducts.map((product, idx) => (
                  <div
                    key={product.id}
                    style={cardCustomStyle}
                    className={cn(cardWidthClass, "shrink-0 snap-start flex flex-col transition-all")}
                  >
                    <ProductCard product={product} priority={idx < 4} />
                  </div>
                ))}

                {/* VIEW ALL Editorial Transition Card at the end of the continuous track */}
                <div
                  style={cardCustomStyle}
                  className={cn(cardWidthClass, "shrink-0 snap-start flex flex-col transition-all")}
                >
                  <Link
                    href={viewAllLink}
                    className="group relative w-full aspect-[4/5] bg-slate-100 border border-slate-200 hover:border-slate-900 rounded-lg flex flex-col items-center justify-center p-4 sm:p-6 text-center transition-all duration-300 hover:bg-slate-200/70 cursor-pointer shadow-2xs"
                  >
              <span className="text-[9px] uppercase tracking-[0.25em] text-slate-500 font-semibold mb-2">
                Discover All
              </span>
              <h3 className="text-sm sm:text-base lg:text-lg font-heading font-bold text-slate-900 tracking-wider uppercase mb-2">
                VIEW ALL
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-500 max-w-[170px] leading-relaxed mb-4 hidden sm:block">
                Explore the complete {title.toLowerCase()} collection.
              </p>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
            <div className="mt-2 text-center">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-900">
                See All &rarr;
              </span>
            </div>
          </div>
        </>
      );
    })()}
  </div>
</div>

      {/* Centered Compact VIEW ALL Button - Filled with Solid Color and White Font */}
      <div className="text-center mt-3 sm:mt-4">
        <Link
          href={viewAllLink}
          className="group inline-flex items-center gap-1.5 px-4 sm:px-5 py-1.5 sm:py-2 bg-slate-900 text-white hover:bg-slate-800 text-[9px] sm:text-[10px] uppercase tracking-[0.18em] font-bold rounded-lg border border-slate-900 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-sm active:scale-95"
        >
          <span>{viewAllText}</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform text-white" />
        </Link>
      </div>
    </div>
  );
}
