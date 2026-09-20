import React from "react";
import { Product } from "@/types";
import { HorizontalProductCarousel } from "./HorizontalProductCarousel";

interface NewArrivalsSectionProps {
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

export function NewArrivalsSection({
  products,
  title = "NEW IN",
  viewAllLink = "/shop?new_arrival=true",
  headingColor,
  headingFontSize,
  headingFontFamily,
  headingFontWeight,
  cardGap,
  cardSize,
  cardWidth,
}: NewArrivalsSectionProps) {
  const activeProducts = products.filter((p) => p.status === "active");
  const newArrivals = activeProducts.filter((p) => p.is_new_arrival);
  const displayProducts = newArrivals.length > 0 ? newArrivals : activeProducts;

  if (displayProducts.length === 0) return null;

  return (
    <section id="new-arrivals" className="py-6 sm:py-8 bg-white border-t border-slate-200/80">
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
