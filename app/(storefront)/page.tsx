import React from "react";
import { redirect } from "next/navigation";
import { HeroSlider } from "@/components/hero/HeroSlider";
import { CategoriesSection } from "@/components/storefront/CategoriesSection";
import { BestSellersSection } from "@/components/storefront/BestSellersSection";
import { EditorialSection } from "@/components/storefront/EditorialSection";
import { NewArrivalsSection } from "@/components/storefront/NewArrivalsSection";
import { SeenOnYouSection } from "@/components/storefront/SeenOnYouSection";
import { CustomerReviews } from "@/components/storefront/CustomerReviews";
import { store } from "@/lib/data/store";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams?: Promise<{ code?: string; next?: string }>;
}

export default async function HomePage(props: HomePageProps) {
  const searchParams = await props.searchParams;
  if (searchParams?.code) {
    const nextParam = searchParams.next ? `&next=${encodeURIComponent(searchParams.next)}` : "";
    redirect(`/api/auth/callback?code=${encodeURIComponent(searchParams.code)}${nextParam}`);
  }

  // Fetch data in parallel for optimal performance
  const [heroBanners, categories, products, reviews, seenOnYou] = await Promise.all([
    store.getHeroBanners(false),
    store.getCategories(),
    store.getProducts({ status: "active" }),
    store.getReviews(),
    store.getSeenOnYou(),
  ]);

  return (
    <>
      {/* 2. Hero Banner (Image & Video Autoplay + Advance) */}
      <HeroSlider banners={heroBanners} />

      {/* 3. Categories */}
      <CategoriesSection categories={categories} />

      {/* 4. Best Sellers */}
      <BestSellersSection products={products} />

      {/* 5. Product Visual / Editorial Purse Section */}
      <EditorialSection />

      {/* 6. New Arrivals */}
      <NewArrivalsSection products={products} />

      {/* 7. Seen On You (Customer Video Reel) */}
      <SeenOnYouSection videos={seenOnYou} />

      {/* 8. Customer Reviews */}
      <CustomerReviews reviews={reviews} />
    </>
  );
}
