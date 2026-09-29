"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Boxes,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Minus,
  Check,
  AlertTriangle,
  Package,
  ArrowUpRight,
  TrendingDown,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface StockProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  stock: number;
  price: number;
  status: string;
  image_url?: string;
  category_name?: string;
}

interface StockSummary {
  totalSkus: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

export default function StockManagementPage() {
  const [products, setProducts] = useState<StockProduct[]>([]);
  const [summary, setSummary] = useState<StockSummary>({
    totalSkus: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [stockInputs, setStockInputs] = useState<Record<string, number>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const fetchStock = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== "all") params.set("filter", filter);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/admin/stock?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setProducts(json.products || []);
        if (json.summary) setSummary(json.summary);

        const initialInputs: Record<string, number> = {};
        json.products.forEach((p: StockProduct) => {
          initialInputs[p.id] = p.stock;
        });
        setStockInputs(initialInputs);
      }
    } catch (err) {
      console.error("Failed to fetch stock:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, [filter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStock();
  };

  const handleStockInputChange = (productId: string, val: string) => {
    const num = parseInt(val, 10);
    setStockInputs((prev) => ({
      ...prev,
      [productId]: isNaN(num) ? 0 : Math.max(0, num),
    }));
  };

  const handleQuickAdjust = (productId: string, diff: number) => {
    setStockInputs((prev) => {
      const current = prev[productId] !== undefined ? prev[productId] : 0;
      return {
        ...prev,
        [productId]: Math.max(0, current + diff),
      };
    });
  };

  const handleSaveStock = async (productId: string) => {
    const newStock = stockInputs[productId];
    if (newStock === undefined) return;

    try {
      setUpdatingId(productId);
      const res = await fetch("/api/admin/stock", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          newStock,
        }),
      });

      if (res.ok) {
        setSavedId(productId);
        // Update local product list
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
        );
        setTimeout(() => setSavedId(null), 2000);
      }
    } catch (err) {
      console.error("Failed to save stock:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-200/70">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight font-heading flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-neutral-800" />
            <span>Stock &amp; Inventory Management</span>
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-0.5">
            Real-time catalog stock control, instant additions, and low stock warnings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchStock}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50 shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neutral-900 hover:bg-black text-white text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total SKUs */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              Total Catalog SKUs
            </p>
            <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-neutral-900">
            {summary.totalSkus}
          </p>
          <p className="text-[11px] text-neutral-400 font-light mt-1">Active Boutique Products</p>
        </div>

        {/* In Stock */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
              Healthy Stock (&gt; 5)
            </p>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-emerald-700">
            {summary.inStock}
          </p>
          <p className="text-[11px] text-neutral-400 font-light mt-1">Ready for fulfillment</p>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">
              Low Stock Alert (≤ 5)
            </p>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-amber-700">
            {summary.lowStock}
          </p>
          <p className="text-[11px] text-neutral-400 font-light mt-1">Requires atelier restock</p>
        </div>

        {/* Out of Stock */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">
              Out of Stock (0)
            </p>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-rose-700">
            {summary.outOfStock}
          </p>
          <p className="text-[11px] text-neutral-400 font-light mt-1">Depleted inventory</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "all", label: `All (${summary.totalSkus})` },
            { id: "low-stock", label: `Low Stock (${summary.lowStock})` },
            { id: "out-of-stock", label: `Out of Stock (${summary.outOfStock})` },
            { id: "in-stock", label: `In Stock (${summary.inStock})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filter === tab.id
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1 md:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product name, SKU..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-hidden focus:border-neutral-950"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-black transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Stock Inventory Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <RefreshCw className="w-7 h-7 text-neutral-900 animate-spin mx-auto mb-2" />
            <p className="text-xs text-neutral-500 font-light">Loading inventory status...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Package className="w-10 h-10 text-neutral-300 mx-auto" />
            <h3 className="text-sm font-semibold text-neutral-900">No Products Found</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto font-light">
              No inventory records match your selected filter or search query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Product</th>
                  <th className="px-5 py-3.5">SKU</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Price</th>
                  <th className="px-5 py-3.5">Current Stock</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Quick Stock Adjustment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {products.map((product) => {
                  const currentInput = stockInputs[product.id] ?? product.stock;
                  const isLow = product.stock > 0 && product.stock <= 5;
                  const isOut = product.stock === 0;
                  const isUpdating = updatingId === product.id;
                  const isSaved = savedId === product.id;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-neutral-50/70 transition-colors"
                    >
                      {/* Product Image & Name */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-11 h-12 rounded-lg bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0">
                            {product.image_url ? (
                              <Image
                                src={product.image_url}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <Package className="w-4 h-4 text-neutral-400 m-auto" />
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/product/${product.slug}`}
                              target="_blank"
                              className="font-bold text-neutral-900 hover:underline flex items-center gap-1"
                            >
                              <span>{product.name}</span>
                              <ExternalLink className="w-3 h-3 text-neutral-400 opacity-60" />
                            </Link>
                            <p className="text-[10.5px] text-neutral-400 font-mono">
                              /{product.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="px-5 py-3.5 font-mono font-semibold text-neutral-700">
                        {product.sku}
                      </td>

                      {/* Category */}
                      <td className="px-5 py-3.5 text-neutral-600">
                        {product.category_name || "Luxury Handbag"}
                      </td>

                      {/* Price */}
                      <td className="px-5 py-3.5 font-mono font-bold text-neutral-900">
                        {formatPrice(product.price)}
                      </td>

                      {/* Current Stock */}
                      <td className="px-5 py-3.5 font-mono font-extrabold text-sm text-neutral-900">
                        {product.stock} units
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            <span>Out of Stock</span>
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>Low Stock ({product.stock})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>In Stock</span>
                          </span>
                        )}
                      </td>

                      {/* Quick Stock Adjustment */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Decrement 1 */}
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(product.id, -1)}
                            className="p-1 rounded-md border border-neutral-200 hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer"
                            title="Decrement -1"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          {/* Direct Input */}
                          <input
                            type="number"
                            min="0"
                            value={currentInput}
                            onChange={(e) => handleStockInputChange(product.id, e.target.value)}
                            className="w-16 px-2 py-1 rounded-md border border-neutral-300 text-center font-mono font-bold text-xs focus:outline-hidden focus:border-neutral-900"
                          />

                          {/* Quick +1, +5, +10 Buttons */}
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(product.id, 1)}
                            className="px-2 py-1 rounded-md border border-neutral-200 hover:bg-neutral-100 text-neutral-700 font-mono font-bold text-[10.5px] transition-colors cursor-pointer"
                            title="Add +1"
                          >
                            +1
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(product.id, 5)}
                            className="px-2 py-1 rounded-md border border-neutral-200 hover:bg-neutral-100 text-neutral-700 font-mono font-bold text-[10.5px] transition-colors cursor-pointer"
                            title="Add +5"
                          >
                            +5
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(product.id, 10)}
                            className="px-2 py-1 rounded-md border border-neutral-200 hover:bg-neutral-100 text-neutral-700 font-mono font-bold text-[10.5px] transition-colors cursor-pointer"
                            title="Add +10"
                          >
                            +10
                          </button>

                          {/* Save Button */}
                          <button
                            type="button"
                            onClick={() => handleSaveStock(product.id)}
                            disabled={isUpdating}
                            className={`px-3 py-1 rounded-md font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50 ${
                              isSaved
                                ? "bg-emerald-600 text-white"
                                : "bg-neutral-900 hover:bg-black text-white"
                            }`}
                          >
                            {isSaved ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Saved</span>
                              </>
                            ) : (
                              <span>Save</span>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
