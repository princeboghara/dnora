"use client";

import React, { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "How are D'NORA creations packaged for delivery?",
    a: "Every single acquisition — from our sculpted leather totes to our 50ml extraits — arrives encased in our bespoke, shock-resistant luxury presentation box. It is finished with an embossed monogram, archival satin ribbon, and an individually wax-sealed certificate of authenticity.",
  },
  {
    q: "What is your complimentary white-glove shipping policy across India?",
    a: "We offer complimentary, fully insured priority shipping on all orders above ₹5,000 across India. Standard transit takes 3–5 business days. For urgent requirements, our Priority Next-Flight Air Courier option ensures dispatch within 24–48 hours.",
  },
  {
    q: "Are the precious metals and gemstones hallmarked?",
    a: "Yes. All D'NORA jewellery creations crafted with 925 sterling silver or 22K gold vermeil are certified and carry official BIS hallmarks, guaranteeing gold purity. Natural pearls and gemstones are accompanied by an atelier gemmological identification document.",
  },
  {
    q: "What is the concentration of your Haute Parfumerie extraits?",
    a: "Our perfumes are blended at a rare 30% to 32% pure botanical perfume oil concentration (Extrait de Parfum). This ensures exceptional tenacity, captivating sillage, and 12–16+ hours of evocative wear on skin and fabrics.",
  },
  {
    q: "What is your exchange and return protocol?",
    a: "Due to the artisanal and small-batch nature of our atelier releases, we offer a 7-day complimentary exchange policy for unused creations in their untouched original packaging. For hygiene reasons, opened perfume flacons with broken wax seals cannot be returned.",
  },
  {
    q: "Can I commission bespoke customizations for bridal trousseaus?",
    a: "Yes. Our atelier welcomes custom monograms, bespoke colorways for our silk saree-gowns, and private scent formulations for weddings. Please contact our Client Concierge to schedule an appointment.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="py-12 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-2">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B] font-semibold">
          Client Advisory
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#111111] uppercase tracking-wide font-light">
          Frequently Inquired
        </h1>
        <p className="text-xs sm:text-sm text-[#6E6A64] font-light max-w-lg mx-auto">
          Essential insights regarding our artisanship, shipping protocols, hallmark certifications, and care guidelines.
        </p>
      </div>

      <div className="divide-y divide-[#E8E2D9] border-y border-[#E8E2D9]">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className="py-5">
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between text-left font-serif text-lg text-[#111111] uppercase tracking-wide hover:text-[#C5A880] transition-colors"
              >
                <span className="pr-4">{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#8C7A6B] transition-transform duration-300 flex-shrink-0 ${
                    isOpen ? "rotate-180 text-[#111111]" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="pt-3 text-xs sm:text-sm text-[#6E6A64] leading-relaxed font-light">
                  <p>{item.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
