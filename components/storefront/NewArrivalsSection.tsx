import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Product } from "@/types";
import { ProductCard } from "./ProductCard";

interface NewArrivalsSectionProps {
  products: Product[];
}

export function NewArrivalsSection({ products }: NewArrivalsSectionProps) {
  const newArrivals = products.filter((p) => p.is_new_arrival && p.status === "active");

  if (newArrivals.length === 0) return null;

  return (
    <section id="new-arrivals" className="py-20 sm:py-28 bg-white border-t border-[#E8E5DE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 sm:mb-16">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-semibold block mb-2">
              Latest Edition
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-[#0E0E0E] tracking-tight">
              New Arrivals
            </h2>
          </div>
          <Link
            href="/shop?new_arrival=true"
            className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#0E0E0E] hover:text-[#C5A880] transition-colors mt-4 sm:mt-0"
          >
            <span>Explore All New Pieces</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {newArrivals.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
