import React from "react";
import Link from "next/link";
import { ProductCard } from "@/components/storefront/ProductCard";
import { store } from "@/lib/data/store";

export const dynamic = "force-dynamic";

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    new_arrival?: string;
    best_seller?: string;
    sort?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const categories = await store.getCategories();

  const products = await store.getProducts({
    status: "active",
    category_slug: params.category,
    search: params.search,
    is_new_arrival: params.new_arrival === "true" ? true : undefined,
    is_best_seller: params.best_seller === "true" ? true : undefined,
  });

  // Sorting
  if (params.sort === "price-asc") {
    products.sort((a, b) => a.price - b.price);
  } else if (params.sort === "price-desc") {
    products.sort((a, b) => b.price - a.price);
  }

  const activeCategory = categories.find((c) => c.slug === params.category);

  return (
    <div className="py-12 sm:py-20 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-[0.25em] text-[#0E0E0E] font-semibold block mb-2">
            The Complete Atelier Collection
          </span>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#0E0E0E] tracking-tight">
            {activeCategory ? activeCategory.name : "All Handbags & Purses"}
          </h1>
          <p className="text-sm text-[#73706A] mt-3">
            {activeCategory?.description ||
              "Handcrafted from Italian calfskin in Florence. Structured silhouettes engineered for timeless elegance."}
          </p>
        </div>

        {/* Filters & Sorting Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pb-6 mb-10 border-b border-[#E8E5DE] gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <Link
              href="/shop"
              className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-full border transition-all whitespace-nowrap ${
                !params.category
                  ? "bg-[#0E0E0E] text-[#FAF9F6] border-[#0E0E0E]"
                  : "bg-white text-[#73706A] border-[#E8E5DE] hover:border-[#0E0E0E] hover:text-[#0E0E0E]"
              }`}
            >
              All Pieces
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-full border transition-all whitespace-nowrap ${
                  params.category === cat.slug
                    ? "bg-[#0E0E0E] text-[#FAF9F6] border-[#0E0E0E]"
                    : "bg-white text-[#73706A] border-[#E8E5DE] hover:border-[#0E0E0E] hover:text-[#0E0E0E]"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Handbag Count */}
          <div className="text-xs uppercase tracking-widest text-[#73706A] font-medium">
            Showing {products.length} {products.length === 1 ? "Silhouette" : "Silhouettes"}
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-sm border border-[#E8E5DE]">
            <h3 className="text-lg font-heading font-medium text-[#0E0E0E] mb-2">
              No handbags found in this category
            </h3>
            <p className="text-sm text-[#73706A] mb-6">
              Try choosing another silhouette or explore our full collection.
            </p>
            <Link
              href="/shop"
              className="inline-flex px-6 py-3 bg-[#0E0E0E] text-[#FAF9F6] text-xs font-semibold uppercase tracking-widest hover:bg-[#2C2B29] transition-all rounded"
            >
              View All Handbags
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
