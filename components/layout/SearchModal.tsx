"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight, Sparkles } from "lucide-react";
import { Product } from "@/types";
import { getProducts } from "@/lib/services/catalog-service";
import { formatINR } from "@/lib/utils";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_SEARCHES = [
  "Nappa Leather Tote",
  "Oud & Saffron",
  "Basra Pearl Choker",
  "Mulberry Silk Gown",
  "Lotus Purse Charm",
  "Minaudière Clutch",
];

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setResults([]);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const matched = await getProducts({ search: query, limit: 6 });
      setResults(matched);
      setIsSearching(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleQuickTag = (tag: string) => {
    setQuery(tag);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#111111]/70 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-[#FBF9F5] border border-[#E8E2D9] shadow-2xl rounded-none overflow-hidden z-10 animate-slide-down">
        {/* Search Header */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 px-6 py-5 border-b border-[#E8E2D9] bg-[#FAF7F2]"
        >
          <Search className="w-5 h-5 text-[#8C7A6B]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search handbags, perfumes, jewellery, silks..."
            className="flex-1 bg-transparent text-base font-sans tracking-wide text-[#111111] placeholder:text-[#9C9488] placeholder:text-sm focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 text-[#8C7A6B] hover:text-[#111111]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#8C7A6B] hover:text-[#111111] border-l border-[#E2DBD0] pl-3"
          >
            <span className="text-xs uppercase tracking-widest font-sans">ESC</span>
          </button>
        </form>

        {/* Modal Body */}
        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-6">
          {/* Popular Suggestions */}
          {!query && (
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#8C7A6B] font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Trending Inspirations</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleQuickTag(item)}
                    className="text-xs px-3.5 py-1.5 bg-[#F4F0E8] hover:bg-[#EAE4D9] text-[#2C2926] border border-[#E2DBD0] transition-colors rounded-none"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results list */}
          {query && (
            <div>
              <div className="flex items-center justify-between text-xs uppercase tracking-widest text-[#8C7A6B] mb-4 pb-2 border-b border-[#EAE4D9]">
                <span>
                  {isSearching
                    ? "Searching Atelier..."
                    : `${results.length} Heirloom Creations Found`}
                </span>
                {results.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex items-center gap-1 text-[#111111] hover:text-[#C5A880] font-semibold"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {results.length === 0 && !isSearching ? (
                <div className="text-center py-10 space-y-3">
                  <p className="font-sans font-medium text-base text-[#1C1B1A] uppercase tracking-wider">
                    No creations found matching &quot;{query}&quot;
                  </p>
                  <p className="text-xs text-[#8C7A6B] max-w-sm mx-auto">
                    Try refining your search terms, or explore our signature collections below.
                  </p>
                  <Link
                    href="/shop"
                    onClick={onClose}
                    className="inline-block mt-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#C5A880] hover:underline"
                  >
                    Browse Complete Atelier Catalog &rarr;
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {results.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={onClose}
                      className="group flex gap-3 p-2.5 bg-[#FAF7F2] hover:bg-[#F4EFE6] border border-[#E8E2D9] transition-all"
                    >
                      <div className="relative w-16 h-20 flex-shrink-0 bg-[#EFEBE4] overflow-hidden">
                        <Image
                          src={product.primary_image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <span className="text-[10px] uppercase tracking-widest text-[#8C7A6B] truncate">
                          {product.category_slug}
                        </span>
                        <h4 className="font-sans font-medium text-xs sm:text-sm text-[#111111] truncate group-hover:text-[#9E7D4E] transition-colors uppercase tracking-wide">
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-medium text-[#111111]">
                            {formatINR(product.sale_price ?? product.base_price)}
                          </span>
                          {product.sale_price && (
                            <span className="text-[10px] text-[#9C9488] line-through">
                              {formatINR(product.base_price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
