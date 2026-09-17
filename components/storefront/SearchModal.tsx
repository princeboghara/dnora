"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

export function SearchModal({ isOpen, onClose, products }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setQuery("");
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const filtered = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.short_description.toLowerCase().includes(query.toLowerCase()) ||
          p.categories?.some((c) => c.name.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#FAF9F6]/95 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Search Header */}
      <div className="border-b border-[#E8E5DE] px-4 sm:px-8 py-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1 flex items-center gap-3">
            <Search className="w-6 h-6 text-[#73706A] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by handbag name, silhouette, or category..."
              className="w-full bg-transparent text-xl sm:text-2xl text-[#0E0E0E] font-heading placeholder:text-[#A8A49C] focus:outline-none tracking-tight"
            />
          </div>
          <button
            onClick={handleClose}
            aria-label="Close search"
            className="p-2 rounded-full hover:bg-[#EAE6DF] transition-colors text-[#0E0E0E]"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-8">
        <div className="max-w-5xl mx-auto">
          {query.trim() === "" ? (
            <div>
              <p className="text-xs uppercase tracking-widest text-[#73706A] font-semibold mb-4">
                Popular Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {["The Marais", "Shoulder Bags", "Tote Bags", "Caramel", "Crossbody", "Mini Vanity"].map(
                  (term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-4 py-2 text-xs uppercase tracking-wider font-medium rounded-full border border-[#E8E5DE] bg-white hover:border-[#0E0E0E] hover:bg-[#0E0E0E] hover:text-[#FAF9F6] transition-all"
                    >
                      {term}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg font-heading text-[#0E0E0E] mb-2">
                No luxury purses matching &ldquo;{query}&rdquo;
              </p>
              <p className="text-sm text-[#73706A]">
                Try adjusting your search terms or explore all handbags in our main catalog.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs uppercase tracking-widest text-[#73706A] font-semibold mb-6">
                Found {filtered.length} {filtered.length === 1 ? "Result" : "Results"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filtered.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    onClick={onClose}
                    className="group flex gap-4 p-3 rounded-lg border border-[#E8E5DE] bg-white hover:border-[#0E0E0E] transition-all"
                  >
                    <div className="relative w-20 h-24 bg-[#F5F3EF] rounded overflow-hidden shrink-0">
                      {product.images[0] && (
                        <Image
                          src={product.images[0].secure_url}
                          alt={product.images[0].alt_text || product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="80px"
                        />
                      )}
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="text-xs text-[#C5A880] uppercase tracking-wider font-semibold">
                        {product.categories?.[0]?.name || "Purse"}
                      </span>
                      <h4 className="text-sm font-heading font-medium text-[#0E0E0E] group-hover:underline">
                        {product.name}
                      </h4>
                      <p className="text-xs text-[#1C1B1A] font-semibold mt-1">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
