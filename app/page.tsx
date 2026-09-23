import { store } from "@/lib/data/store";
import { HeroBanner, HeroSlide } from "@/components/HeroBanner";
import { CircularCollections } from "@/components/CircularCollections";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const banners = await store.getHeroBanners(false);
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

  return (
    <main className="w-full min-h-screen bg-white text-neutral-900">
      <HeroBanner initialSlides={slides} />
      <CircularCollections />
    </main>
  );
}
