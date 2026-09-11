"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Layers, Plus, Check } from "lucide-react";
import { getCollections } from "@/lib/services/catalog-service";
import { Collection } from "@/types";

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const cols = await getCollections();
      setCollections(cols);
      setIsLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#252D3D]">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold">
            Editorial Capsules
          </span>
          <h1 className="font-sans text-2xl sm:text-3xl text-[#FBF9F5] uppercase tracking-[0.12em] font-medium">
            Curated Collections
          </h1>
        </div>
        <span className="text-xs text-[#8491A5] font-mono">
          {collections.length} Editorial Capsules
        </span>
      </div>

      {collections.length === 0 ? (
        <div className="p-16 text-center text-[#8491A5] border border-dashed border-[#252D3D] bg-[#13171F]">
          <Layers className="w-8 h-8 mx-auto text-[#C5A880]/50 mb-3" />
          <p className="text-xs font-sans font-medium uppercase tracking-widest text-[#FBF9F5]">
            {isLoading ? "Retrieving capsules..." : "No Curated Collections Found"}
          </p>
          <p className="text-[11px] text-[#8491A5] mt-1 max-w-sm mx-auto">
            {isLoading
              ? "Connecting to collections database..."
              : "The atelier currently has 0 editorial capsules configured. Capsules created in Supabase will be displayed here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {collections.map((col) => (
            <div key={col.id} className="bg-[#13171F] border border-[#252D3D] p-6 space-y-4">
              <div className="relative aspect-[16/8] w-full bg-[#1A202C] overflow-hidden border border-[#252D3D]">
                <Image
                  src={col.image_url}
                  alt={col.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end">
                  <span className="text-[10px] uppercase tracking-widest text-[#C5A880]">
                    {col.tagline}
                  </span>
                  <h3 className="font-sans font-medium text-base text-[#FBF9F5] uppercase tracking-[0.12em]">
                    {col.name}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-[#8491A5]">{col.description}</p>
              <div className="pt-2 flex items-center justify-between text-xs text-[#8491A5] border-t border-[#252D3D]">
                <span>Linked Creations: {col.product_ids?.length || 0} items</span>
                <span className="text-[#10B981] font-semibold text-[10px] uppercase">Active Capsule</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
