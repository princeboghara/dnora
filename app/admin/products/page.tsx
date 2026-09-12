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
  RefreshCw,
  X,
  AlertCircle,
  Package,
} from "lucide-react";
import { Product } from "@/types";
import { formatINR } from "@/lib/utils";
import { uploadImageToStorage } from "@/lib/supabase/storage";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  getAllAdminProducts,
  saveAdminProductsOverride,
  invalidateCatalogCache,
  getCategories,
} from "@/lib/services/catalog-service";
import { INITIAL_PRODUCTS } from "@/lib/seed/catalog-data";

const DEFAULT_REALMS = [
  { slug: "handbags", name: "Handbags & Clutches" },
  { slug: "bucket-bags", name: "Bucket Bags" },
  { slug: "shoulder-bags", name: "Shoulder Bags" },
  { slug: "tote-bags", name: "Tote & Bowling Bags" },
  { slug: "hobo-bags", name: "Hobo Bags" },
  { slug: "crossbody-bags", name: "Crossbody Bags" },
  { slug: "fragrance", name: "Haute Parfumerie" },
  { slug: "jewellery", name: "Fine Jewellery" },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>(DEFAULT_REALMS);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  // Edit Product Form state
  const [editFormData, setEditFormData] = useState({
    name: "",
    slug: "",
    subtitle: "",
    category_slug: "handbags",
    base_price: 0,
    sale_price: 0,
    sku: "",
    primary_image: "",
    stock_quantity: 0,
    short_description: "",
    is_new: false,
    is_bestseller: false,
    is_featured: false,
    is_published: true,
  });

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [prods, cats] = await Promise.all([
          getAllAdminProducts(),
          getCategories(),
        ]);
        setProducts(prods);
        if (cats && cats.length > 0) {
          setCategories(cats.map((c) => ({ slug: c.slug, name: c.name })));
        }
      } catch (err) {
        console.error("Failed to load catalog:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // Filtered list
  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category_slug.toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      categoryFilter === "all" || p.category_slug === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // Open Edit Modal
  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setEditFormData({
      name: product.name,
      slug: product.slug,
      subtitle: product.subtitle || "",
      category_slug: product.category_slug || "handbags",
      base_price: product.base_price,
      sale_price: product.sale_price || 0,
      sku: product.sku,
      primary_image: product.primary_image,
      stock_quantity: product.stock_quantity ?? 15,
      short_description: product.short_description || "",
      is_new: Boolean(product.is_new),
      is_bestseller: Boolean(product.is_bestseller),
      is_featured: Boolean(product.is_featured),
      is_published: product.is_published !== false,
    });
    setUploadError(null);
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const updatedProduct: Product = {
      ...editingProduct,
      name: editFormData.name,
      slug: editFormData.slug || editFormData.name.toLowerCase().replace(/\s+/g, "-"),
      subtitle: editFormData.subtitle,
      category_slug: editFormData.category_slug as any,
      base_price: Number(editFormData.base_price),
      sale_price: editFormData.sale_price ? Number(editFormData.sale_price) : undefined,
      sku: editFormData.sku,
      primary_image: editFormData.primary_image,
      stock_quantity: Number(editFormData.stock_quantity),
      short_description: editFormData.short_description,
      is_new: editFormData.is_new,
      is_bestseller: editFormData.is_bestseller,
      is_featured: editFormData.is_featured,
      is_published: editFormData.is_published,
    };

    const newProducts = products.map((p) =>
      p.id === editingProduct.id ? updatedProduct : p
    );

    setProducts(newProducts);
    saveAdminProductsOverride(newProducts);

    // Sync to Supabase in background
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase
          .from("products")
          .update({
            name: updatedProduct.name,
            slug: updatedProduct.slug,
            subtitle: updatedProduct.subtitle,
            short_description: updatedProduct.short_description,
            base_price: updatedProduct.base_price,
            sale_price: updatedProduct.sale_price,
            primary_image: updatedProduct.primary_image,
            is_new: updatedProduct.is_new,
            is_bestseller: updatedProduct.is_bestseller,
            is_featured: updatedProduct.is_featured,
            is_published: updatedProduct.is_published,
            sku: updatedProduct.sku,
          })
          .eq("id", editingProduct.id);
      } catch (err) {
        console.warn("Supabase update notice:", err);
      }
    }

    invalidateCatalogCache();
    setEditingProduct(null);
    showNotification(`"${updatedProduct.name}" updated successfully.`);
  };

  // Toggle Published / Draft status
  const handleTogglePublish = async (id: string) => {
    let targetName = "";
    let nextStatus = false;

    const newProducts = products.map((p) => {
      if (p.id === id) {
        targetName = p.name;
        nextStatus = !p.is_published;
        return { ...p, is_published: nextStatus };
      }
      return p;
    });

    setProducts(newProducts);
    saveAdminProductsOverride(newProducts);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase
          .from("products")
          .update({ is_published: nextStatus })
          .eq("id", id);
      } catch {
        // Fallback handled
      }
    }

    invalidateCatalogCache();
    showNotification(
      `${targetName} is now ${nextStatus ? "Published (Live)" : "Draft (Hidden)"}.`
    );
  };

  // Delete product
  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you certain you wish to delete "${name}" from the atelier catalog?`)) {
      const newProducts = products.filter((p) => p.id !== id);
      setProducts(newProducts);
      saveAdminProductsOverride(newProducts);

      if (isSupabaseConfigured() && supabase) {
        try {
          await supabase.from("products").delete().eq("id", id);
        } catch {
          // Handled
        }
      }

      invalidateCatalogCache();
      showNotification(`"${name}" has been removed from catalog.`);
    }
  };

  // Duplicate product
  const handleDuplicate = (product: Product) => {
    const copy: Product = {
      ...product,
      id: `prod_${Date.now()}`,
      name: `${product.name} (Copy)`,
      slug: `${product.slug}-copy-${Date.now().toString().slice(-4)}`,
      sku: `${product.sku}-CP`,
      created_at: new Date().toISOString(),
    };
    const newProducts = [copy, ...products];
    setProducts(newProducts);
    saveAdminProductsOverride(newProducts);
    invalidateCatalogCache();
    showNotification(`Duplicate of "${product.name}" created.`);
  };

  // Reset / Sync to Live Store Default Catalog
  const handleResetToDefaultLive = () => {
    if (
      confirm(
        "Reset catalog to the 8 official live store atelier creations? Any local overrides will be refreshed to default."
      )
    ) {
      setProducts(INITIAL_PRODUCTS);
      saveAdminProductsOverride(INITIAL_PRODUCTS);
      invalidateCatalogCache();
      showNotification("Catalog successfully synced to live store atelier creations.");
    }
  };

  // Create Product
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
      details: ["Handcrafted by master artisans", "Finished with brushed champagne gold hardware"],
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
      } catch (err) {
        console.warn("Supabase insert notice:", err);
      }
    }

    const newProducts = [newProd, ...products];
    setProducts(newProducts);
    saveAdminProductsOverride(newProducts);
    invalidateCatalogCache();
    setIsCreateModalOpen(false);
    showNotification(`New creation "${newProd.name}" added to catalog.`);
  };

  // Image Upload handler
  const handleProductImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit = false
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);
    const category = isEdit ? editFormData.category_slug : formData.category_slug;
    const { url, error } = await uploadImageToStorage("products", file, category);
    setIsUploading(false);
    if (error) {
      setUploadError(error);
    } else if (url) {
      if (isEdit) {
        setEditFormData((prev) => ({ ...prev, primary_image: url }));
      } else {
        setFormData((prev) => ({ ...prev, primary_image: url }));
      }
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-[#C5A880] text-[#111111] text-xs font-semibold uppercase tracking-wider shadow-lg flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Title & CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#9E7D4E] font-semibold font-mono">
              Catalog Management
            </span>
            <span className="text-[9px] uppercase tracking-wider text-[#9E7D4E] bg-[#C5A880]/15 px-2 py-0.5 rounded-full border border-[#C5A880]/30 font-mono font-medium">
              Atelier Vault
            </span>
          </div>
          <h1 className="font-sans text-2xl sm:text-3xl text-[#0F172A] uppercase tracking-[0.14em] font-bold mt-1">
            Products Directory
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Curate live store items, update pricing, restock inventory units, and toggle visibility.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleResetToDefaultLive}
            title="Sync to Default Live Store Products"
            className="px-4 py-2.5 rounded-xl neu-btn text-[#475569] hover:text-[#9E7D4E] text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Live Items</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl neu-btn-gold text-xs uppercase tracking-widest font-bold text-white transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Creation</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name, SKU, or category..."
            className="w-full pl-10 pr-4 py-3 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50 transition-all font-mono"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-3 rounded-xl neu-inset bg-[#F1F5F9] text-xs text-[#0F172A] uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-[#C5A880]/50 font-mono cursor-pointer"
        >
          <option value="all" className="bg-white text-[#0F172A]">All Realms ({products.length})</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug} className="bg-white text-[#0F172A]">
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Data Table inside neu-card */}
      <div className="rounded-2xl neu-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase tracking-widest text-[#64748B] font-mono bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4">Creation</th>
                <th className="p-4">Category</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Price (INR)</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Badges</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#1E293B]">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-[#64748B]">
                    <Loader2 className="w-6 h-6 mx-auto animate-spin text-[#9E7D4E] mb-2" />
                    <p className="text-xs uppercase tracking-wider font-mono">Accessing Atelier Catalog...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-[#64748B]">
                    <Package className="w-8 h-8 mx-auto text-[#9E7D4E]/60 mb-2" />
                    <p className="font-sans font-semibold text-base text-[#0F172A] uppercase tracking-wider">
                      No matching creations found.
                    </p>
                    <p className="text-xs text-[#64748B] mt-1">
                      Click &quot;Sync Live Store Items&quot; above to reload the 8 official store creations.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="relative w-12 h-14 rounded-lg neu-inset bg-[#F1F5F9] p-0.5 overflow-hidden flex-shrink-0">
                        <Image
                          src={prod.primary_image}
                          alt={prod.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div>
                        <p className="font-sans text-[#0F172A] font-semibold uppercase tracking-wide text-xs line-clamp-1">
                          {prod.name}
                        </p>
                        <p className="text-[10px] text-[#64748B] line-clamp-1">
                          {prod.subtitle || prod.slug}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 uppercase tracking-wider text-[11px] text-[#9E7D4E] font-mono font-medium">
                      {prod.category_slug}
                    </td>
                    <td className="p-4 font-mono text-[#64748B] text-[11px]">{prod.sku}</td>
                    <td className="p-4 font-mono">
                      <div className="space-y-0.5">
                        <span className="font-bold text-[#0F172A]">
                          {formatINR(prod.sale_price ?? prod.base_price)}
                        </span>
                        {prod.sale_price && prod.sale_price < prod.base_price && (
                          <span className="block text-[10px] line-through text-[#94A3B8]">
                            {formatINR(prod.base_price)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold neu-inset ${
                          (prod.stock_quantity ?? 0) <= 5
                            ? "text-[#EF4444]"
                            : (prod.stock_quantity ?? 0) <= 15
                            ? "text-[#F59E0B]"
                            : "text-[#10B981]"
                        }`}
                      >
                        {prod.stock_quantity ?? 0} units
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1 flex-wrap">
                        {prod.is_bestseller && (
                          <span className="px-2 py-0.5 neu-inset rounded-md text-[#C5A880] text-[9px] uppercase font-mono font-bold">
                            Best
                          </span>
                        )}
                        {prod.is_new && (
                          <span className="px-2 py-0.5 neu-inset rounded-md text-[#3B82F6] text-[9px] uppercase font-mono font-bold">
                            New
                          </span>
                        )}
                        {prod.is_featured && (
                          <span className="px-2 py-0.5 neu-inset rounded-md text-[#8B5CF6] text-[9px] uppercase font-mono font-bold">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleTogglePublish(prod.id)}
                        className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold font-mono px-3 py-1 rounded-full transition-all ${
                          prod.is_published !== false
                            ? "neu-inset text-[#10B981]"
                            : "neu-btn text-[#8A95A5]"
                        }`}
                      >
                        {prod.is_published !== false ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                        <span>{prod.is_published !== false ? "Live" : "Draft"}</span>
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          title="Edit Creation"
                          className="p-2 rounded-xl neu-btn text-[#8A95A5] hover:text-[#C5A880] transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(prod)}
                          title="Duplicate Creation"
                          className="p-2 rounded-xl neu-btn text-[#8A95A5] hover:text-[#C5A880] transition-all"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id, prod.name)}
                          title="Delete Creation"
                          className="p-2 rounded-xl neu-btn text-[#8A95A5] hover:text-[#FF6B6B] transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="rounded-3xl neu-glass p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto text-xs space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880] font-mono font-semibold">
                  Catalog Studio
                </span>
                <h3 className="font-sans font-medium text-lg text-[#F5F7FA] uppercase tracking-wider mt-0.5">
                  Edit Creation: {editingProduct.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-2 rounded-xl neu-btn text-[#8A95A5] hover:text-[#F5F7FA] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#8A95A5] font-mono">
                    Product Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl neu-inset text-xs text-[#F5F7FA] placeholder-[#4B5565] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/40 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#8A95A5] font-mono">
                    Category Realm
                  </label>
                  <select
                    value={editFormData.category_slug}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        category_slug: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl neu-inset text-xs text-[#F5F7FA] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/40 transition-all"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug} className="bg-[#12151b] text-[#EDEDED]">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#8A95A5] font-mono">
                    Subtitle / Style Code
                  </label>
                  <input
                    type="text"
                    value={editFormData.subtitle}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, subtitle: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl neu-inset text-xs text-[#F5F7FA] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/40 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#8A95A5] font-mono">
                    SKU Identifier
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.sku}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, sku: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl neu-inset text-xs text-[#F5F7FA] font-mono focus:outline-none focus:ring-1 focus:ring-[#C5A880]/40 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#8A95A5] font-mono">
                    Base Price (INR ₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={editFormData.base_price}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        base_price: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl neu-inset text-xs text-[#F5F7FA] font-mono focus:outline-none focus:ring-1 focus:ring-[#C5A880]/40 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#8A95A5] font-mono">
                    Sale Price (₹)
                  </label>
                  <input
                    type="number"
                    value={editFormData.sale_price || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        sale_price: Number(e.target.value),
                      })
                    }
                    placeholder="Optional"
                    className="w-full px-4 py-3 rounded-xl neu-inset text-xs text-[#F5F7FA] font-mono focus:outline-none focus:ring-1 focus:ring-[#C5A880]/40 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#8A95A5] font-mono">
                    Stock Units
                  </label>
                  <input
                    type="number"
                    required
                    value={editFormData.stock_quantity}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        stock_quantity: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl neu-inset text-xs text-[#F5F7FA] font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#C5A880]/40 transition-all"
                  />
                </div>
              </div>

              {/* Image Input & Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase tracking-widest text-[#8A95A5] font-mono">
                    Primary Image
                  </label>
                  <label className="cursor-pointer px-3 py-1.5 rounded-xl neu-btn text-[10px] font-mono text-[#C5A880] uppercase tracking-wider transition-all flex items-center gap-1.5">
                    {isUploading ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin text-[#C5A880]" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3 h-3 text-[#C5A880]" />
                        <span>Upload File</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploading}
                      onChange={(e) => handleProductImageUpload(e, true)}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-xl neu-inset p-0.5 overflow-hidden flex-shrink-0">
                    {editFormData.primary_image ? (
                      <Image
                        src={editFormData.primary_image}
                        alt="Preview"
                        fill
                        className="object-cover rounded-lg"
                      />
                    ) : null}
                  </div>
                  <input
                    type="url"
                    required
                    value={editFormData.primary_image}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        primary_image: e.target.value,
                      })
                    }
                    className="flex-1 px-4 py-3 rounded-xl neu-inset text-xs text-[#F5F7FA] font-mono focus:outline-none focus:ring-1 focus:ring-[#C5A880]/40 transition-all"
                  />
                </div>
                {uploadError && (
                  <p className="text-[11px] text-red-400 font-mono">{uploadError}</p>
                )}
              </div>

              {/* Short Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#8A95A5] font-mono">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={editFormData.short_description}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      short_description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl neu-inset text-xs text-[#F5F7FA] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/40 transition-all"
                />
              </div>

              {/* Badges & Status Checkboxes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl neu-inset">
                  <input
                    type="checkbox"
                    checked={editFormData.is_new}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, is_new: e.target.checked })
                    }
                    className="accent-[#C5A880] w-4 h-4 cursor-pointer"
                  />
                  <span className="text-[#EDEDED]">New Arrival</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl neu-inset">
                  <input
                    type="checkbox"
                    checked={editFormData.is_bestseller}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        is_bestseller: e.target.checked,
                      })
                    }
                    className="accent-[#C5A880] w-4 h-4 cursor-pointer"
                  />
                  <span className="text-[#EDEDED]">Bestseller</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl neu-inset">
                  <input
                    type="checkbox"
                    checked={editFormData.is_featured}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        is_featured: e.target.checked,
                      })
                    }
                    className="accent-[#C5A880] w-4 h-4 cursor-pointer"
                  />
                  <span className="text-[#EDEDED]">Featured</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl neu-inset">
                  <input
                    type="checkbox"
                    checked={editFormData.is_published}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        is_published: e.target.checked,
                      })
                    }
                    className="accent-[#10B981] w-4 h-4 cursor-pointer"
                  />
                  <span className="text-[#10B981] font-semibold">Live</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-5 py-2.5 rounded-xl neu-btn text-[#8A95A5] hover:text-[#EDEDED] text-xs font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl neu-btn-gold text-xs uppercase tracking-widest font-semibold text-[#0d0f12] transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW PRODUCT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="rounded-3xl neu-glass p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto text-xs space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880] font-mono font-semibold">
                  New Product
                </span>
                <h3 className="font-sans font-medium text-lg text-[#F5F7FA] uppercase tracking-wider mt-0.5">
                  Add Atelier Creation
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-xl neu-btn text-[#8A95A5] hover:text-[#F5F7FA] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#8A95A5] font-mono">
                    Product Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. The Devi Sculpted Satchel"
                    className="w-full px-4 py-3 rounded-xl neu-inset text-xs text-[#F5F7FA] placeholder-[#4B5565] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/40 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#8A95A5] font-mono">
                    Category Realm
                  </label>
                  <select
                    value={formData.category_slug}
                    onChange={(e) =>
                      setFormData({ ...formData, category_slug: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl neu-inset text-xs text-[#F5F7FA] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/40 transition-all"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug} className="bg-[#12151b] text-[#EDEDED]">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#8A95A5] font-mono">
                    Base Price (INR ₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.base_price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        base_price: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl neu-inset text-xs text-[#F5F7FA] font-mono focus:outline-none focus:ring-1 focus:ring-[#C5A880]/40 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#8A95A5] font-mono">
                    Sale Price (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.sale_price || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sale_price: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl neu-inset text-xs text-[#F5F7FA] font-mono focus:outline-none focus:ring-1 focus:ring-[#C5A880]/40 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#8A95A5] font-mono">
                    Stock Units
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock_quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stock_quantity: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl neu-inset text-xs text-[#F5F7FA] font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#C5A880]/40 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase tracking-widest text-[#8A95A5] font-mono">
                    Primary Image
                  </label>
                  <label className="cursor-pointer px-3 py-1.5 rounded-xl neu-btn text-[10px] font-mono text-[#C5A880] uppercase tracking-wider transition-all flex items-center gap-1.5">
                    {isUploading ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin text-[#C5A880]" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3 h-3 text-[#C5A880]" />
                        <span>Upload File</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploading}
                      onChange={(e) => handleProductImageUpload(e, false)}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="url"
                  required
                  value={formData.primary_image}
                  onChange={(e) =>
                    setFormData({ ...formData, primary_image: e.target.value })
                  }
                  placeholder="https://... or upload image directly"
                  className="w-full px-4 py-3 rounded-xl neu-inset text-xs text-[#F5F7FA] font-mono focus:outline-none focus:ring-1 focus:ring-[#C5A880]/40 transition-all"
                />
                {uploadError && (
                  <p className="text-[11px] text-red-400 font-mono">{uploadError}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#8A95A5] font-mono">
                  Short Description
                </label>
                <textarea
                  rows={3}
                  value={formData.short_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      short_description: e.target.value,
                    })
                  }
                  placeholder="Architectural summary of material and atelier craft..."
                  className="w-full px-4 py-3 rounded-xl neu-inset text-xs text-[#F5F7FA] focus:outline-none focus:ring-1 focus:ring-[#C5A880]/40 transition-all"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl neu-inset">
                  <input
                    type="checkbox"
                    checked={formData.is_new}
                    onChange={(e) =>
                      setFormData({ ...formData, is_new: e.target.checked })
                    }
                    className="accent-[#C5A880] w-4 h-4 cursor-pointer"
                  />
                  <span className="text-[#EDEDED]">New Arrival</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl neu-inset">
                  <input
                    type="checkbox"
                    checked={formData.is_bestseller}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_bestseller: e.target.checked,
                      })
                    }
                    className="accent-[#C5A880] w-4 h-4 cursor-pointer"
                  />
                  <span className="text-[#EDEDED]">Bestseller</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl neu-btn text-[#8A95A5] hover:text-[#EDEDED] text-xs font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl neu-btn-gold text-xs uppercase tracking-widest font-semibold text-[#0d0f12] transition-all"
                >
                  Publish Creation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

