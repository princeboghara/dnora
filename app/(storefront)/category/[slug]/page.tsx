import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ChevronRight, ArrowLeft, ShoppingBag } from "lucide-react";
import { ProductCard } from "@/components/storefront/ProductCard";
import { store } from "@/lib/data/store";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await store.getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Category Not Found | DNORA",
    };
  }

  return {
    title: `${category.name} | Luxury Handbags | DNORA`,
    description:
      category.description ||
      `Explore our exclusive collection of luxury handcrafted ${category.name} at DNORA.`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const search = await searchParams;

  const category = await store.getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  // Fetch products matching category relations or category slug
  let products = await store.getProducts({
    status: "active",
    category_slug: slug,
  });

  // If no products found via relation, fallback to keyword search for category name
  if (products.length === 0) {
    products = await store.getProducts({
      status: "active",
      search: category.name,
    });
  }

  // Sort if requested
  if (search.sort === "price-asc") {
    products.sort((a, b) => a.price - b.price);
  } else if (search.sort === "price-desc") {
    products.sort((a, b) => b.price - a.price);
  }

  return (
    <div className="bg-[#FAF9F6] min-h-screen">
      {/* Category Hero Banner Section */}
      <div className="relative w-full overflow-hidden bg-[#0E0E0E] text-[#FAF9F6]">
        {category.image_url ? (
          <div className="absolute inset-0 z-0 opacity-45">
            <Image
              src={category.image_url}
              alt={category.name}
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E0E] via-[#0E0E0E]/60 to-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#2C2B29] via-[#141414] to-[#0E0E0E]" />
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#0E0E0E] mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-[#73706A]" />
            <Link href="/shop" className="hover:text-white transition-colors">
              Shop
            </Link>
            <ChevronRight className="w-3 h-3 text-[#73706A]" />
            <span className="text-[#FAF9F6] font-semibold">{category.name}</span>
          </nav>

          {/* Title & Tagline */}
          <div className="max-w-2xl">
            <span className="inline-block text-xs uppercase tracking-[0.25em] text-[#0E0E0E] font-semibold mb-3">
              Curated Silhouette
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight text-white capitalize mb-4">
              {category.name}
            </h1>
            <p className="text-sm sm:text-base text-[#D4CFC7] font-light leading-relaxed max-w-xl">
              {category.description ||
                "Impeccably tailored luxury handbags crafted from genuine Italian leather. Timeless architectural forms made to elevate your wardrobe."}
            </p>
          </div>
        </div>
      </div>

      {/* Main Body with Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Controls & Counts Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#E8E5DE]">
          <div className="flex items-center gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs text-[#73706A] hover:text-[#0E0E0E] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to All Collections</span>
            </Link>
            <span className="text-[#E8E5DE]">|</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0E0E0E]">
              {products.length} {products.length === 1 ? "Piece" : "Pieces"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#73706A] uppercase tracking-wider">Sort By:</span>
            <div className="flex items-center gap-1">
              <Link
                href={`/category/${slug}`}
                className={`px-3 py-1 text-xs uppercase tracking-wider rounded transition-colors ${
                  !search.sort
                    ? "bg-[#0E0E0E] text-[#FAF9F6] font-semibold"
                    : "text-[#73706A] hover:text-[#0E0E0E]"
                }`}
              >
                Featured
              </Link>
              <Link
                href={`/category/${slug}?sort=price-asc`}
                className={`px-3 py-1 text-xs uppercase tracking-wider rounded transition-colors ${
                  search.sort === "price-asc"
                    ? "bg-[#0E0E0E] text-[#FAF9F6] font-semibold"
                    : "text-[#73706A] hover:text-[#0E0E0E]"
                }`}
              >
                Price: Low to High
              </Link>
              <Link
                href={`/category/${slug}?sort=price-desc`}
                className={`px-3 py-1 text-xs uppercase tracking-wider rounded transition-colors ${
                  search.sort === "price-desc"
                    ? "bg-[#0E0E0E] text-[#FAF9F6] font-semibold"
                    : "text-[#73706A] hover:text-[#0E0E0E]"
                }`}
              >
                Price: High to Low
              </Link>
            </div>
          </div>
        </div>

        {/* Product Grid: 2-by-2 on mobile, 4-by-4 on desktop */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#E8E5DE] max-w-xl mx-auto px-6">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#FAF9F6] flex items-center justify-center mb-4">
              <ShoppingBag className="w-6 h-6 text-[#0E0E0E]" />
            </div>
            <h2 className="text-lg font-bold text-[#0E0E0E] uppercase tracking-wide mb-2">
              New Designs Arriving Soon
            </h2>
            <p className="text-xs text-[#73706A] leading-relaxed mb-6">
              Our master artisans are currently crafting new limited-edition releases for the{" "}
              {category.name} collection.
            </p>
            <Link
              href="/shop"
              className="inline-flex px-6 py-3 bg-[#0E0E0E] text-[#FAF9F6] text-xs font-semibold uppercase tracking-widest hover:bg-[#2C2B29] transition-colors rounded shadow-sm"
            >
              Explore Full Atelier
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
