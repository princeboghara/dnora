import React from "react";
import { Product } from "@/types";
import { HorizontalProductCarousel } from "./HorizontalProductCarousel";

interface BestSellersSectionProps {
  products: Product[];
}

export function BestSellersSection({ products }: BestSellersSectionProps) {
  const activeProducts = products.filter((p) => p.status === "active");
  const bestSellers = activeProducts.filter((p) => p.is_best_seller);
  const displayProducts = bestSellers.length > 0 ? bestSellers : activeProducts;

  if (displayProducts.length === 0) return null;

  return (
    <section id="best-sellers" className="py-10 sm:py-14 bg-[#FAF9F6] border-t border-[#E8E5DE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HorizontalProductCarousel
          title="BEST SELLERS"
          products={displayProducts}
          viewAllLink="/shop?best_seller=true"
          viewAllText="VIEW ALL"
        />
      </div>
    </section>
  );
}
