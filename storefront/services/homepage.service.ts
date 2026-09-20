import { db } from "@/lib/db";
import { HomepageConfig, HeroBanner, AnnouncementConfig, CustomerReview, SeenOnYouVideo } from "@/types";
import { DEFAULT_ANNOUNCEMENT_CONFIG } from "@/lib/data/default-announcements";

export class HomepageService {
  /**
   * Retrieves active homepage configuration.
   */
  async getHomepageConfig(): Promise<HomepageConfig> {
    const defaultConfig: HomepageConfig = {
      topbar: {
        enabled: true,
        text: "COMPLIMENTARY ATELIER SHIPPING ACROSS INDIA • DISPATCHED WITHIN 48 HOURS",
        link: "/shop",
      },
      hero: {
        enabled: true,
      },
      categories: {
        enabled: true,
        title: "CATEGORIES",
      },
      best_sellers: {
        enabled: true,
        title: "BEST SELLERS",
        view_all_link: "/shop?best_seller=true",
      },
      new_in: {
        enabled: true,
        title: "NEW IN",
        view_all_link: "/shop?new_arrival=true",
      },
      middle_banner: {
        enabled: true,
        eyebrow: "Atelier Edition • Florence",
        title: "ARCHITECTURAL LEATHER",
        description: "Sculpted with uncompromising discipline. Cut from certified full-grain Tuscan calfskin and finished with bespoke satin metal hardware.",
        button_text: "DISCOVER THE ATELIER",
        button_link: "/shop",
        image_url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1800&q=85",
      },
      seen_on_you: {
        enabled: true,
        title: "SEEN ON YOU",
      },
      customer_reviews: {
        enabled: true,
        title: "CUSTOMER REVIEWS",
      },
      footer: {
        enabled: true,
        brand_subtitle: "Artisan Handbags • Florence • New York",
        story_text: "Architectural silhouettes, meticulous artisan leatherwork, and timeless aesthetics designed for the modern woman. Handcrafted with bespoke calfskin and precision hardware.",
        headquarters: "Atelier Headquarters: Via de' Tornabuoni, Florence • Soho, New York",
        instagram_url: "https://instagram.com/dnoralifestyle",
        facebook_url: "https://facebook.com/dnoralifestyle",
        pinterest_url: "https://pinterest.com/dnoralifestyle",
      },
    };

    try {
      const res = await db.query("SELECT config FROM public.homepage_config WHERE id = 'default' LIMIT 1");
      if (res.rows[0]?.config) {
        return {
          ...defaultConfig,
          ...res.rows[0].config,
        };
      }
      return defaultConfig;
    } catch {
      return defaultConfig;
    }
  }

  /**
   * Updates homepage configuration.
   */
  async updateHomepageConfig(config: HomepageConfig): Promise<HomepageConfig> {
    const current = await this.getHomepageConfig();
    const merged = { ...current, ...config };
    await db.query(
      `INSERT INTO public.homepage_config (id, config, updated_at)
       VALUES ('default', $1, NOW())
       ON CONFLICT (id) DO UPDATE SET config = $1, updated_at = NOW()`,
      [JSON.stringify(merged)]
    );
    return merged;
  }

  /**
   * Retrieves active hero banners for the storefront slider.
   */
  async getHeroBanners(publishedOnly = true): Promise<HeroBanner[]> {
    try {
      const where = publishedOnly ? "WHERE is_published = true" : "";
      const result = await db.query(`SELECT * FROM public.hero_banners ${where} ORDER BY sort_order ASC, created_at DESC`);
      return result.rows as HeroBanner[];
    } catch {
      return [];
    }
  }

  /**
   * Retrieves announcements configuration for the top bar.
   */
  async getAnnouncementsConfig(): Promise<AnnouncementConfig> {
    try {
      const res = await db.query(
        "SELECT config FROM public.site_configurations WHERE key = 'announcements_config' LIMIT 1"
      );
      if (res.rows[0]?.config) {
        return res.rows[0].config as AnnouncementConfig;
      }
      return DEFAULT_ANNOUNCEMENT_CONFIG;
    } catch {
      return DEFAULT_ANNOUNCEMENT_CONFIG;
    }
  }

  /**
   * Retrieves published customer reviews.
   */
  async getReviews(): Promise<CustomerReview[]> {
    try {
      const result = await db.query(
        "SELECT * FROM public.customer_reviews WHERE is_published = true ORDER BY is_featured DESC, sort_order ASC, created_at DESC"
      );
      return result.rows as CustomerReview[];
    } catch {
      return [];
    }
  }

  /**
   * Retrieves published Seen On You videos.
   */
  async getSeenOnYou(): Promise<SeenOnYouVideo[]> {
    try {
      const result = await db.query(
        "SELECT * FROM public.seen_on_you WHERE is_published = true ORDER BY is_featured DESC, sort_order ASC, created_at DESC"
      );
      return result.rows as SeenOnYouVideo[];
    } catch {
      return [];
    }
  }
}

export const homepageService = new HomepageService();
