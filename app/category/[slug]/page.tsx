import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { store } from "@/lib/data/store";
import { formatPrice } from "@/lib/utils";
import { ChevronRight, ArrowLeft, Sparkles, ShoppingBag } from "lucide-react";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await store.getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Category Not Found | DNORA",
    };
  }

  return {
    title: `${category.name} | DNORA Luxury Leather Goods`,
    description:
      category.description ||
      `Explore luxury ${category.name.toLowerCase()} handcrafted from full-grain Italian leather at DNORA.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const { sort } = await searchParams;

  const category = await store.getCategoryBySlug(slug);
  const allCategories = await store.getCategories();

  // If not found in DB, check if it's a known silhouette or format title from slug
  const title = category?.name || slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const description = category?.description || `Explore our bespoke curated range of ${title.toLowerCase()}, sculpted with artisanal Italian craftsmanship.`;

  // Fetch products associated with this category
  let products = await store.getProducts({
    category_slug: slug,
    status: "active",
  });

  // If no direct category relations found, try case-insensitive name matching
  if (products.length === 0 && category) {
    const allActive = await store.getProducts({ status: "active" });
    products = allActive.filter((p) =>
      p.categories?.some((c) => c.slug === slug || c.id === category.id)
    );
  }

  // Sort products if specified
  if (sort === "price-asc") {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    products.sort((a, b) => b.price - a.price);
  } else if (sort === "newest") {
    products.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900 pb-24">
      {/* Editorial Header Banner */}
      <section className="relative w-full bg-[#FAF8F5] border-b border-neutral-200/80 pt-10 pb-12 sm:pt-14 sm:pb-16 md:pt-18 md:pb-20">
        <div className="max-w-[1820px] 2xl:max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          
          {/* Breadcrumb Trail */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-500 mb-6">
            <Link href="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-neutral-400" />
            <Link href="/shop" className="hover:text-black transition-colors">
              Collections
            </Link>
            <ChevronRight className="w-3 h-3 text-neutral-400" />
            <span className="text-neutral-900 font-semibold tracking-wide">
              {title}
            </span>
          </nav>

          {/* Silhouette Title & Editorial Narrative */}
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-[0.2em]">
              <Sparkles className="w-3 h-3 text-[#D4AF37]" />
              <span>DNORA Silhouette Edit</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-normal tracking-[0.16em] uppercase text-neutral-950">
              {title}
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-neutral-600 font-light leading-relaxed max-w-2xl">
              {description}
            </p>
          </div>

          {/* Quick Silhouette Filter Badges */}
          {allCategories.length > 0 && (
            <div className="mt-8 flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 pt-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-400 mr-2 shrink-0">
                Other Silhouettes:
              </span>
              {allCategories.map((c) => {
                const isActive = c.slug === slug;
                return (
                  <Link
                    key={c.id}
                    href={`/category/${c.slug}`}
                    className={`text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider font-medium transition-all shrink-0 ${
                      isActive
                        ? "bg-black text-white shadow-xs"
                        : "bg-white text-neutral-700 border border-neutral-200/80 hover:border-black hover:text-black"
                    }`}
                  >
                    {c.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Main Grid & Content */}
      <div className="max-w-[1820px] 2xl:max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 mt-8 sm:mt-10">
        
        {/* Results Bar & Sorting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
          <p className="text-xs font-medium tracking-widest uppercase text-neutral-500">
            Showing <span className="font-bold text-neutral-900">{products.length}</span> {products.length === 1 ? "Silhouette" : "Silhouettes"}
          </p>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600">Sort By:</span>
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <Link
                href={`/category/${slug}`}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  !sort ? "bg-black text-white font-bold" : "text-neutral-600 hover:text-black bg-neutral-100"
                }`}
              >
                Featured
              </Link>
              <Link
                href={`/category/${slug}?sort=price-asc`}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  sort === "price-asc" ? "bg-black text-white font-bold" : "text-neutral-600 hover:text-black bg-neutral-100"
                }`}
              >
                Price: Low to High
              </Link>
              <Link
                href={`/category/${slug}?sort=price-desc`}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  sort === "price-desc" ? "bg-black text-white font-bold" : "text-neutral-600 hover:text-black bg-neutral-100"
                }`}
              >
                Price: High to Low
              </Link>
            </div>
          </div>
        </div>

        {/* Product Grid or Haute Couture Empty State */}
        {products.length === 0 ? (
          <div className="py-20 sm:py-28 text-center max-w-lg mx-auto space-y-5 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center mx-auto text-neutral-400">
              <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-neutral-400">
                Atelier Production
              </span>
              <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-neutral-900">
                The {title} Collection Is Arriving Soon
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed font-light">
                Our master artisans are currently handcrafting the initial release of this silhouette. In the meantime, explore our other bespoke collections or preview best sellers.
              </p>
            </div>

            <div className="pt-3 flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white bg-black hover:bg-neutral-800 rounded-full transition shadow-md"
              >
                <span>Explore All Handbags</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-widest text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-full transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return Home</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10">
            {products.map((product) => {
              const primaryImage = product.images?.[0]?.secure_url || "";
              const hoverImage = product.images?.[1]?.secure_url || primaryImage;

              return (
                <div key={product.id} className="group flex flex-col justify-between">
                  <Link
                    href={`/product/${product.slug}`}
                    className="block relative aspect-3/4 rounded-xs overflow-hidden bg-[#FAF8F5] border border-neutral-200/70"
                  >
                    {/* Primary Image */}
                    {primaryImage ? (
                      <Image
                        src={primaryImage}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-opacity duration-500 group-hover:opacity-0"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-300">
                        <ShoppingBag className="w-8 h-8" />
                      </div>
                    )}

                    {/* Secondary Hover Image */}
                    {hoverImage && (
                      <Image
                        src={hoverImage}
                        alt={`${product.name} alternate view`}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover absolute inset-0 opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105"
                      />
                    )}

                    {/* Badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                      {product.is_best_seller && (
                        <span className="px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-widest bg-black text-white rounded-xs shadow-xs">
                          Best Seller
                        </span>
                      )}
                      {product.is_new_arrival && (
                        <span className="px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-widest bg-amber-500 text-black rounded-xs shadow-xs">
                          New
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Product Details */}
                  <div className="pt-3.5 space-y-1">
                    <Link
                      href={`/product/${product.slug}`}
                      className="block text-xs sm:text-sm font-semibold tracking-wider uppercase text-neutral-900 hover:text-black line-clamp-1"
                    >
                      {product.name}
                    </Link>

                    {product.short_description && (
                      <p className="text-[11px] text-neutral-500 line-clamp-1 font-light">
                        {product.short_description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-xs sm:text-sm font-bold text-neutral-950 font-mono">
                        {formatPrice(product.price)}
                      </span>
                      {product.compare_at_price && product.compare_at_price > product.price && (
                        <span className="text-[11px] text-neutral-400 line-through font-mono">
                          {formatPrice(product.compare_at_price)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
