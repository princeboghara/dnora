"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  Upload,
  Loader2,
} from "lucide-react";
import { Product } from "@/types";
import { formatINR } from "@/lib/utils";
import { uploadImageToStorage } from "@/lib/supabase/storage";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { invalidateCatalogCache } from "@/lib/services/catalog-service";

const DEFAULT_REALMS = [
  { slug: "handbags", name: "Handbags & Clutches" },
  { slug: "fragrance", name: "Haute Parfumerie" },
  { slug: "jewellery", name: "Fine Jewellery" },
  { slug: "apparel", name: "Artisanal Apparel" },
  { slug: "purse-charms", name: "Purse Charms & Accessories" },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>(DEFAULT_REALMS);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      if (isSupabaseConfigured() && supabase) {
        try {
          const [{ data: prodData }, { data: catData }] = await Promise.all([
            supabase.from("products").select("*, categories(slug)").order("created_at", { ascending: false }),
            supabase.from("categories").select("slug, name").order("display_order", { ascending: true })
          ]);
          if (prodData) {
            setProducts(
              prodData.map((p: any) => ({
                ...p,
                category_slug: p.categories?.slug || "handbags",
                stock_quantity: p.stock_quantity ?? 0,
                images: p.images || [],
                variants: p.variants || [],
                details: p.details || [],
              }))
            );
          }
          if (catData && catData.length > 0) {
            setCategories(catData);
          }
        } catch {
          // Ignored
        }
      }
    }
    loadProducts();
  }, []);

  // New Product Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    subtitle: "",
    category_slug: "handbags",
    base_price: 25000,
    sale_price: 0,
    sku: `DNR-${Date.now().toString().slice(-4)}`,
    primary_image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80",
    stock_quantity: 15,
    short_description: "",
    is_new: true,
    is_bestseller: false,
    is_featured: true,
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);
    const { url, error } = await uploadImageToStorage("products", file, formData.category_slug);
    setIsUploading(false);
    if (error) {
      setUploadError(error);
    } else if (url) {
      setFormData((prev) => ({ ...prev, primary_image: url }));
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      categoryFilter === "all" || p.category_slug === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleTogglePublish = (id: string) => {
    setProducts(
      products.map((p) =>
        p.id === id ? { ...p, is_published: !p.is_published } : p
      )
    );
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you certain you wish to delete this atelier creation?")) {
      if (isSupabaseConfigured() && supabase) {
        try {
          await supabase.from("products").delete().eq("id", id);
          invalidateCatalogCache();
        } catch (err) {
          console.error("Failed to delete product from Supabase", err);
        }
      }
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  const handleDuplicate = (product: Product) => {
    const copy: Product = {
      ...product,
      id: `prod_${Date.now()}`,
      name: `${product.name} (Copy)`,
      slug: `${product.slug}-copy-${Date.now().toString().slice(-4)}`,
      sku: `${product.sku}-CP`,
      created_at: new Date().toISOString(),
    };
    setProducts([copy, ...products]);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const newProd: Product = {
      id: `prod_${Date.now()}`,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
      name: formData.name,
      subtitle: formData.subtitle || "Atelier Luxury Edition",
      short_description: formData.short_description || "Handcrafted in limited atelier batches.",
      full_description: formData.short_description || "Detailed narrative of atelier craftsmanship.",
      category_slug: formData.category_slug as any,
      category_id: `cat-${formData.category_slug}`,
      base_price: Number(formData.base_price),
      sale_price: formData.sale_price ? Number(formData.sale_price) : undefined,
      is_new: formData.is_new,
      is_bestseller: formData.is_bestseller,
      is_featured: formData.is_featured,
      is_published: true,
      rating: 5.0,
      review_count: 0,
      primary_image: formData.primary_image,
      secondary_image: formData.primary_image,
      images: [
        {
          id: `img_${Date.now()}`,
          product_id: `prod_${Date.now()}`,
          url: formData.primary_image,
          alt_text: formData.name,
          display_order: 1,
          is_primary: true,
        },
      ],
      variants: [
        {
          id: `var_${Date.now()}`,
          product_id: `prod_${Date.now()}`,
          sku: formData.sku,
          stock: Number(formData.stock_quantity),
          in_stock: true,
        },
      ],
      details: ["Handcrafted by master artisans", "Finished with brushed champagne gold"],
      stock_quantity: Number(formData.stock_quantity),
      sku: formData.sku,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from("products").insert({
          slug: newProd.slug,
          name: newProd.name,
          subtitle: newProd.subtitle,
          short_description: newProd.short_description,
          full_description: newProd.full_description,
          base_price: newProd.base_price,
          sale_price: newProd.sale_price,
          sku: newProd.sku,
          is_new: newProd.is_new,
          is_bestseller: newProd.is_bestseller,
          is_featured: newProd.is_featured,
          is_published: true,
          primary_image: newProd.primary_image,
          secondary_image: newProd.secondary_image,
          details: newProd.details,
        });
        invalidateCatalogCache();
      } catch (err) {
        console.error("Failed to insert product into Supabase", err);
      }
    }

    setProducts([newProd, ...products]);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Title & CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#252D3D]">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold">
            Catalog Management
          </span>
          <h1 className="font-sans text-2xl sm:text-3xl text-[#FBF9F5] uppercase tracking-[0.12em] font-medium">
            Atelier Products Directory
          </h1>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-2.5 bg-[#C5A880] text-[#111111] text-xs uppercase tracking-widest font-semibold hover:bg-[#DFCAAB] transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Atelier Creation</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-[#8491A5] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name, SKU..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#13171F] border border-[#252D3D] text-xs text-[#E4E8EE] placeholder:text-[#8491A5] focus:outline-none focus:border-[#C5A880]"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 bg-[#13171F] border border-[#252D3D] text-xs text-[#E4E8EE] uppercase tracking-wider focus:outline-none focus:border-[#C5A880]"
        >
          <option value="all">All Realms ({products.length})</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Data Table */}
      <div className="bg-[#13171F] border border-[#252D3D] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase tracking-widest text-[#8491A5] bg-[#1A202C] border-b border-[#252D3D]">
              <tr>
                <th className="p-4">Creation</th>
                <th className="p-4">Category</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Price (INR)</th>
                <th className="p-4">Stock Level</th>
                <th className="p-4">Badges</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252D3D] text-[#E4E8EE]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-[#8491A5]">
                    <p className="font-sans font-medium text-base text-[#FBF9F5] uppercase tracking-wider">No creations in your catalog yet.</p>
                    <p className="text-xs text-[#8491A5] mt-1">Click &quot;+ Create Atelier Product&quot; to add your first luxury creation.</p>
                  </td>
                </tr>
              ) :
                filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-[#1A202C]/60 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <div className="relative w-12 h-14 bg-[#1A202C] overflow-hidden flex-shrink-0 border border-[#252D3D]">
                      <Image
                        src={prod.primary_image}
                        alt={prod.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-sans text-[#FBF9F5] font-medium uppercase tracking-wide text-xs line-clamp-1">
                        {prod.name}
                      </p>
                      <p className="text-[10px] text-[#8491A5] line-clamp-1">{prod.subtitle}</p>
                    </div>
                  </td>
                  <td className="p-4 uppercase tracking-wider text-[11px] text-[#C5A880]">
                    {prod.category_slug}
                  </td>
                  <td className="p-4 font-mono text-[#8491A5]">{prod.sku}</td>
                  <td className="p-4 font-semibold text-[#FBF9F5]">
                    {formatINR(prod.sale_price ?? prod.base_price)}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono font-bold ${
                        prod.stock_quantity <= 5
                          ? "bg-[#EF4444]/20 text-[#EF4444]"
                          : prod.stock_quantity <= 10
                          ? "bg-[#F59E0B]/20 text-[#F59E0B]"
                          : "bg-[#10B981]/20 text-[#10B981]"
                      }`}
                    >
                      {prod.stock_quantity} units
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1 flex-wrap">
                      {prod.is_bestseller && (
                        <span className="px-1.5 py-0.5 bg-[#C5A880]/20 text-[#C5A880] text-[9px] uppercase font-bold">
                          Best
                        </span>
                      )}
                      {prod.is_new && (
                        <span className="px-1.5 py-0.5 bg-[#3B82F6]/20 text-[#3B82F6] text-[9px] uppercase font-bold">
                          New
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleTogglePublish(prod.id)}
                      className={`flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold ${
                        prod.is_published ? "text-[#10B981]" : "text-[#8491A5]"
                      }`}
                    >
                      {prod.is_published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{prod.is_published ? "Published" : "Draft"}</span>
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleDuplicate(prod)}
                        title="Duplicate Creation"
                        className="p-1.5 text-[#8491A5] hover:text-[#C5A880] transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(prod.id)}
                        title="Delete"
                        className="p-1.5 text-[#8491A5] hover:text-[#EF4444] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Product Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#13171F] border border-[#252D3D] p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto text-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#252D3D]">
              <h3 className="font-sans font-medium text-base text-[#FBF9F5] uppercase tracking-[0.15em]">
                Add New Atelier Creation
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#8491A5] hover:text-[#FBF9F5]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[#8491A5]">
                    Product Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. The Devi Sculpted Satchel"
                    className="w-full p-2.5 bg-[#1A202C] border border-[#252D3D] text-[#E4E8EE]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[#8491A5]">
                    Category Realm
                  </label>
                  <select
                    value={formData.category_slug}
                    onChange={(e) => setFormData({ ...formData, category_slug: e.target.value })}
                    className="w-full p-2.5 bg-[#1A202C] border border-[#252D3D] text-[#E4E8EE]"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[#8491A5]">
                    Base Price (INR ₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#1A202C] border border-[#252D3D] text-[#E4E8EE]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[#8491A5]">
                    Sale Price (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.sale_price || ""}
                    onChange={(e) => setFormData({ ...formData, sale_price: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#1A202C] border border-[#252D3D] text-[#E4E8EE]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[#8491A5]">
                    Stock Inventory Units
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#1A202C] border border-[#252D3D] text-[#E4E8EE]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase tracking-widest text-[#8491A5]">
                    Primary Image URL (High-Res or Supabase Storage)
                  </label>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 bg-[#252D3D] hover:bg-[#323B4E] text-[#E4E8EE] text-[10px] uppercase tracking-wider font-semibold transition-colors border border-[#323B4E]">
                    {isUploading ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin text-[#C5A880]" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3 h-3 text-[#C5A880]" />
                        <span>Upload to Storage</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploading}
                      onChange={handleProductImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="url"
                  required
                  value={formData.primary_image}
                  onChange={(e) => setFormData({ ...formData, primary_image: e.target.value })}
                  placeholder="https://... or upload image file directly"
                  className="w-full p-2.5 bg-[#1A202C] border border-[#252D3D] text-[#E4E8EE]"
                />
                {uploadError && (
                  <p className="text-[11px] text-red-400">{uploadError}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-[#8491A5]">
                  Short Description
                </label>
                <textarea
                  rows={3}
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  placeholder="Architectural summary of material and atelier craft..."
                  className="w-full p-2.5 bg-[#1A202C] border border-[#252D3D] text-[#E4E8EE]"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_new}
                    onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
                    className="accent-[#C5A880]"
                  />
                  <span>Mark as New Arrival</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_bestseller}
                    onChange={(e) => setFormData({ ...formData, is_bestseller: e.target.checked })}
                    className="accent-[#C5A880]"
                  />
                  <span>Mark as Bestseller</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#252D3D]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-[#8491A5] hover:text-[#E4E8EE]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#C5A880] text-[#111111] text-xs uppercase tracking-widest font-semibold hover:bg-[#DFCAAB]"
                >
                  Save & Publish Creation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
