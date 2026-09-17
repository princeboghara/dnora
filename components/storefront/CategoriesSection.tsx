import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProductCategory } from "@/types";

interface CategoriesSectionProps {
  categories: ProductCategory[];
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  return (
    <section id="categories" className="py-20 sm:py-28 bg-white border-t border-[#E8E5DE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Centered */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-semibold block mb-2">
            Curated Silhouettes
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-[#0E0E0E] tracking-tight">
            Explore by Category
          </h2>
        </div>

        {/* Category Grid: 4 in a line on Laptop/Desktop, 2-by-2 on Mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group relative overflow-hidden rounded-sm bg-[#F5F3EF] border border-[#E8E5DE] aspect-[4/5]"
            >
              {/* Category Background Image */}
              {category.image_url && (
                <Image
                  src={category.image_url}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 50vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              )}

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity group-hover:from-black/90" />

              {/* Content Overlay */}
              <div className="absolute inset-0 p-3.5 sm:p-8 flex flex-col justify-end">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-[9px] sm:text-[11px] uppercase tracking-[0.2em] text-[#C5A880] font-semibold block mb-0.5 sm:mb-1">
                      Collection 0{index + 1}
                    </span>
                    <h3 className="text-sm sm:text-2xl font-heading font-bold text-[#FAF9F6] tracking-tight group-hover:translate-x-1 transition-transform leading-tight">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="hidden sm:block text-xs text-[#EAE6DF] max-w-md mt-1.5 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </div>
                  <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-[#FAF9F6] group-hover:text-[#0E0E0E] transition-all shrink-0 ml-2 sm:ml-4">
                    <ArrowUpRight className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
