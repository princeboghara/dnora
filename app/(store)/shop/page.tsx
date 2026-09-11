"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Filter, X, SlidersHorizontal, ChevronDown, Check, LayoutGrid, Grid2X2 } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from "@/lib/seed/catalog-data";
import { Product } from "@/types";

const PRICE_RANGES = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under ₹10,000", min: 0, max: 10000 },
  { label: "₹10,000 – ₹15,000", min: 10000, max: 15000 },
  { label: "₹15,000 – ₹25,000", min: 15000, max: 25000 },
  { label: "Above ₹25,000", min: 25000, max: Infinity },
];

const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "New Arrivals", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Highest Rated", value: "rating" },
  { label: "Best Sellers", value: "bestselling" },
];

function ShopContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "all";
  const initialFilter = searchParams.get("filter") || "";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [gridColumns, setGridColumns] = useState<2 | 4>(4);

  // Sync with searchParams
  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
    if (initialSearch) setSearchQuery(initialSearch);
    if (initialFilter === "new") setSortBy("newest");
    if (initialFilter === "bestselling") setSortBy("bestselling");
  }, [initialCategory, initialSearch, initialFilter]);

  const filteredProducts = useMemo(() => {
    let result = [...INITIAL_PRODUCTS];

    // Category filter
    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter(
        (p) =>
          p.category_slug.toLowerCase() === selectedCategory.toLowerCase() ||
          (selectedCategory === "handbags" &&
            ["bucket-bags", "shoulder-bags", "tote-bags", "hobo-bags", "crossbody-bags"].includes(
              p.category_slug
            ))
      );
    }

    // Price filter
    const range = PRICE_RANGES[selectedPriceRange];
    if (range) {
      result = result.filter((p) => {
        const price = p.sale_price ?? p.base_price;
        return price >= range.min && price <= range.max;
      });
    }

    // In-stock
    if (inStockOnly) {
      result = result.filter((p) => p.stock_quantity > 0);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.short_description.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sorting
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => (a.sale_price ?? a.base_price) - (b.sale_price ?? b.base_price));
        break;
      case "price-desc":
        result.sort((a, b) => (b.sale_price ?? b.base_price) - (a.sale_price ?? a.base_price));
        break;
      case "newest":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "bestselling":
        result.sort((a, b) => (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0));
        break;
      case "featured":
      default:
        result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
    }

    return result;
  }, [selectedCategory, selectedPriceRange, inStockOnly, searchQuery, sortBy]);

  const resetFilters = () => {
    setSelectedCategory("all");
    setSelectedPriceRange(0);
    setInStockOnly(false);
    setSearchQuery("");
    setSortBy("featured");
  };

  const hasActiveFilters =
    selectedCategory !== "all" || selectedPriceRange !== 0 || inStockOnly || Boolean(searchQuery);

  return (
    <div className="bg-[#FAF9F6] min-h-screen pb-20">
      {/* Category Editorial Hero Banner */}
      <div className="bg-white border-b border-[#EAE5DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6 sm:pb-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#8C7A6B] mb-4">
            <Link href="/" className="hover:text-[#111111] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-[#111111] transition-colors">
              Women
            </Link>
            <span>/</span>
            <span className="text-[#111111] font-semibold">Handbags</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-sans text-3xl sm:text-4xl lg:text-5xl text-[#111111] font-light uppercase tracking-[0.12em]">
                Women&apos;s Handbags
              </h1>
              <p className="text-xs sm:text-sm text-[#736357] mt-2 max-w-2xl font-light leading-relaxed">
                Elevate your everyday aesthetic with the D&apos;NORA handbag collection. Discover architectural bucket silhouettes, sleek chain shoulder bags, and spacious everyday totes crafted with timeless precision.
              </p>
            </div>

            <div className="text-xs uppercase tracking-[0.2em] text-[#8C7A6B] font-medium hidden md:block">
              {filteredProducts.length} Styles Available
            </div>
          </div>
        </div>

        {/* Horizontal Category Strip (Charles & Keith Style) */}
        <div className="border-t border-[#EAE5DC] overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6 sm:gap-8 whitespace-nowrap py-3">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`text-xs uppercase tracking-[0.15em] transition-all py-1 border-b-2 font-medium ${
                selectedCategory === "all"
                  ? "border-[#111111] text-[#111111]"
                  : "border-transparent text-[#736357] hover:text-[#111111]"
              }`}
            >
              All Bags ({INITIAL_PRODUCTS.length})
            </button>
            {INITIAL_CATEGORIES.map((cat) => {
              const count = INITIAL_PRODUCTS.filter(
                (p) =>
                  p.category_slug === cat.slug ||
                  (cat.slug === "handbags" &&
                    ["bucket-bags", "shoulder-bags", "tote-bags", "hobo-bags", "crossbody-bags"].includes(
                      p.category_slug
                    ))
              ).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`text-xs uppercase tracking-[0.15em] transition-all py-1 border-b-2 font-medium ${
                    selectedCategory === cat.slug
                      ? "border-[#111111] text-[#111111]"
                      : "border-transparent text-[#736357] hover:text-[#111111]"
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Catalog Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Sticky Refinement & Sort Bar */}
        <div className="flex items-center justify-between py-3.5 mb-6 border-b border-[#EAE5DC] bg-[#FAF9F6]/80 backdrop-blur sticky top-16 z-30">
          <div className="flex items-center gap-4">
            {/* Filter Toggle Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[#D5CDC0] text-xs uppercase tracking-[0.15em] font-medium text-[#111111] hover:border-[#111111] transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters {hasActiveFilters ? "(Active)" : ""}</span>
            </button>

            <span className="text-xs text-[#8C7A6B] uppercase tracking-wider hidden sm:inline">
              Showing {filteredProducts.length} Items
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.15em] text-[#8C7A6B] hidden sm:inline">
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs px-3 py-2 bg-white border border-[#D5CDC0] text-[#111111] uppercase tracking-[0.1em] focus:outline-none focus:border-[#111111] transition-colors cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Layout Grid Switcher (2 col vs 4 col) */}
            <div className="hidden lg:flex items-center border border-[#D5CDC0] bg-white">
              <button
                type="button"
                onClick={() => setGridColumns(2)}
                className={`p-2 transition-colors ${
                  gridColumns === 2
                    ? "bg-[#111111] text-white"
                    : "text-[#736357] hover:text-[#111111]"
                }`}
                title="2 Columns Editorial View"
              >
                <Grid2X2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setGridColumns(4)}
                className={`p-2 transition-colors ${
                  gridColumns === 4
                    ? "bg-[#111111] text-white"
                    : "text-[#736357] hover:text-[#111111]"
                }`}
                title="4 Columns Catalog View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#8C7A6B]">
              Active Refinements:
            </span>
            {selectedCategory !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#E2DBD0] text-[11px] text-[#111111]">
                Category: {selectedCategory.replace("-", " ")}
                <button onClick={() => setSelectedCategory("all")} className="hover:text-[#8B0000]">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedPriceRange !== 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#E2DBD0] text-[11px] text-[#111111]">
                {PRICE_RANGES[selectedPriceRange].label}
                <button onClick={() => setSelectedPriceRange(0)} className="hover:text-[#8B0000]">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {inStockOnly && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#E2DBD0] text-[11px] text-[#111111]">
                In Stock Only
                <button onClick={() => setInStockOnly(false)} className="hover:text-[#8B0000]">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#E2DBD0] text-[11px] text-[#111111]">
                Search: &quot;{searchQuery}&quot;
                <button onClick={() => setSearchQuery("")} className="hover:text-[#8B0000]">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={resetFilters}
              className="text-[11px] text-[#C5A880] hover:text-[#9E7D4E] underline font-medium ml-2"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Empty State */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-24 space-y-4 bg-white border border-[#EAE5DC] p-8 max-w-xl mx-auto">
            <p className="font-sans font-medium text-xl text-[#111111] uppercase tracking-[0.1em]">
              No Handbags Found
            </p>
            <p className="text-xs text-[#736357] font-light leading-relaxed">
              We could not find any silhouettes matching your criteria. Try adjusting or clearing your filters to explore the full collection.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 px-8 py-3 bg-[#111111] text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#C5A880] hover:text-[#111111] transition-all"
            >
              View All Bags
            </button>
          </div>
        ) : (
          /* Products Grid: 4-col by default (or 2-col when toggled) */
          <div
            className={`grid gap-4 sm:gap-6 ${
              gridColumns === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
            }`}
          >
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Filter Drawer (Slide out from Right) */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-[#111111]/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-[#EAE5DC] p-6 flex flex-col justify-between overflow-y-auto shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#EAE5DC]">
                <h3 className="font-sans font-medium text-lg tracking-[0.15em] text-[#111111] uppercase">
                  Refine Collection
                </h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 text-[#8C7A6B] hover:text-[#111111]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] text-[#8C7A6B] font-semibold block">
                  Silhouette / Category
                </span>
                <div className="space-y-1.5">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`w-full text-left py-2 px-3 text-xs uppercase tracking-wider flex items-center justify-between border transition-colors ${
                      selectedCategory === "all"
                        ? "border-[#111111] bg-[#111111] text-white"
                        : "border-[#EAE5DC] text-[#736357] hover:border-[#111111]"
                    }`}
                  >
                    <span>All Handbags</span>
                    <span>{INITIAL_PRODUCTS.length}</span>
                  </button>
                  {INITIAL_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.slug;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.slug)}
                        className={`w-full text-left py-2 px-3 text-xs uppercase tracking-wider flex items-center justify-between border transition-colors ${
                          isSelected
                            ? "border-[#111111] bg-[#111111] text-white"
                            : "border-[#EAE5DC] text-[#736357] hover:border-[#111111]"
                        }`}
                      >
                        <span>{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] text-[#8C7A6B] font-semibold block">
                  Price (INR)
                </span>
                <div className="space-y-2 text-xs">
                  {PRICE_RANGES.map((range, idx) => (
                    <label
                      key={range.label}
                      className="flex items-center gap-3 cursor-pointer py-1 text-[#736357] hover:text-[#111111]"
                    >
                      <input
                        type="radio"
                        name="drawerPrice"
                        checked={selectedPriceRange === idx}
                        onChange={() => setSelectedPriceRange(idx)}
                        className="accent-[#111111] w-4 h-4"
                      />
                      <span>{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="pt-2">
                <label className="flex items-center gap-3 text-xs uppercase tracking-wider text-[#111111] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="accent-[#111111] w-4 h-4"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-[#EAE5DC] space-y-2">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-4 bg-[#111111] text-white text-xs uppercase tracking-[0.25em] font-medium hover:bg-[#C5A880] hover:text-[#111111] transition-all"
              >
                Show {filteredProducts.length} Handbags
              </button>
              <button
                onClick={resetFilters}
                className="w-full py-2.5 text-xs uppercase tracking-[0.2em] text-[#8C7A6B] hover:text-[#111111] underline text-center block"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="p-20 text-center text-xs tracking-widest uppercase text-[#8C7A6B]">
          Loading Handbag Collection...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
