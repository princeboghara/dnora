import { store } from "@/lib/data/store";
import { HeroBanner, HeroSlide } from "@/components/HeroBanner";
import { CircularCollections, CircularCollectionItem } from "@/components/CircularCollections";
import { BestSellersSection } from "@/components/BestSellersSection";
import { PromoBanner } from "@/components/PromoBanner";
import { NewArrivalsSection } from "@/components/NewArrivalsSection";
import { SeenOnYouSection } from "@/components/SeenOnYouSection";
import { CustomerReviewsSection } from "@/components/CustomerReviewsSection";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [banners, categories, bestSellers, newArrivals, videos, reviews] = await Promise.all([
    store.getHeroBanners(false),
    store.getCategories(),
    store.getProducts({ is_best_seller: true }),
    store.getProducts({ is_new_arrival: true }),
    store.getSeenOnYou(),
    store.getReviews(true),
  ]);

  const slides: HeroSlide[] = banners.map((b) => ({
    id: b.id,
    media_type: b.media_type,
    media_url: b.media_url,
    tablet_media_url: b.tablet_media_url || undefined,
    mobile_media_url: b.mobile_media_url || undefined,
    heading: b.heading || undefined,
    subtitle: b.subtitle || undefined,
    button_text: b.button_text || undefined,
    link: b.button_link || "/shop",
    duration_seconds: b.duration_seconds || 5,
  }));

  // Map Admin Categories directly to Our Collections round items
  const collectionItems: CircularCollectionItem[] = categories.map((cat) => ({
    id: `cat-${cat.id}`,
    label: cat.name,
    href: `/category/${cat.slug}`,
    image:
      cat.image_url ||
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=300&q=80",
    alt: `${cat.name} Luxury Collection`,
  }));

  // Always append an extra round circle for "View All" at the end
  collectionItems.push({
    id: "col-view-all",
    label: "View All",
    href: "/shop",
    image:
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=300&q=80",
    badge: "All",
    alt: "Explore All Silhouettes",
    isViewAll: true,
  });

  return (
    <main className="w-full min-h-screen bg-white text-neutral-900 overflow-x-clip">
      {/* 1. Hero Banner */}
      <HeroBanner initialSlides={slides} />
      
      {/* 2. Our Collections (Circular Category Browser) */}
      <div className="mt-1 sm:mt-2 md:mt-3">
        <CircularCollections items={collectionItems} />
      </div>

      {/* 3. Best Sellers Section */}
      <BestSellersSection products={bestSellers} />

      {/* 4. Mid-page Campaign Editorial Banner */}
      <PromoBanner />

      {/* 5. New Arrivals Section */}
      <NewArrivalsSection products={newArrivals} />

      {/* 6. Seen On You (Videos / Reels Section) */}
      <SeenOnYouSection videos={videos} />

      {/* 7. Customer Reviews Section */}
      <CustomerReviewsSection reviews={reviews} />
    </main>
  );
}
