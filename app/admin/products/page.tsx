"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Flame,
  Sparkles,
  Loader2,
  ExternalLink,
  Package,
} from "lucide-react";
import { Product } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { formatPrice } from "@/lib/utils";

export default function ProductManagerPage() {
  const { success, error } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (!ignore && data.products) {
          setProducts(data.products);
        }
      } catch {
        if (!ignore) {
          error("Failed to load products");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadProducts();
    return () => {
      ignore = true;
    };
  }, [error, refreshTrigger]);

  const refreshProducts = () => setRefreshTrigger((prev) => prev + 1);

  // Instant Flag Toggling (Best Seller / New Arrival)
  const handleToggleFlag = async (product: Product, flag: "is_best_seller" | "is_new_arrival") => {
    try {
      const res = await fetch(`/api/products/${product.id}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flag }),
      });

      if (!res.ok) throw new Error("Failed to update flag");

      const currentVal = product[flag];
      success(
        !currentVal
          ? `Marked "${product.name}" as ${flag === "is_best_seller" ? "Best Seller" : "New Arrival"}.`
          : `Removed ${flag === "is_best_seller" ? "Best Seller" : "New Arrival"} flag from "${product.name}".`
      );

      refreshProducts();
    } catch {
      error("Error toggling product flag.");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}" from the catalog?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete product");

      success(`"${name}" deleted from catalog.`);
      refreshProducts();
    } catch {
      error("Error deleting product.");
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !categoryFilter || p.categories?.some((c) => c.slug === categoryFilter);
    const matchesStatus = !statusFilter || p.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-900">
              <Package className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-heading font-extrabold tracking-tight text-slate-900 uppercase">
                Product Master
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Create, edit, organize imagery, and toggle merchandising flags.
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-xs font-bold uppercase tracking-wider text-white rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Add New Handbag</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by handbag name or SKU..."
            className="w-full bg-slate-50 border border-slate-200 pl-9 pr-4 py-2 text-xs text-slate-900 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 rounded-xl focus:outline-none focus:border-slate-900 cursor-pointer font-medium"
          >
            <option value="">All Categories</option>
            <option value="shoulder-bags">Shoulder Bags</option>
            <option value="tote-bags">Tote Bags</option>
            <option value="crossbody-bags">Crossbody Bags</option>
            <option value="handbags">Handbags</option>
            <option value="mini-bags">Mini Bags</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 rounded-xl focus:outline-none focus:border-slate-900 cursor-pointer font-medium"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-16 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mr-3 text-slate-900" />
            <span className="text-sm">Loading products catalog...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-base font-heading font-bold text-slate-900 mb-2">No matching products found</p>
            <p className="text-xs text-slate-500">
              Adjust your filters or add a new handbag to the DNORA catalog.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Image</th>
                  <th className="py-3.5 px-4">Product Name &amp; SKU</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Best Seller</th>
                  <th className="py-3.5 px-4">New Arrival</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Thumbnail */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="relative w-12 h-14 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shrink-0 shadow-2xs">
                        {product.images[0] && (
                          <Image
                            src={product.images[0].secure_url}
                            alt={product.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        )}
                      </div>
                    </td>

                    {/* Product Name & SKU */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-heading font-bold text-sm text-slate-900">
                          {product.name}
                        </span>
                        <a
                          href={`/product/${product.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-slate-900 transition-colors"
                          title="View on site"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono block">
                        {product.sku} • {product.categories?.[0]?.name || "Purse"}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                      {formatPrice(product.price)}
                    </td>

                    {/* Stock */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-semibold ${
                          product.stock < 10 ? "text-rose-600" : "text-slate-700"
                        }`}
                      >
                        {product.stock} units
                      </span>
                    </td>

                    {/* Best Seller Toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleFlag(product, "is_best_seller")}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                          product.is_best_seller
                            ? "bg-slate-900 text-white shadow-2xs"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                        title="Toggle Best Seller section placement"
                      >
                        <Flame className={`w-3 h-3 ${product.is_best_seller ? "text-amber-400" : "text-slate-400"}`} />
                        <span>{product.is_best_seller ? "ON" : "OFF"}</span>
                      </button>
                    </td>

                    {/* New Arrival Toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleFlag(product, "is_new_arrival")}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                          product.is_new_arrival
                            ? "bg-slate-900 text-white shadow-2xs"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                        title="Toggle New Arrival section placement"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{product.is_new_arrival ? "ON" : "OFF"}</span>
                      </button>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          product.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                          title="Edit Handbag"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
