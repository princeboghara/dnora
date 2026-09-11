"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Category } from "@/types";

interface CategoryGridProps {
  categories: Category[];
}

const QUICK_CATEGORIES = [
  {
    name: "View All",
    href: "/shop",
    img: "https://www.charleskeith.in/dw/image/v2/BCWJ_PRD/on/demandware.static/-/Sites-in-products/default/dw0c35245a/images/hi-res/2026-L6-CK2-10160273-A-29-1.jpg?sw=200&q=80",
    badge: "All",
  },
  {
    name: "Bucket Bags",
    href: "/shop?category=bucket-bags",
    img: "https://www.charleskeith.in/dw/image/v2/BCWJ_PRD/on/demandware.static/-/Sites-in-products/default/dw0c35245a/images/hi-res/2026-L6-CK2-10160273-A-29-1.jpg?sw=200&q=80",
    badge: "New",
  },
  {
    name: "Shoulder Bags",
    href: "/shop?category=shoulder-bags",
    img: "https://www.charleskeith.in/dw/image/v2/BCWJ_PRD/on/demandware.static/-/Sites-in-products/default/dw964a5235/images/hi-res/2024-L7-CK2-20160191-A-D1-1.jpg?sw=200&q=80",
  },
  {
    name: "Tote Bags",
    href: "/shop?category=tote-bags",
    img: "https://www.charleskeith.in/dw/image/v2/BCWJ_PRD/on/demandware.static/-/Sites-in-products/default/dw7fbbfeaf/images/hi-res/2026-L6-CK2-30271780-A-J8-1.jpg?sw=200&q=80",
  },
  {
    name: "Hobo Bags",
    href: "/shop?category=hobo-bags",
    img: "https://www.charleskeith.in/dw/image/v2/BCWJ_PRD/on/demandware.static/-/Sites-in-products/default/dwb79f2c0e/images/hi-res/2026-L6-CK2-40840659-A-J8-1.jpg?sw=200&q=80",
  },
  {
    name: "Crossbody Bags",
    href: "/shop?category=crossbody-bags",
    img: "https://www.charleskeith.in/dw/image/v2/BCWJ_PRD/on/demandware.static/-/Sites-in-products/default/dw8fe2f596/images/hi-res/2026-L6-CK2-50671909-N5-1.jpg?sw=200&q=80",
  },
  {
    name: "New In",
    href: "/shop?filter=new",
    img: "https://www.charleskeith.in/dw/image/v2/BCWJ_PRD/on/demandware.static/-/Sites-in-products/default/dwe3385828/images/hi-res/2026-L6-CK2-90840669-IO-1.jpg?sw=200&q=80",
    badge: "Hot",
  },
  {
    name: "Best Sellers",
    href: "/shop?filter=bestselling",
    img: "https://www.charleskeith.in/dw/image/v2/BCWJ_PRD/on/demandware.static/-/Sites-in-products/default/dw80ec3886/images/hi-res/2026-L6-SL2-40782941-14-1.jpg?sw=200&q=80",
  },
];

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section className="py-10 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* 1. Lino Perros Style Circular Category Icons Bar */}
      <div>
        <div className="text-center mb-8 space-y-1">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B] font-semibold">
            Explore Handcrafted Silhouettes
          </span>
          <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl text-[#111111] font-light uppercase tracking-[0.15em]">
            Shop By Category
          </h2>
          <div className="w-10 h-[1.5px] bg-[#C5A880] mx-auto mt-2" />
        </div>

        <div className="flex items-center justify-start sm:justify-center gap-4 sm:gap-6 overflow-x-auto pb-4 pt-2 no-scrollbar px-2">
          {QUICK_CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group flex flex-col items-center shrink-0 w-20 sm:w-24 text-center transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-white border border-[#E0D8CC] p-1 shadow-sm group-hover:border-[#C5A880] group-hover:shadow-md transition-all">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-[#FAF7F2]">
                  <Image
                    src={cat.img}
                    alt={cat.name}
                    fill
                    unoptimized
                    sizes="80px"
                    className="object-contain p-1 group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                {cat.badge && (
                  <span className="absolute top-0 right-0 px-1.5 py-0.5 bg-[#C5A880] text-[#111111] text-[8px] font-bold uppercase rounded-full tracking-wider shadow-xs">
                    {cat.badge}
                  </span>
                )}
              </div>
              <span className="mt-2 text-[11px] sm:text-xs text-[#222222] font-medium group-hover:text-[#9E7D4E] transition-colors leading-tight">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* 2. Featured Category Banners Grid */}
      <div className="pt-4 border-t border-[#E8E2D9]">
        <div className="flex flex-col sm:flex-row items-baseline justify-between mb-8 gap-2">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C7A6B] font-semibold">
              Signature Collections
            </span>
            <h3 className="font-sans text-2xl sm:text-3xl text-[#111111] font-light uppercase tracking-[0.12em]">
              Featured Categories
            </h3>
          </div>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-[0.2em] font-medium text-[#111111] hover:text-[#C5A880] transition-colors"
          >
            View All Categories &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.slice(0, 6).map((category) => (
            <Link
              key={category.id}
              href={`/shop/${category.slug}`}
              className="group relative block aspect-[4/5] sm:aspect-[3/4] overflow-hidden bg-[#EAE4D9] border border-[#E8E2D9] shadow-xs hover:shadow-md transition-shadow"
            >
              <Image
                src={category.image_url}
                alt={category.name}
                fill
                unoptimized
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/90 via-[#111111]/30 to-transparent transition-opacity duration-300 group-hover:from-[#111111]/95" />

              <div className="absolute inset-0 p-6 flex flex-col justify-end text-[#FBF9F5] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880] font-medium">
                    DNORA Atelier
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#FBF9F5]/15 backdrop-blur-sm border border-[#FBF9F5]/30 flex items-center justify-center text-[#FBF9F5] group-hover:bg-[#C5A880] group-hover:text-[#111111] transition-all">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                <h4 className="font-sans text-xl sm:text-2xl font-medium text-[#FBF9F5] uppercase tracking-[0.1em] group-hover:text-[#DFCAAB] transition-colors">
                  {category.name}
                </h4>

                <p className="text-[11px] text-[#D5CDC0] line-clamp-2 font-light opacity-90">
                  {category.tagline}
                </p>

                <div className="pt-1">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#C5A880] group-hover:underline">
                    Shop Collection &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
