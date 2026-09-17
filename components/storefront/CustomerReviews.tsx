import React from "react";
import Image from "next/image";
import { Star, ShieldCheck } from "lucide-react";
import { CustomerReview } from "@/types";

interface CustomerReviewsProps {
  reviews: CustomerReview[];
}

export function CustomerReviews({ reviews }: CustomerReviewsProps) {
  if (!reviews || reviews.length === 0) return null;

  return (
    <section id="reviews" className="py-20 sm:py-28 bg-white border-t border-[#E8E5DE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-semibold block mb-2">
            Client Voices
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-[#0E0E0E] tracking-tight mb-4">
            Customer Love
          </h2>
          <p className="text-sm text-[#73706A]">
            Read testimonials from verified patrons who appreciate exceptional artisan leather.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="flex flex-col justify-between p-8 rounded-sm bg-white border border-[#E8E5DE] transition-all hover:border-[#0E0E0E] hover:shadow-lg"
            >
              <div>
                {/* 5-Star Rating */}
                <div className="flex items-center gap-1 mb-6 text-[#C5A880]">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#C5A880]" />
                  ))}
                </div>

                {/* Review Text */}
                <blockquote className="text-sm sm:text-base text-[#1C1B1A] leading-relaxed italic mb-6 font-normal">
                  &ldquo;{rev.review}&rdquo;
                </blockquote>
              </div>

              {/* Customer Info & Avatar */}
              <div className="flex items-center gap-3 pt-6 border-t border-[#E8E5DE]">
                {rev.image_url ? (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-[#E8E5DE]">
                    <Image
                      src={rev.image_url}
                      alt={rev.customer_name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#EAE6DF] text-[#0E0E0E] font-heading font-bold flex items-center justify-center text-xs shrink-0">
                    {rev.customer_name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-heading font-semibold text-[#0E0E0E]">
                      {rev.customer_name}
                    </span>
                    {rev.verified_purchase && (
                      <span className="inline-flex items-center text-[10px] text-emerald-700 gap-0.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    )}
                  </div>
                  {rev.product_name && (
                    <span className="text-[11px] text-[#73706A] block">
                      Purchased {rev.product_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
