import { store } from "@/lib/data/store";
import { HeroBanner, HeroSlide } from "@/components/HeroBanner";
import { CircularCollections, CircularCollectionItem } from "@/components/CircularCollections";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [banners, categories] = await Promise.all([
    store.getHeroBanners(false),
    store.getCategories(),
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
    <main className="w-full min-h-screen bg-white text-neutral-900">
      <HeroBanner initialSlides={slides} />
      
      {/* Refined, Normal Balanced Gap between Hero Banner and Our Collections */}
      <div className="mt-1 sm:mt-2 md:mt-3">
        <CircularCollections items={collectionItems} />
      </div>
    </main>
  );
}
