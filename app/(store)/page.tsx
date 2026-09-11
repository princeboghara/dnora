import React from "react";
import Link from "next/link";
import { ArrowRight, Star, Sparkles } from "lucide-react";
import { HeroBanner } from "@/components/store/HeroBanner";
import { CategoryGrid } from "@/components/store/CategoryGrid";
import { TrustBar } from "@/components/store/TrustBar";
import { PromoBanner } from "@/components/store/PromoBanner";
import { PerfumeShowcase } from "@/components/store/PerfumeShowcase";
import { CompleteTheLook } from "@/components/store/CompleteTheLook";
import { AtelierStory } from "@/components/store/AtelierStory";
import { ProductCard } from "@/components/product/ProductCard";
import {
  getCategories,
  getNewArrivals,
  getBestSellers,
  getProducts,
} from "@/lib/services/catalog-service";

export default async function HomePage() {
  const [categories, newArrivals, bestSellers, allProducts] = await Promise.all([
    getCategories(),
    getNewArrivals(8),
    getBestSellers(8),
    getProducts({ limit: 12 }),
  ]);

  const hasProducts = allProducts.length > 0;
  const featuredPerfume = allProducts.find((p) => p.category_slug === "perfumes");

  return (
    <div className="space-y-0 bg-[#FCFAF7]">
      {/* 1. Full-Width Campaign Hero Slider */}
      <HeroBanner />

      {/* 2. Shop By Category Circular Icons & Showcase (if categories exist) */}
      {categories.length > 0 && <CategoryGrid categories={categories} />}

      {/* 3. 4-Pillars Trust & USPs Bar */}
      <TrustBar />

      {/* 4. Empty Pristine State when database is clean */}
      {!hasProducts ? (
        <section className="py-20 sm:py-28 px-4 text-center max-w-2xl mx-auto space-y-5">
          <div className="w-12 h-12 mx-auto rounded-full border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880]">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B] font-semibold">
            Haute Maroquinerie
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl text-[#111111] uppercase tracking-[0.15em] font-light">
            The Atelier Capsule in Preparation
          </h2>
          <p className="text-xs sm:text-sm text-[#736357] leading-relaxed max-w-lg mx-auto font-light">
            Our master artisans are finishing bespoke hand-stitched leather silhouettes, noble travel goods, and fine extrait de parfums. Register your interest for private debut access.
          </p>
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/about"
              className="px-7 py-3.5 bg-[#111111] text-[#FBF9F5] text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#C5A880] hover:text-[#111111] transition-all inline-flex items-center gap-2 shadow-xs"
            >
              <span>Explore The Maison</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3.5 bg-transparent border border-[#111111]/20 text-[#111111] text-xs font-semibold uppercase tracking-[0.2em] hover:border-[#C5A880] hover:text-[#C5A880] transition-colors"
            >
              <span>Concierge Inquiries</span>
            </Link>
          </div>
        </section>
      ) : (
        <>
          {/* Best Sellers Section */}
          {bestSellers.length > 0 && (
            <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row items-baseline justify-between mb-8 sm:mb-10 gap-3 border-b border-[#EAE5DC] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[#8C7A6B] font-semibold">
                    <Sparkles className="w-3 h-3 text-[#C5A880]" />
                    <span>Most Coveted Silhouettes</span>
                  </div>
                  <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl text-[#111111] font-light uppercase tracking-[0.12em]">
                    Best Sellers
                  </h2>
                </div>

                <Link
                  href="/shop?filter=bestselling"
                  className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] font-semibold text-[#111111] hover:text-[#C5A880] transition-colors"
                >
                  <span>Explore All Best Sellers</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {bestSellers.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )}

          {/* Mid-Page Campaign Promo Spotlight */}
          <PromoBanner />

          {/* New Arrivals Section */}
          {newArrivals.length > 0 && (
            <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row items-baseline justify-between mb-8 sm:mb-10 gap-3 border-b border-[#EAE5DC] pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C7A6B] font-semibold">
                    Fresh In The Atelier
                  </span>
                  <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl text-[#111111] font-light uppercase tracking-[0.12em]">
                    New Arrivals
                  </h2>
                </div>

                <Link
                  href="/shop?filter=new"
                  className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] font-semibold text-[#111111] hover:text-[#C5A880] transition-colors"
                >
                  <span>View All New Releases</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {newArrivals.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )}

          {/* Fragrance & Gifting Feature */}
          {featuredPerfume && <PerfumeShowcase perfume={featuredPerfume} />}

          {/* Complete The Look */}
          <CompleteTheLook products={allProducts} />
        </>
      )}

      {/* Client Acclaim & Verified Reviews */}
      <section className="py-16 bg-[#FAF7F2] border-y border-[#E8E2D9]">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="flex justify-center gap-1 text-[#EAB308]">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>

          <blockquote className="font-sans text-xl sm:text-2xl md:text-3xl text-[#111111] font-light leading-snug tracking-wide">
            &ldquo;DNORA blends timeless Indian elegance with the sleek architectural poise of modern European luxury. The quality of vegan leather and fine finishing is second to none.&rdquo;
          </blockquote>

          <div className="space-y-0.5">
            <p className="text-xs uppercase tracking-[0.25em] font-bold text-[#111111]">
              Harper&apos;s BAZAAR India
            </p>
            <p className="text-[11px] text-[#8C7A6B]">Annual Fashion & Luxury Accessories Review</p>
          </div>
        </div>
      </section>

      {/* Atelier Craftsmanship Heritage */}
      <AtelierStory />
    </div>
  );
}
