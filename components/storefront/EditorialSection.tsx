import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function EditorialSection() {
  return (
    <section id="editorial" className="py-10 sm:py-14 bg-white border-t border-slate-200/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: High-Fashion Portrait Lifestyle Visual */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85"
                alt="DNORA Editorial Silhouette in Florence"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
            </div>
            {/* Floating Luxury Detail Box */}
            <div className="hidden sm:block absolute -bottom-6 -right-6 w-64 p-5 bg-white border border-slate-200 shadow-2xl rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-900">
                  Florence Atelier
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sculpted from full-grain Italian calfskin, conditioned with organic waxes for effortless tactile drape.
              </p>
            </div>
          </div>

          {/* Right Column: Editorial Atelier Story */}
          <div className="lg:col-span-6 flex flex-col justify-center lg:pl-6">
            <span className="text-xs uppercase tracking-[0.25em] text-slate-500 font-bold mb-3 block">
              Architectural Craftsmanship
            </span>

            <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
              The DNORA Atelier
            </h2>

            <p className="text-base text-slate-700 leading-relaxed mb-8">
              At DNORA, we approach women&rsquo;s luxury leather goods through the lens of architectural reduction—every curve serves a deliberate purpose, every edge is burnished by hand, and every silhouette balances uncompromising structure with effortless grace.
            </p>

            {/* Architectural Craft Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 pb-8 border-y border-slate-200">
              <div>
                <span className="font-heading font-bold text-sm text-slate-900 block mb-1">
                  01 / Tuscan Full-Grain Calfskin
                </span>
                <p className="text-xs text-slate-500 leading-normal">
                  Sourced exclusively from certified historic tanneries in Santa Croce, Italy.
                </p>
              </div>
              <div>
                <span className="font-heading font-bold text-sm text-slate-900 block mb-1">
                  02 / Hand-Milled Solid Hardware
                </span>
                <p className="text-xs text-slate-500 leading-normal">
                  Custom milled solid metal hardware with subtle satin finish and scratch-resistant coating.
                </p>
              </div>
            </div>

            {/* Editorial Action */}
            <div className="pt-8">
              <Link
                href="/shop"
                className="group inline-flex items-center gap-3 px-8 py-3.5 bg-slate-900 text-white text-xs font-semibold uppercase tracking-[0.2em] hover:bg-slate-800 transition-all rounded-xl shadow-md cursor-pointer"
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
