import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

interface PromoBannerProps {
  heading?: string;
  tagline?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  imageUrl?: string;
}

export function PromoBanner({
  heading = "THE ARCHITECTURE OF LUXURY",
  tagline = "THE FLORENTINE ATELIER",
  description = "Cut from full-grain vegetable-tanned Italian calfskin with hand-painted beveled edges and signature brushed champagne brass hardware.",
  buttonText = "EXPLORE THE CAMPAIGN",
  buttonLink = "/shop",
  imageUrl = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=85",
}: PromoBannerProps) {
  return (
    <section aria-label="Campaign Banner" className="w-full bg-[#0E0E0E] text-white overflow-hidden my-4 sm:my-6 md:my-8">
      <div className="relative w-full min-h-[380px] sm:min-h-[460px] md:min-h-[520px] flex items-center justify-center">
        {/* Background Editorial Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={imageUrl}
            alt="DNORA Luxury Atelier Campaign"
            fill
            sizes="100vw"
            priority={false}
            className="object-cover object-center scale-105 filter brightness-75 contrast-105"
          />
          {/* Subtle cinematic gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/80" />
          <div className="absolute inset-0 bg-radial-[circle_at_center,_transparent_20%,_rgba(0,0,0,0.5)_100%]" />
        </div>

        {/* Content Shell */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 text-center py-12 sm:py-16">
          {/* Tagline */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#D4AF37] text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] mb-4 sm:mb-6">
            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
            <span>{tagline}</span>
          </div>

          {/* Heading */}
          <h2
            style={{ fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif" }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-[0.16em] uppercase text-white leading-tight mb-4"
          >
            {heading}
          </h2>

          <div className="w-12 h-[1.5px] bg-[#D4AF37] mx-auto mb-5 sm:mb-6" />

          {/* Narrative */}
          <p className="text-xs sm:text-sm md:text-base text-neutral-300 font-light leading-relaxed max-w-xl mx-auto mb-8 tracking-wide">
            {description}
          </p>

          {/* CTA Action */}
          <Link
            href={buttonLink}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-white text-black hover:bg-[#D4AF37] hover:text-black font-semibold text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-xl group rounded-xs"
          >
            <span>{buttonText}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default PromoBanner;
