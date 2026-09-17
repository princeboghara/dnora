"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Flame,
  Sparkles,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Product } from "@/types";
import { ProductForm } from "@/components/admin/ProductForm";
import { Modal } from "@/components/ui/Modal";
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

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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

  // Filtered in-memory list
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E5DE]">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-[#C5A880] font-semibold block mb-1">
            Inventory &amp; Merchandising
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0E0E0E] tracking-tight">
            Product Manager
          </h1>
          <p className="text-xs text-[#73706A] mt-1">
            Create, edit, organize Cloudinary imagery, and toggle Best Seller or New Arrival flags.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0E0E0E] hover:bg-[#2C2B29] text-xs font-bold uppercase tracking-wider text-[#FAF9F6] rounded transition-all shadow-md shrink-0"
        >
          <Plus className="w-4 h-4 text-[#C5A880]" />
          <span>Add New Handbag</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg border border-[#E8E5DE] shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#73706A] absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by handbag name or SKU..."
            className="w-full bg-[#FAF9F6] border border-[#E8E5DE] pl-9 pr-4 py-2 text-xs text-[#0E0E0E] rounded focus:outline-none focus:border-[#0E0E0E]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#FAF9F6] border border-[#E8E5DE] px-3 py-2 text-xs text-[#0E0E0E] rounded focus:outline-none focus:border-[#0E0E0E]"
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
            className="bg-[#FAF9F6] border border-[#E8E5DE] px-3 py-2 text-xs text-[#0E0E0E] rounded focus:outline-none focus:border-[#0E0E0E]"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white border border-[#E8E5DE] rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-16 text-[#73706A]">
            <Loader2 className="w-6 h-6 animate-spin mr-3" />
            <span className="text-sm">Loading products catalog...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-base font-heading text-[#0E0E0E] mb-2">No matching products found</p>
            <p className="text-xs text-[#73706A]">
              Adjust your filters or add a new handbag to the DNORA catalog.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E8E5DE] bg-[#FAF9F6] text-[10px] font-bold uppercase tracking-[0.18em] text-[#73706A]">
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
              <tbody className="divide-y divide-[#E8E5DE] text-xs">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-[#FAF9F6]/60 transition-colors">
                    {/* Thumbnail */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="relative w-14 h-16 bg-[#F5F3EF] rounded overflow-hidden border border-[#E8E5DE] shrink-0">
                        {product.images[0] && (
                          <Image
                            src={product.images[0].secure_url}
                            alt={product.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        )}
                      </div>
                    </td>

                    {/* Product Name & SKU */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-heading font-bold text-sm text-[#0E0E0E]">
                          {product.name}
                        </span>
                        <a
                          href={`/product/${product.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#A8A49C] hover:text-[#0E0E0E]"
                          title="View on site"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <span className="text-[11px] text-[#73706A] font-mono block">
                        {product.sku} • {product.categories?.[0]?.name || "Purse"}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-semibold text-[#0E0E0E]">
                      {formatPrice(product.price)}
                    </td>

                    {/* Stock */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-semibold ${
                          product.stock < 10 ? "text-rose-700" : "text-[#0E0E0E]"
                        }`}
                      >
                        {product.stock} units
                      </span>
                    </td>

                    {/* Best Seller Toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleFlag(product, "is_best_seller")}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                          product.is_best_seller
                            ? "bg-[#0E0E0E] text-[#FAF9F6]"
                            : "bg-[#F5F3EF] text-[#73706A] hover:bg-[#EAE6DF]"
                        }`}
                        title="Toggle Best Seller section placement"
                      >
                        <Flame className={`w-3 h-3 ${product.is_best_seller ? "text-amber-400" : "text-gray-400"}`} />
                        <span>{product.is_best_seller ? "ON" : "OFF"}</span>
                      </button>
                    </td>

                    {/* New Arrival Toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleFlag(product, "is_new_arrival")}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                          product.is_new_arrival
                            ? "bg-[#C5A880] text-[#0E0E0E]"
                            : "bg-[#F5F3EF] text-[#73706A] hover:bg-[#EAE6DF]"
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
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          product.status === "active"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-gray-100 text-gray-700 border border-gray-200"
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="p-1.5 rounded hover:bg-[#F5F3EF] text-[#3A3835] hover:text-[#0E0E0E]"
                          title="Edit Handbag"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-1.5 rounded hover:bg-rose-50 text-[#73706A] hover:text-rose-600"
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

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Handbag to Catalog"
        maxWidth="2xl"
      >
        <ProductForm
          onSuccess={() => {
            setIsCreateOpen(false);
            refreshProducts();
          }}
          onCancel={() => setIsCreateOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={Boolean(editingProduct)}
        onClose={() => setEditingProduct(null)}
        title="Edit Handbag Details"
        maxWidth="2xl"
      >
        {editingProduct && (
          <ProductForm
            initialData={editingProduct}
            onSuccess={() => {
              setEditingProduct(null);
              refreshProducts();
            }}
            onCancel={() => setEditingProduct(null)}
          />
        )}
      </Modal>
    </div>
  );
}
