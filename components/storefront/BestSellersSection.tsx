import React from "react";
import { Product } from "@/types";
import { HorizontalProductCarousel } from "./HorizontalProductCarousel";

interface BestSellersSectionProps {
  products: Product[];
  title?: string;
  viewAllLink?: string;
  headingColor?: string;
  headingFontSize?: string;
  headingFontFamily?: string;
  headingFontWeight?: string;
  cardGap?: number;
  cardSize?: "sm" | "md" | "lg";
  cardWidth?: number;
}

export function BestSellersSection({
  products,
  title = "BEST SELLERS",
  viewAllLink = "/shop?best_seller=true",
  headingColor,
  headingFontSize,
  headingFontFamily,
  headingFontWeight,
  cardGap,
  cardSize,
  cardWidth,
}: BestSellersSectionProps) {
  const activeProducts = products.filter((p) => p.status === "active");
  const bestSellers = activeProducts.filter((p) => p.is_best_seller);
  const displayProducts = bestSellers.length > 0 ? bestSellers : activeProducts;

  if (displayProducts.length === 0) return null;

  return (
    <section id="best-sellers" className="py-6 sm:py-8 bg-[#F8FAFC] border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HorizontalProductCarousel
          title={title}
          products={displayProducts}
          viewAllLink={viewAllLink}
          viewAllText="VIEW ALL"
          headingColor={headingColor}
          headingFontSize={headingFontSize}
          headingFontFamily={headingFontFamily}
          headingFontWeight={headingFontWeight}
          cardGap={cardGap}
          cardSize={cardSize}
          cardWidth={cardWidth}
        />
      </div>
    </section>
  );
}
