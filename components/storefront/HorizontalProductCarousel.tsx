"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Product } from "@/types";
import { ProductCard } from "./ProductCard";

interface HorizontalProductCarouselProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllLink: string;
  viewAllText?: string;
}

export function HorizontalProductCarousel({
  title,
  products,
  viewAllLink,
  viewAllText = "VIEW ALL",
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

  return (
    <div className="w-full">
      {/* Centered Section Heading (Clean luxury typography, no extra subtitle text) */}
      <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-[#0E0E0E] tracking-tight uppercase">
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
          className="hidden sm:flex absolute -left-4 lg:-left-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-white/95 border border-[#E8E5DE] shadow-sm items-center justify-center text-[#0E0E0E] hover:bg-[#F5F3EF] hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => handleScroll("right")}
          aria-label="Next products"
          className="hidden sm:flex absolute -right-4 lg:-right-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-white/95 border border-[#E8E5DE] shadow-sm items-center justify-center text-[#0E0E0E] hover:bg-[#F5F3EF] hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Continuous Horizontal Scroll Track
            Mobile: w-[calc(50%-6px)] (2 per view, untouched mobile view)
            Laptop/Desktop: sm:w-[240px] md:w-[250px] lg:w-[260px] xl:w-[270px] (compact, proportionate, multiple cards visible)
        */}
        <div
          ref={scrollContainerRef}
          className="flex items-stretch overflow-x-auto snap-x snap-mandatory scrollbar-none gap-3 sm:gap-5 lg:gap-6 pb-4 pt-1 px-1 -mx-1"
          style={{ scrollBehavior: "smooth" }}
        >
          {displayProducts.map((product, idx) => (
            <div
              key={product.id}
              className="w-[calc(50%-6px)] sm:w-[240px] md:w-[250px] lg:w-[260px] xl:w-[270px] shrink-0 snap-start flex flex-col"
            >
              <ProductCard product={product} priority={idx < 4} />
            </div>
          ))}

          {/* VIEW ALL Editorial Transition Card at the end of the continuous track */}
          <div className="w-[calc(50%-6px)] sm:w-[240px] md:w-[250px] lg:w-[260px] xl:w-[270px] shrink-0 snap-start flex flex-col">
            <Link
              href={viewAllLink}
              className="group relative w-full aspect-[4/5] bg-[#F5F3EF] border border-[#E8E5DE] hover:border-[#0E0E0E] rounded-xs flex flex-col items-center justify-center p-4 sm:p-6 text-center transition-all duration-300 hover:bg-[#EAE6DF]/70 cursor-pointer"
            >
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#73706A] font-semibold mb-2">
                Discover All
              </span>
              <h3 className="text-sm sm:text-base lg:text-lg font-heading font-bold text-[#0E0E0E] tracking-wider uppercase mb-2">
                VIEW ALL
              </h3>
              <p className="text-[10px] sm:text-[11px] text-[#73706A] max-w-[170px] leading-relaxed mb-4 hidden sm:block">
                Explore the complete {title.toLowerCase()} collection.
              </p>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0E0E0E] text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
            <div className="mt-2 text-center">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#0E0E0E]">
                See All &rarr;
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Centered Minimal VIEW ALL Button */}
      <div className="text-center mt-6 sm:mt-8">
        <Link
          href={viewAllLink}
          className="group inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 border border-[#0E0E0E] bg-white text-[#0E0E0E] hover:bg-[#0E0E0E] hover:text-white text-[10px] sm:text-[11px] uppercase tracking-[0.22em] font-bold rounded-xs transition-all duration-300 cursor-pointer shadow-xs"
        >
          <span>{viewAllText}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
