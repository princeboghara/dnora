import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Feather, Award, ShieldCheck, HeartHandshake } from "lucide-react";

export function AtelierStory() {
  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E8E2D9]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left: Atmospheric Workshop Photography */}
        <div className="lg:col-span-6 grid grid-cols-2 gap-4">
          <div className="relative aspect-[3/4] bg-[#EFEBE4] overflow-hidden border border-[#E8E2D9]">
            <Image
              src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80"
              alt="Atelier Leatherwork"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[3/4] bg-[#EFEBE4] overflow-hidden border border-[#E8E2D9] mt-8">
            <Image
              src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"
              alt="Artisanal Jewellery Craft"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Right: Narrative */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B] font-semibold">
              The Maison Heritage
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#111111] font-light uppercase tracking-wide leading-tight">
              Where Ancient Indian Grandeur Meets Modernity
            </h2>
            <div className="w-12 h-[1.5px] bg-[#C5A880]" />
          </div>

          <p className="text-xs sm:text-sm text-[#6E6A64] leading-relaxed font-light">
            Founded with an uncompromising devotion to artistry, D&apos;NORA exists to celebrate the timeless mastery of Indian craftsmen. We reject the ephemeral speed of disposable fashion, opting instead for slow, small-batch creations that endure across generations.
          </p>

          <p className="text-xs sm:text-sm text-[#6E6A64] leading-relaxed font-light">
            Every sculpted tote is bevelled and saddle-stitched by hand. Every flacon contains genuine botanical essences distilled in copper degs. Every neckpiece is hallmarked and hand-set with natural river pearls.
          </p>

          {/* 4 Pillars */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E8E2D9]">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#111111]">
                <Feather className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Noble Materials</span>
              </div>
              <p className="text-[11px] text-[#8C7A6B]">Italian calfskin, pure mulberry silk, and Mysore sandalwood.</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#111111]">
                <Award className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Generational Artisans</span>
              </div>
              <p className="text-[11px] text-[#8C7A6B]">Crafted in heritage clusters in Varanasi, Jaipur, and Kashmir.</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#111111]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>BIS Hallmarked</span>
              </div>
              <p className="text-[11px] text-[#8C7A6B]">Certified precious metals and gemmological authenticity.</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#111111]">
                <HeartHandshake className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>White Glove Care</span>
              </div>
              <p className="text-[11px] text-[#8C7A6B]">Complimentary insured transit and dedicated concierge.</p>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-[#111111] hover:text-[#C5A880] transition-colors"
            >
              <span>Read The Complete Atelier Chronicle</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
