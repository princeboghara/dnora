import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function PromotionalBanner() {
  return (
    <section
      className="relative w-full h-[45vh] sm:h-[55vh] min-h-[380px] max-h-[520px] bg-[#0E0E0E] overflow-hidden select-none border-t border-[#E8E5DE]"
      aria-label="Promotional Campaign Banner"
    >
      {/* Background Editorial Visual */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1800&q=85"
          alt="DNORA Atelier Campaign"
          fill
          priority={false}
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Subtle Vignette & Gradient Scrim for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
      </div>

      {/* Editorial Content Overlay */}
      <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-6 sm:px-12 flex flex-col justify-center">
        <div className="max-w-xl flex flex-col items-start text-left">
          {/* Eyebrow */}
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#FAF9F6]/90 font-semibold mb-2 sm:mb-3">
            Atelier Edition &bull; Florence
          </span>

          {/* Title */}
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-heading font-extrabold text-[#FAF9F6] tracking-tight leading-[1.08] mb-3 sm:mb-4">
            ARCHITECTURAL LEATHER
          </h2>

          {/* Short Supporting Message */}
          <p className="text-xs sm:text-sm text-[#FAF9F6]/85 leading-relaxed mb-6 max-w-md font-normal">
            Sculpted with uncompromising discipline. Cut from certified full-grain Tuscan calfskin and finished with bespoke satin metal hardware.
          </p>

          {/* Minimalist CTA Button */}
          <div>
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2.5 px-6 sm:px-8 py-3 bg-[#FAF9F6] text-[#0E0E0E] border border-[#0E0E0E] hover:bg-[#0E0E0E] hover:text-[#FAF9F6] text-[10px] sm:text-[11px] uppercase tracking-[0.24em] font-bold rounded-xs transition-all duration-300 shadow-md cursor-pointer"
            >
              <span>DISCOVER THE ATELIER</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
