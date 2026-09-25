import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { store } from "@/lib/data/store";
import { TrendingNowGalleryClient } from "./TrendingNowGalleryClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Trending Now | Visual Lookbook | DNORA",
  description: "Curated editorial visual lookbook of trending architectural silhouettes handcrafted in Italy.",
};

export default async function TrendingNowPage() {
  const items = await store.getTrendingNowItems(true);

  return (
    <main className="w-full min-h-screen bg-[#FBF9F6] text-neutral-900 pb-20 sm:pb-28">
      {/* Editorial Header */}
      <div className="border-b border-neutral-200/80 bg-white pt-8 pb-10 sm:pt-12 sm:pb-14">
        <div className="max-w-[1820px] 2xl:max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-neutral-400 font-medium mb-4">
            <Link href="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-neutral-900 font-semibold">Trending Now</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 text-[10px] font-bold uppercase tracking-widest mb-3">
                <Sparkles className="w-3 h-3 text-neutral-600" />
                <span>Editorial Lookbook</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 font-serif">
                TRENDING NOW
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 font-light mt-1.5 max-w-xl">
                A visual curation of trending luxury silhouettes, architectural structures, and artisanal Italian craftsmanship.
              </p>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-800 hover:text-black hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Explore Boutique Catalog</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Gallery Section - ONLY PURE IMAGES */}
      <div className="max-w-[1820px] 2xl:max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-8 sm:pt-12">
        <TrendingNowGalleryClient items={items} />
      </div>
    </main>
  );
}
