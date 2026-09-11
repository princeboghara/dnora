"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FolderTree, Plus, Edit2, Trash2 } from "lucide-react";
import { getCategories } from "@/lib/services/catalog-service";
import { Category } from "@/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const cats = await getCategories();
      setCategories(cats);
      setIsLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#252D3D]">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold">
            Taxonomy &amp; Curation
          </span>
          <h1 className="font-sans text-2xl sm:text-3xl text-[#FBF9F5] uppercase tracking-[0.12em] font-medium">
            Category Realms
          </h1>
        </div>
        <span className="text-xs text-[#8491A5] font-mono">
          {categories.length} Active Realms
        </span>
      </div>

      {categories.length === 0 ? (
        <div className="p-16 text-center text-[#8491A5] border border-dashed border-[#252D3D] bg-[#13171F]">
          <FolderTree className="w-8 h-8 mx-auto text-[#C5A880]/50 mb-3" />
          <p className="text-xs font-sans font-medium uppercase tracking-widest text-[#FBF9F5]">
            {isLoading ? "Loading category realms..." : "No Category Realms Configured"}
          </p>
          <p className="text-[11px] text-[#8491A5] mt-1 max-w-sm mx-auto">
            {isLoading
              ? "Querying taxonomy from database..."
              : "The catalog taxonomy currently has 0 active realms. Realms created in Supabase will display here automatically."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-[#13171F] border border-[#252D3D] p-5 space-y-4">
              <div className="relative aspect-[16/9] w-full bg-[#1A202C] overflow-hidden border border-[#252D3D]">
                <Image
                  src={cat.image_url}
                  alt={cat.name}
                  fill
                  className="object-cover"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#141414]/90 text-[#C5A880] text-[10px] font-mono">
                  Order: #{cat.display_order}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <h3 className="font-sans font-medium text-sm text-[#FBF9F5] uppercase tracking-[0.15em]">
                  {cat.name}
                </h3>
                <p className="text-[#8491A5] line-clamp-2">{cat.description}</p>
                <p className="font-mono text-[11px] text-[#C5A880] pt-1">
                  /shop/{cat.slug}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
