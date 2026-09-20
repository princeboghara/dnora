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
  const [heroBanners, categories, products, reviews, seenOnYou, homepageConfig] = await Promise.all([
    store.getHeroBanners(false),
    store.getCategories(),
    store.getProducts({ status: "active" }),
    store.getReviews(),
    store.getSeenOnYou(),
    store.getHomepageConfig(),
  ]);

  return (
    <>
      {/* 1. HERO BANNER */}
      {homepageConfig?.hero?.enabled !== false && (
        <HeroSlider banners={heroBanners} height={homepageConfig?.hero?.height} />
      )}

      {/* 2. CATEGORIES (Immediately after the first Hero Banner) */}
      {homepageConfig?.categories?.enabled !== false && (
        <CategoriesSection
          categories={categories}
          title={homepageConfig?.categories?.title || "CATEGORIES"}
          headingColor={homepageConfig?.categories?.heading_color}
          headingFontSize={homepageConfig?.categories?.heading_font_size}
          headingFontFamily={homepageConfig?.categories?.heading_font_family}
          headingFontWeight={homepageConfig?.categories?.heading_font_weight}
          cardGap={homepageConfig?.categories?.card_gap}
        />
      )}

      {/* 3. BEST SELLERS (Centered heading, 2-card carousel, max 4, View All) */}
      {homepageConfig?.best_sellers?.enabled !== false && (
        <BestSellersSection
          products={products}
          title={homepageConfig?.best_sellers?.title || "BEST SELLERS"}
          viewAllLink={homepageConfig?.best_sellers?.view_all_link || "/shop?best_seller=true"}
          headingColor={homepageConfig?.best_sellers?.heading_color}
          headingFontSize={homepageConfig?.best_sellers?.heading_font_size}
          headingFontFamily={homepageConfig?.best_sellers?.heading_font_family}
          headingFontWeight={homepageConfig?.best_sellers?.heading_font_weight}
          cardGap={homepageConfig?.best_sellers?.card_gap}
        />
      )}

      {/* 4. NEW ARRIVALS (Centered heading, 2-card carousel, max 4, View All) */}
      {homepageConfig?.new_in?.enabled !== false && (
        <NewArrivalsSection
          products={products}
          title={homepageConfig?.new_in?.title || "NEW IN"}
          viewAllLink={homepageConfig?.new_in?.view_all_link || "/shop?new_arrival=true"}
          headingColor={homepageConfig?.new_in?.heading_color}
          headingFontSize={homepageConfig?.new_in?.heading_font_size}
          headingFontFamily={homepageConfig?.new_in?.heading_font_family}
          headingFontWeight={homepageConfig?.new_in?.heading_font_weight}
          cardGap={homepageConfig?.new_in?.card_gap}
        />
      )}

      {/* 5. SECOND HERO / PROMOTIONAL BANNER */}
      {homepageConfig?.middle_banner?.enabled !== false && (
        <PromotionalBanner
          eyebrow={homepageConfig?.middle_banner?.eyebrow}
          title={homepageConfig?.middle_banner?.title}
          description={homepageConfig?.middle_banner?.description}
          buttonText={homepageConfig?.middle_banner?.button_text}
          buttonLink={homepageConfig?.middle_banner?.button_link}
          imageUrl={homepageConfig?.middle_banner?.image_url}
          mediaType={homepageConfig?.middle_banner?.media_type}
          mediaUrl={homepageConfig?.middle_banner?.media_url}
          height={homepageConfig?.middle_banner?.height}
        />
      )}

      {/* 6. SEEN ON YOU (Centered heading, horizontal scroll, viewport autoplay) */}
      {homepageConfig?.seen_on_you?.enabled !== false && (
        <SeenOnYouSection
          videos={seenOnYou}
          title={homepageConfig?.seen_on_you?.title || "SEEN ON YOU"}
          headingColor={homepageConfig?.seen_on_you?.heading_color}
          headingFontSize={homepageConfig?.seen_on_you?.heading_font_size}
          headingFontFamily={homepageConfig?.seen_on_you?.heading_font_family}
          headingFontWeight={homepageConfig?.seen_on_you?.heading_font_weight}
          cardGap={homepageConfig?.seen_on_you?.card_gap}
        />
      )}

      {/* 7. CUSTOMER REVIEWS (Centered heading, horizontal scroll) */}
      {homepageConfig?.customer_reviews?.enabled !== false && (
        <CustomerReviews
          reviews={reviews}
          title={homepageConfig?.customer_reviews?.title || "CUSTOMER REVIEWS"}
        />
      )}
    </>
  );
}
