import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, Truck, RotateCcw, ArrowLeft } from "lucide-react";
import { store } from "@/lib/data/store";
import { ProductCard } from "@/components/storefront/ProductCard";
// Client-side interactive handbag detail component (gallery, quantity, wishlist, bag)
import { ProductDetailClient } from "@/components/storefront/ProductDetailClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await store.getProductBySlug(slug);

  if (!product) {
    return { title: "Handbag Not Found | DNORA" };
  }

  return {
    title: `${product.name} | DNORA Luxury Handbags`,
    description: product.short_description,
    openGraph: {
      title: `${product.name} | DNORA`,
      description: product.short_description,
      images: product.images[0]
        ? [{ url: product.images[0].secure_url, width: 1200, height: 1200, alt: product.name }]
        : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await store.getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Get other products for "You May Also Admire"
  const allProducts = await store.getProducts({ status: "active" });
  const relatedProducts = allProducts.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="py-8 sm:py-16 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="mb-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#73706A] hover:text-[#0E0E0E] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Handbags</span>
          </Link>
        </div>

        {/* Client Product Interactive Section (Gallery + Add To Bag) */}
        <ProductDetailClient product={product} />

        {/* Craftsmanship Highlights */}
        <div className="mt-20 py-12 border-y border-[#E8E5DE] grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white border border-[#E8E5DE] rounded-sm shrink-0">
              <Truck className="w-5 h-5 text-[#0E0E0E]" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest font-heading font-bold text-[#0E0E0E] mb-1">
                Complimentary Express Shipping
              </h4>
              <p className="text-xs text-[#73706A] leading-relaxed">
                Dispatched in signature rigid luxury presentation box with protective dust bag.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-white border border-[#E8E5DE] rounded-sm shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#C5A880]" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest font-heading font-bold text-[#0E0E0E] mb-1">
                Authentic Florence Artisan Leather
              </h4>
              <p className="text-xs text-[#73706A] leading-relaxed">
                Individually numbered certificate of craftsmanship and serialized hallmark seal.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-white border border-[#E8E5DE] rounded-sm shrink-0">
              <RotateCcw className="w-5 h-5 text-[#0E0E0E]" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest font-heading font-bold text-[#0E0E0E] mb-1">
                30-Day Complimentary Returns
              </h4>
              <p className="text-xs text-[#73706A] leading-relaxed">
                Prepaid courier return labels included with every order. No questions asked.
              </p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24">
            <div className="mb-10 text-center">
              <span className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-semibold block mb-2">
                Curated Recommendations
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0E0E0E] tracking-tight">
                You May Also Admire
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
