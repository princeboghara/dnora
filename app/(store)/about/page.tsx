import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ShieldCheck, Feather, HeartHandshake } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="space-y-16 sm:space-y-24 pb-24">
      {/* Editorial Hero */}
      <div className="relative w-full h-[50vh] min-h-[380px] bg-[#141414] overflow-hidden flex items-center justify-center text-center">
        <Image
          src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=2000&q=85"
          alt="D'NORA Heritage"
          fill
          priority
          className="object-cover opacity-50 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-[#141414]/70" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 space-y-4">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold">
            The Atelier Chronicle
          </span>
          <h1 className="font-sans text-3xl sm:text-5xl md:text-6xl text-[#FBF9F5] font-light uppercase tracking-[0.15em]">
            Heritage Reimagined
          </h1>
          <p className="text-xs sm:text-sm text-[#D5CDC0] font-light max-w-xl mx-auto leading-relaxed">
            Where classical Indian artisanal mastery converges with the unyielding restraint of contemporary modernist minimalism.
          </p>
        </div>
      </div>

      {/* Chapter 1: The Vision */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-5 relative aspect-[3/4] bg-[#EFEBE4] border border-[#E8E2D9] overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80"
              alt="Goldsmithing"
              fill
              className="object-cover"
            />
          </div>
          <div className="md:col-span-7 space-y-6">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C7A6B] font-semibold">
              The Genesis
            </span>
            <h2 className="font-sans text-2xl sm:text-3xl text-[#111111] font-light uppercase tracking-[0.12em]">
              An Antidote to Transient Fashion
            </h2>
            <div className="w-12 h-[1.5px] bg-[#C5A880]" />
            <p className="text-xs sm:text-sm text-[#6E6A64] leading-relaxed font-light">
              D&apos;NORA was founded upon an uncompromising belief: that genuine luxury is not defined by massive seasonal excess, but by intentional slow creation, architectural proportion, and ancestral savoir-faire.
            </p>
            <p className="text-xs sm:text-sm text-[#6E6A64] leading-relaxed font-light">
              We travel directly to the ancient artisan clusters of India — from the brass-casting guilds of Moradabad and the silver filigree masters of Cuttack, to the natural perfumers of Kannauj and the handloom silk weavers of Varanasi.
            </p>
          </div>
        </div>
      </div>

      {/* Four Pillars */}
      <div className="bg-[#FAF7F2] py-20 border-y border-[#E8E2D9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B] font-semibold">
              Foundational Principles
            </span>
            <h2 className="font-sans text-2xl sm:text-3xl text-[#111111] uppercase tracking-[0.12em] font-light">
              The Four Atelier Pillars
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="p-6 bg-[#FBF9F5] border border-[#E8E2D9] space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF7F2] flex items-center justify-center text-[#C5A880]">
                <Feather className="w-6 h-6" />
              </div>
              <h3 className="font-sans font-medium text-sm text-[#111111] uppercase tracking-[0.12em]">Noble Materials</h3>
              <p className="text-xs text-[#6E6A64] leading-relaxed">
                Full-grain Italian calfskin, BIS-hallmarked 22k gold vermeil, natural Basra pearls, and pure mulberry silk.
              </p>
            </div>

            <div className="p-6 bg-[#FBF9F5] border border-[#E8E2D9] space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF7F2] flex items-center justify-center text-[#C5A880]">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-sans font-medium text-sm text-[#111111] uppercase tracking-[0.12em]">Slow Artisanship</h3>
              <p className="text-xs text-[#6E6A64] leading-relaxed">
                Strict limited-batch atelier releases allowing master craftsmen up to two weeks per completed creation.
              </p>
            </div>

            <div className="p-6 bg-[#FBF9F5] border border-[#E8E2D9] space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF7F2] flex items-center justify-center text-[#C5A880]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-sans font-medium text-sm text-[#111111] uppercase tracking-[0.12em]">Pure Extraits</h3>
              <p className="text-xs text-[#6E6A64] leading-relaxed">
                Haute parfumerie concoctions matured over 180 days with up to 32% pure botanical oil concentrations.
              </p>
            </div>

            <div className="p-6 bg-[#FBF9F5] border border-[#E8E2D9] space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF7F2] flex items-center justify-center text-[#C5A880]">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="font-sans font-medium text-sm text-[#111111] uppercase tracking-[0.12em]">White Glove Protocol</h3>
              <p className="text-xs text-[#6E6A64] leading-relaxed">
                Dedicated concierge advisors, insured door-to-door transit, and signature bespoke wax-sealed packaging.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center max-w-xl mx-auto px-4 space-y-6">
        <h3 className="font-sans font-medium text-xl sm:text-2xl text-[#111111] uppercase tracking-[0.12em]">
          Experience The Atelier Firsthand
        </h3>
        <Link
          href="/shop"
          className="inline-block px-8 py-4 bg-[#141414] text-[#F5F2EB] text-xs uppercase tracking-[0.25em] font-medium hover:bg-[#C5A880] hover:text-[#111111] transition-all"
        >
          Explore All Atelier Masterpieces
        </Link>
      </div>
    </div>
  );
}
