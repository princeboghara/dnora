import React from "react";
import { notFound } from "next/navigation";
import { store } from "@/lib/data/store";
import { ProductEditor } from "@/components/admin/ProductEditor";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  let product = await store.getProductById(id);
  if (!product) {
    product = await store.getProductBySlug(id);
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="py-2">
      <ProductEditor initialProduct={product} mode="edit" />
    </div>
  );
}
