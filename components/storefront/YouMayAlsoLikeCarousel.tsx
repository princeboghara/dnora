"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/types";
import { ProductCard } from "./ProductCard";

interface YouMayAlsoLikeCarouselProps {
  products: Product[];
}

export function YouMayAlsoLikeCarousel({ products }: YouMayAlsoLikeCarouselProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  if (!products || products.length === 0) return null;

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollAmount = container.clientWidth >= 640 ? 300 : container.clientWidth * 0.85;
    container.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="mt-16 sm:mt-20 pt-10 sm:pt-14 border-t border-[#E8E5DE]">
      {/* Centered Heading */}
      <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-[#0E0E0E] tracking-tight uppercase">
          YOU MAY ALSO LIKE
        </h2>
      </div>

      {/* Continuous Horizontal Carousel Container matching Seen On You */}
      <div className="relative max-w-6xl xl:max-w-7xl mx-auto px-1 sm:px-4">
        {/* Previous Control */}
        <button
          type="button"
          onClick={() => handleScroll("left")}
          aria-label="Previous products"
          className="hidden sm:flex absolute -left-4 lg:-left-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-white/95 border border-[#E8E5DE] shadow-sm items-center justify-center text-[#0E0E0E] hover:bg-[#F5F3EF] hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Next Control */}
        <button
          type="button"
          onClick={() => handleScroll("right")}
          aria-label="Next products"
          className="hidden sm:flex absolute -right-4 lg:-right-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-white/95 border border-[#E8E5DE] shadow-sm items-center justify-center text-[#0E0E0E] hover:bg-[#F5F3EF] hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Continuous Scrollable Products Track
            Mobile: w-[calc(50%-6px)] (2 cards per view)
            Laptop/Desktop: sm:w-[240px] md:w-[250px] lg:w-[260px] xl:w-[270px] (compact, proportionate, multiple cards visible)
        */}
        <div
          ref={scrollRef}
          className="flex items-stretch overflow-x-auto snap-x snap-mandatory scrollbar-none gap-3 sm:gap-5 lg:gap-6 pb-4 pt-1 px-1 -mx-1"
          style={{ scrollBehavior: "smooth" }}
        >
          {products.map((item) => (
            <div
              key={item.id}
              className="w-[calc(50%-6px)] sm:w-[240px] md:w-[250px] lg:w-[260px] xl:w-[270px] shrink-0 snap-start flex flex-col"
            >
              <ProductCard product={item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
