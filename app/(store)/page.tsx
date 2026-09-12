import React from "react";
import Link from "next/link";
import { ArrowRight, Star, Sparkles, CheckCircle2, Quote } from "lucide-react";
import { HeroBanner } from "@/components/store/HeroBanner";
import { CategoryGrid } from "@/components/store/CategoryGrid";
import { ProductCard } from "@/components/product/ProductCard";
import {
  getCategories,
  getNewArrivals,
  getBestSellers,
  getProducts,
} from "@/lib/services/catalog-service";

const VERIFIED_REVIEWS = [
  {
    name: "Ananya Singhania",
    city: "Mumbai",
    rating: 5,
    date: "Verified Patron",
    title: "The silhouette is pure perfection",
    comment:
      "The Noane bucket bag exceeded all expectations. The leather feels astonishingly supple, and the dual pockets fit my phone and card sleeve effortlessly. The Dark Brown shade matches everything.",
  },
  {
    name: "Radhika Mehra",
    city: "New Delhi",
    rating: 5,
    date: "Verified Patron",
    title: "Elegant two-way carry",
    comment:
      "Love switching between the top handle for meetings and the crossbody strap when on the move. Arrived with exquisite packaging and a protective satin dust bag.",
  },
  {
    name: "Priyadarshini Rao",
    city: "Bengaluru",
    rating: 5,
    date: "Verified Patron",
    title: "Exceptional artisanal quality",
    comment:
      "DNORA blends timeless Indian poise with contemporary European silhouette aesthetics. Exceptional craftsmanship and swift white-glove delivery.",
  },
];

export default async function HomePage() {
  const [categories, newArrivals, bestSellers, allProducts] = await Promise.all([
    getCategories(),
    getNewArrivals(8),
    getBestSellers(8),
    getProducts({ limit: 12 }),
  ]);

  const hasProducts = allProducts.length > 0;

  return (
    <div className="space-y-0 bg-[#FCFAF7]">
      {/* 1. Full-Width Campaign Hero Banner */}
      <HeroBanner />

      {/* 2. Categories Showcase */}
      <CategoryGrid categories={categories} />

      {/* Empty State if no products yet */}
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
            Our master artisans are finishing bespoke hand-stitched leather silhouettes.
          </p>
          <div className="pt-3 flex justify-center">
            <Link
              href="/shop"
              className="px-7 py-3.5 bg-[#111111] text-[#FBF9F5] text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#C5A880] hover:text-[#111111] transition-all inline-flex items-center gap-2"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      ) : (
        <>
          {/* 3. Best Sellers Section */}
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

          {/* 4. New Arrivals Section */}
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
        </>
      )}

      {/* 5. Customer Reviews Section */}
      <section className="py-16 sm:py-24 bg-[#FAF7F2] border-t border-[#E8E2D9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Reviews Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="flex items-center justify-center gap-1 text-[#C5A880]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#8C7A6B] font-semibold font-mono">
              Patron Acclaim &amp; Verified Reviews
            </span>
            <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl text-[#111111] font-light uppercase tracking-[0.12em]">
              Customer Reviews
            </h2>
            <p className="text-xs sm:text-sm text-[#736357] font-light">
              Discover how discerning patrons experience DNORA&apos;s handcrafted leather silhouettes across India.
            </p>
          </div>

          {/* 3-Column Review Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VERIFIED_REVIEWS.map((rev, idx) => (
              <div
                key={idx}
                className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E8E2D9] shadow-xs space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 text-[#C5A880]">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#10B981] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{rev.date}</span>
                    </span>
                  </div>

                  <h3 className="font-sans font-semibold text-sm text-[#111111] tracking-wide">
                    &ldquo;{rev.title}&rdquo;
                  </h3>

                  <p className="text-xs text-[#6E6A64] leading-relaxed font-light">
                    {rev.comment}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#F4F0E8] flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-[#111111] text-xs">
                      {rev.name}
                    </p>
                    <p className="text-[10px] text-[#8C7A6B]">{rev.city}, India</p>
                  </div>
                  <Quote className="w-5 h-5 text-[#C5A880]/30" />
                </div>
              </div>
            ))}
          </div>

          {/* Editorial Accolade Quote */}
          <div className="pt-8 border-t border-[#E8E2D9] max-w-3xl mx-auto text-center space-y-3">
            <blockquote className="font-sans text-base sm:text-lg text-[#111111] font-light italic leading-relaxed">
              &ldquo;DNORA blends timeless Indian poise with the sleek architectural aesthetics of contemporary European luxury. The quality of finishing is second to none.&rdquo;
            </blockquote>
            <p className="text-[11px] uppercase tracking-[0.25em] font-bold text-[#111111]">
              Harper&apos;s BAZAAR India • Fashion &amp; Luxury Accessories Review
            </p>
          </div>
        </div>
      </section>

      {/* 6. Footer follows directly from layout */}
    </div>
  );
}
