import React from "react";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/services/catalog-service";
import { INITIAL_PRODUCTS } from "@/lib/seed/catalog-data";
import { ProductViewClient } from "./product-client";

export async function generateStaticParams() {
  return INITIAL_PRODUCTS.map((p) => ({
    slug: p.slug,
  }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.id, product.category_slug, 4);

  return <ProductViewClient product={product} relatedProducts={relatedProducts} />;
}
