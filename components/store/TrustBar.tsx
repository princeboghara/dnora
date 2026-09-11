"use client";

import React from "react";
import { Truck, ShieldCheck, RefreshCw, Award } from "lucide-react";

const PERKS = [
  {
    icon: Truck,
    title: "FREE EXPRESS SHIPPING",
    description: "Complimentary delivery on orders above ₹999 across India",
  },
  {
    icon: ShieldCheck,
    title: "CASH ON DELIVERY",
    description: "Pay on doorstep delivery across 19,000+ pin codes",
  },
  {
    icon: RefreshCw,
    title: "7-DAY EASY RETURNS",
    description: "Hassle-free doorstep pickup & seamless exchange policy",
  },
  {
    icon: Award,
    title: "100% GENUINE QUALITY",
    description: "Authentic DNORA artisanal craftsmanship guaranteed",
  },
];

export function TrustBar() {
  return (
    <section className="bg-[#FAF8F5] border-y border-[#EAE5DC] py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {PERKS.map((perk) => {
            const Icon = perk.icon;
            return (
              <div
                key={perk.title}
                className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3.5 group"
              >
                <div className="w-11 h-11 rounded-full bg-white border border-[#E0D8CC] flex items-center justify-center text-[#111111] group-hover:bg-[#111111] group-hover:text-[#C5A880] group-hover:border-[#111111] transition-all shadow-xs shrink-0">
                  <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-[#111111] tracking-wider uppercase">
                    {perk.title}
                  </h4>
                  <p className="text-[11px] text-[#666666] leading-snug">
                    {perk.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
