"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  Check,
  X,
  Flame,
  Sparkles,
  Loader2,
  SlidersHorizontal,
  Package,
  CheckCircle2,
} from "lucide-react";
import { Product } from "@/types";
import { useToast } from "@/components/ui/Toast";

interface ProductSelectorManagerProps {
  flag: "is_best_seller" | "is_new_arrival";
  sectionTitle: string;
  onProductsUpdated?: (products: Product[]) => void;
  isDraftMode?: boolean;
  onDraftToggle?: (productId: string, flag: "is_best_seller" | "is_new_arrival", nextVal: boolean) => void;
}

export function ProductSelectorManager({
  flag,
  sectionTitle,
  onProductsUpdated,
  isDraftMode = true,
  onDraftToggle,
}: ProductSelectorManagerProps) {
  const { success, error } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "selected">("all");

  const isBestSeller = flag === "is_best_seller";
  const flagLabel = isBestSeller ? "Best Seller" : "New In";
  const FlagIcon = isBestSeller ? Flame : Sparkles;

  const fetchProducts = async () => {
    try {
      const res = await fetch(`/api/products?status=all&limit=100&t=${Date.now()}`);
      const json = await res.json();
      if (json.products && Array.isArray(json.products)) {
        setProducts(json.products);
        if (onProductsUpdated) onProductsUpdated(json.products);
      }
    } catch {
      error("Failed to load products list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleToggleProduct = async (product: Product) => {
    const currentVal = Boolean(product[flag]);
    const nextVal = !currentVal;

    // Optimistic / Draft update in local state
    const updatedList = products.map((p) =>
      p.id === product.id ? { ...p, [flag]: nextVal } : p
    );
    setProducts(updatedList);
    if (onProductsUpdated) onProductsUpdated(updatedList);

    if (isDraftMode) {
      if (onDraftToggle) onDraftToggle(product.id, flag, nextVal);
      success(
        nextVal
          ? `"${product.name}" added to ${sectionTitle} (Draft). Click "Publish Changes" to apply.`
          : `"${product.name}" removed from ${sectionTitle} (Draft). Click "Publish Changes" to apply.`
      );
      return;
    }

    setTogglingId(product.id);
    try {
      const res = await fetch(`/api/products/${product.id}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flag }),
      });

      if (!res.ok) throw new Error("Failed to toggle product flag");
      success(
        nextVal
          ? `"${product.name}" added to ${sectionTitle}.`
          : `"${product.name}" removed from ${sectionTitle}.`
      );
    } catch {
      // Revert on error
      const reverted = products.map((p) =>
        p.id === product.id ? { ...p, [flag]: currentVal } : p
      );
      setProducts(reverted);
      if (onProductsUpdated) onProductsUpdated(reverted);
      error("Error updating product inclusion.");
    } finally {
      setTogglingId(null);
    }
  };

  const selectedCount = products.filter((p) => p[flag]).length;

  const filteredProducts = products.filter((p) => {
    const categoryTitle = p.categories?.[0]?.name || "";
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      categoryTitle.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filterMode === "selected") return Boolean(p[flag]);
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs space-y-0">
      {/* Header Bar */}
      <div className="p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FlagIcon className="w-4 h-4 text-indigo-600" />
            <span>Select Products for {sectionTitle}</span>
          </h3>
          <p className="text-xs text-slate-500">
            Currently featuring <strong className="text-indigo-600 font-bold">{selectedCount}</strong> product{selectedCount !== 1 ? "s" : ""} on storefront. Toggle any product below to include or exclude it.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {/* Filter Tabs */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/60 text-xs">
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                filterMode === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("selected")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                filterMode === "selected" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Selected ({selectedCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or category..."
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 w-48 sm:w-60 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
      </div>

      {/* Products Table/List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          <span>Loading catalog products...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-10 text-center text-xs text-slate-400">
          No products match the search filter.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
          {filteredProducts.map((prod) => {
            const isSelected = Boolean(prod[flag]);
            const isProcessing = togglingId === prod.id;
            const primaryImg =
              prod.images?.[0]?.secure_url ||
              (prod.images?.[0] as any)?.image_url ||
              "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=200&q=80";

            return (
              <div
                key={prod.id}
                className={`p-3.5 sm:p-4 flex items-center justify-between gap-4 transition-colors ${
                  isSelected ? "bg-indigo-50/25 hover:bg-indigo-50/40" : "hover:bg-slate-50/80"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {/* Thumbnail */}
                  <div className="relative w-12 h-14 sm:w-14 sm:h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-2xs">
                    <img
                      src={primaryImg}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <span className="absolute top-1 left-1 p-0.5 bg-indigo-600 text-white rounded-full">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {prod.name}
                      </p>
                      {prod.categories?.[0]?.name && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                          {prod.categories[0].name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="font-bold text-slate-900">
                        ₹{Number(prod.price).toLocaleString("en-IN")}
                      </span>
                      <span>•</span>
                      <span>Stock: {prod.stock ?? 12}</span>
                      <span>•</span>
                      <span className="capitalize">{prod.status}</span>
                    </div>
                  </div>
                </div>

                {/* Inclusion Toggle Switch */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs font-semibold hidden sm:inline ${
                    isSelected ? "text-indigo-600 font-bold" : "text-slate-400"
                  }`}>
                    {isSelected ? `Included in ${flagLabel}` : "Not Included"}
                  </span>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleToggleProduct(prod)}
                    className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors cursor-pointer disabled:opacity-50 ${
                      isSelected ? "bg-indigo-600" : "bg-slate-200 hover:bg-slate-300"
                    }`}
                  >
                    <div
                      className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform flex items-center justify-center ${
                        isSelected ? "translate-x-6" : "translate-x-0"
                      }`}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                      ) : isSelected ? (
                        <Check className="w-3 h-3 text-indigo-600" />
                      ) : null}
                    </div>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
