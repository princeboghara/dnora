"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  getCategoryBySlug,
  getAdminCategoriesOverride,
  getAdminProductsOverride,
} from "@/lib/services/catalog-service";
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from "@/lib/seed/catalog-data";
import { ProductCard } from "@/components/product/ProductCard";
import { Category, Product } from "@/types";

export default function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const unwrappedParams = use(params);
  const categorySlug = unwrappedParams.category;

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const resolveCategoryAndProducts = async () => {
      setIsLoading(true);

      // 1. Try to find from live admin categories first
      const adminCategories = getAdminCategoriesOverride();
      let matchedCategory =
        adminCategories?.find(
          (c) => c.slug.toLowerCase() === categorySlug.toLowerCase()
        ) || null;

      // 2. If not found in override, query catalog service / seed
      if (!matchedCategory) {
        matchedCategory = await getCategoryBySlug(categorySlug);
      }

      // 3. If still not found, construct a graceful fallback so newly added/dynamic categories never 404
      if (!matchedCategory) {
        const formattedTitle = categorySlug
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        matchedCategory = {
          id: `cat_dyn_${categorySlug}`,
          name: formattedTitle,
          slug: categorySlug,
          tagline: `Exclusive ${formattedTitle} Collection`,
          description: `Discover handcrafted luxury ${formattedTitle.toLowerCase()} designs meticulously engineered in our atelier.`,
          image_url:
            "https://www.charleskeith.in/dw/image/v2/BCWJ_PRD/on/demandware.static/-/Sites-in-products/default/dw0c35245a/images/hi-res/2026-L6-CK2-10160273-A-29-1.jpg?sw=600&q=80",
          hero_image_url:
            "https://www.charleskeith.in/dw/image/v2/BCWJ_PRD/on/demandware.static/-/Sites-in-products/default/dw0c35245a/images/hi-res/2026-L6-CK2-10160273-A-29-1.jpg?sw=600&q=80",
          display_order: 99,
          is_active: true,
        };
      }

      setCategory(matchedCategory);

      // 4. Resolve products for this category
      const adminProducts = getAdminProductsOverride();
      const allProductsList =
        adminProducts && adminProducts.length > 0
          ? adminProducts
          : INITIAL_PRODUCTS;

      const matchedProducts = allProductsList.filter(
        (p) =>
          p.category_slug.toLowerCase() === categorySlug.toLowerCase() ||
          (categorySlug === "handbags" &&
            [
              "bucket-bags",
              "shoulder-bags",
              "tote-bags",
              "hobo-bags",
              "crossbody-bags",
            ].includes(p.category_slug))
      );

      setProducts(matchedProducts);
      setIsLoading(false);
    };

    resolveCategoryAndProducts();

    const handleUpdate = () => {
      resolveCategoryAndProducts();
    };

    window.addEventListener("storage", handleUpdate);
    window.addEventListener("dnora_categories_updated", handleUpdate);
    window.addEventListener("dnora_products_updated", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("dnora_categories_updated", handleUpdate);
      window.removeEventListener("dnora_products_updated", handleUpdate);
    };
  }, [categorySlug]);

  if (isLoading || !category) {
    return (
      <div className="py-24 max-w-md mx-auto text-center space-y-4">
        <div className="w-8 h-8 mx-auto border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-[0.25em] text-[#8C7A6B] font-mono">
          Retrieving Atelier Realm...
        </p>
      </div>
    );
  }

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

          <h1 className="font-sans text-4xl sm:text-5xl md:text-6xl text-[#FBF9F5] font-light uppercase tracking-[0.15em]">
            {category.name}
          </h1>

          <p className="text-xs sm:text-sm text-[#D5CDC0] font-light max-w-xl mx-auto leading-relaxed">
            {category.description || category.tagline || "Discover handcrafted luxury silhouettes."}
          </p>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D9] text-xs text-[#8C7A6B]">
          <span>
            Showing {products.length} Atelier Masterpieces in {category.name}
          </span>
          <Link
            href="/shop"
            className="text-[#111111] hover:text-[#C5A880] underline font-medium"
          >
            Explore All Categories &rarr;
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 space-y-3 bg-[#FAF7F2] p-8 border border-[#E8E2D9] my-8 rounded-2xl">
            <p className="font-sans font-medium text-lg text-[#111111] uppercase tracking-wide">
              New editions are presently being crafted in our atelier for {category.name}.
            </p>
            <p className="text-xs text-[#8C7A6B]">
              Explore our full collection or check back soon for debut releases.
            </p>
            <Link
              href="/shop"
              className="inline-block mt-2 px-6 py-3 bg-[#141414] hover:bg-[#C5A880] hover:text-[#111111] text-[#F5F2EB] text-xs uppercase tracking-widest font-semibold transition-all rounded-lg"
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
