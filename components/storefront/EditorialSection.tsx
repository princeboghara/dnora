import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function EditorialSection() {
  return (
    <section id="editorial" className="py-24 sm:py-32 bg-white border-t border-[#E8E5DE] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: High-Fashion Portrait Lifestyle Visual */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[3/4] w-full rounded-sm overflow-hidden bg-[#F5F3EF] border border-[#E8E5DE] shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85"
                alt="DNORA Editorial Silhouette in Florence"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
            </div>
            {/* Floating Luxury Detail Box */}
            <div className="hidden sm:block absolute -bottom-8 -right-8 w-64 p-6 bg-white border border-[#E8E5DE] shadow-2xl rounded-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0E0E0E]" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#0E0E0E]">
                  Florence Atelier
                </span>
              </div>
              <p className="text-xs text-[#73706A] leading-relaxed">
                Sculpted from full-grain Italian calfskin, conditioned with organic waxes for effortless tactile drape.
              </p>
            </div>
          </div>

          {/* Right Column: Editorial Atelier Story */}
          <div className="lg:col-span-6 flex flex-col justify-center lg:pl-6">
            <span className="text-xs uppercase tracking-[0.25em] text-[#73706A] font-bold mb-3 block">
              Architectural Craftsmanship
            </span>

            <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#0E0E0E] tracking-tight leading-[1.1] mb-6">
              The DNORA Atelier
            </h2>

            <p className="text-base text-[#3A3835] leading-relaxed mb-8">
              At DNORA, we approach women&rsquo;s luxury leather goods through the lens of architectural reduction—every curve serves a deliberate purpose, every edge is burnished by hand, and every silhouette balances uncompromising structure with effortless grace.
            </p>

            {/* Architectural Craft Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 pb-8 border-y border-[#E8E5DE]">
              <div>
                <span className="font-heading font-bold text-sm text-[#0E0E0E] block mb-1">
                  01 / Tuscan Full-Grain Calfskin
                </span>
                <p className="text-xs text-[#73706A] leading-normal">
                  Sourced exclusively from certified historic tanneries in Santa Croce, Italy.
                </p>
              </div>
              <div>
                <span className="font-heading font-bold text-sm text-[#0E0E0E] block mb-1">
                  02 / Hand-Milled Solid Hardware
                </span>
                <p className="text-xs text-[#73706A] leading-normal">
                  Custom milled solid metal hardware with subtle satin finish and scratch-resistant coating.
                </p>
              </div>
            </div>

            {/* Editorial Action */}
            <div className="pt-8">
              <Link
                href="/shop"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-[#0E0E0E] text-[#FAF9F6] text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#262626] transition-all rounded-xs shadow-md"
              >
                <span>Explore The Atelier Story</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
