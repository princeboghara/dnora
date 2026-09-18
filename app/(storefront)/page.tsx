import React from "react";
import { redirect } from "next/navigation";
import { HeroSlider } from "@/components/hero/HeroSlider";
import { CategoriesSection } from "@/components/storefront/CategoriesSection";
import { BestSellersSection } from "@/components/storefront/BestSellersSection";
import { NewArrivalsSection } from "@/components/storefront/NewArrivalsSection";
import { PromotionalBanner } from "@/components/storefront/PromotionalBanner";
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
      {/* 1. HERO BANNER */}
      <HeroSlider banners={heroBanners} />

      {/* 2. CATEGORIES (Immediately after the first Hero Banner) */}
      <CategoriesSection categories={categories} />

      {/* 3. BEST SELLERS (Centered heading, 2-card carousel, max 4, View All) */}
      <BestSellersSection products={products} />

      {/* 4. NEW ARRIVALS (Centered heading, 2-card carousel, max 4, View All) */}
      <NewArrivalsSection products={products} />

      {/* 5. SECOND HERO / PROMOTIONAL BANNER */}
      <PromotionalBanner />

      {/* 6. SEEN ON YOU (Centered heading, horizontal scroll, viewport autoplay) */}
      <SeenOnYouSection videos={seenOnYou} />

      {/* 7. CUSTOMER REVIEWS (Centered heading, horizontal scroll) */}
      <CustomerReviews reviews={reviews} />
    </>
  );
}
