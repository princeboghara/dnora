import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getCategoryBySlug, getProducts } from "@/lib/services/catalog-service";
import { ProductCard } from "@/components/product/ProductCard";
import { INITIAL_CATEGORIES } from "@/lib/seed/catalog-data";

export async function generateStaticParams() {
  return INITIAL_CATEGORIES.map((c) => ({
    category: c.slug,
  }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  const products = await getProducts({ category: category.slug });

  return (
    <div className="space-y-12 pb-24">
      {/* Category Editorial Hero */}
      <div className="relative w-full h-[45vh] min-h-[360px] max-h-[500px] bg-[#141414] overflow-hidden flex items-center justify-center text-center">
        <Image
          src={category.hero_image_url || category.image_url}
          alt={category.name}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-60 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-[#141414]/70" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 space-y-4">
          <nav className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[#C5A880]">
            <Link href="/" className="hover:underline">
              Atelier
            </Link>
            <span>/</span>
            <Link href="/shop" className="hover:underline">
              Catalog
            </Link>
            <span>/</span>
            <span className="text-[#FBF9F5]">{category.name}</span>
          </nav>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#FBF9F5] font-light uppercase tracking-wider">
            {category.name}
          </h1>

          <p className="text-xs sm:text-sm text-[#D5CDC0] font-light max-w-xl mx-auto leading-relaxed">
            {category.description}
          </p>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D9] text-xs text-[#8C7A6B]">
          <span>Showing {products.length} Atelier Masterpieces in {category.name}</span>
          <Link
            href="/shop"
            className="text-[#111111] hover:text-[#C5A880] underline font-medium"
          >
            Explore All Categories &rarr;
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 space-y-3 bg-[#FAF7F2] p-8 border border-[#E8E2D9] my-8">
            <p className="font-serif text-xl text-[#111111]">
              New editions are presently being crafted in our atelier.
            </p>
            <p className="text-xs text-[#8C7A6B]">
              Discover our other signature creations in the meantime.
            </p>
            <Link
              href="/shop"
              className="inline-block mt-2 px-6 py-2.5 bg-[#141414] text-[#F5F2EB] text-xs uppercase tracking-widest"
            >
              View Complete Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
