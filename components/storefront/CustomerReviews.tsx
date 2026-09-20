"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { Star, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { CustomerReview } from "@/types";

interface CustomerReviewsProps {
  reviews: CustomerReview[];
  title?: string;
}

export function CustomerReviews({ reviews, title = "CUSTOMER REVIEWS" }: CustomerReviewsProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 340;
    scrollRef.current.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  if (!reviews || reviews.length === 0) return null;

  return (
    <section id="reviews" className="py-6 sm:py-8 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Section Heading */}
        <div className="text-center max-w-xl mx-auto mb-3.5 sm:mb-5">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-slate-900 tracking-tight uppercase">
            {title}
          </h2>
        </div>

        {/* Reviews Horizontal Carousel */}
        <div className="relative max-w-5xl mx-auto px-1 sm:px-6">
          {/* Previous / Next Controls */}
          <button
            type="button"
            onClick={() => handleScroll("left")}
            aria-label="Previous reviews"
            className="hidden sm:flex absolute -left-4 lg:-left-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm items-center justify-center text-slate-800 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => handleScroll("right")}
            aria-label="Next reviews"
            className="hidden sm:flex absolute -right-4 lg:-right-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm items-center justify-center text-slate-800 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Horizontal Scrolling Review Cards */}
          <div
            ref={scrollRef}
            className="flex items-stretch overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 sm:gap-6 pb-3 pt-1 px-1 -mx-1"
            style={{ scrollBehavior: "smooth" }}
          >
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="w-72 sm:w-80 md:w-88 shrink-0 snap-start flex flex-col justify-between p-5 sm:p-6 rounded-xl bg-[#F8FAFC] border border-slate-200/90 hover:border-slate-800 transition-all duration-300 shadow-xs"
              >
                <div>
                  {/* Star Rating */}
                  <div className="flex items-center gap-1 mb-3 text-slate-900">
                    {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-slate-900" />
                    ))}
                  </div>

                  {/* Review Text */}
                  <blockquote className="text-xs sm:text-sm text-slate-700 leading-relaxed italic mb-4 font-normal">
                    &ldquo;{rev.review}&rdquo;
                  </blockquote>
                </div>

                {/* Customer Info */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
                  {rev.image_url ? (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-200">
                      <Image
                        src={rev.image_url}
                        alt={rev.customer_name}
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-900 font-heading font-bold flex items-center justify-center text-[10px] shrink-0">
                      {rev.customer_name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-heading font-semibold text-slate-900 truncate">
                        {rev.customer_name}
                      </span>
                      {rev.verified_purchase && (
                        <span className="inline-flex items-center text-[9px] text-emerald-700 gap-0.5 shrink-0">
                          <ShieldCheck className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                    {rev.product_name && (
                      <span className="text-[10px] text-slate-500 block truncate">
                        {rev.product_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
