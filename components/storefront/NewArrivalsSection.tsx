import React from "react";
import { Product } from "@/types";
import { HorizontalProductCarousel } from "./HorizontalProductCarousel";

interface NewArrivalsSectionProps {
  products: Product[];
}

export function NewArrivalsSection({ products }: NewArrivalsSectionProps) {
  const activeProducts = products.filter((p) => p.status === "active");
  const newArrivals = activeProducts.filter((p) => p.is_new_arrival);
  const displayProducts = newArrivals.length > 0 ? newArrivals : activeProducts;

  if (displayProducts.length === 0) return null;

  return (
    <section id="new-arrivals" className="py-10 sm:py-14 bg-white border-t border-[#E8E5DE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HorizontalProductCarousel
          title="NEW IN"
          products={displayProducts}
          viewAllLink="/shop?new_arrival=true"
          viewAllText="VIEW ALL"
        />
      </div>
    </section>
  );
}
