import { db } from "@/lib/db";
import { HomepageConfig, HeroBanner, AnnouncementConfig, CustomerReview, SeenOnYouVideo } from "@/types";
import { store } from "@/lib/data/store";

export class HomepageService {
  /**
   * Retrieves active homepage configuration.
   */
  async getHomepageConfig(): Promise<HomepageConfig> {
    return store.getHomepageConfig();
  }

  /**
   * Updates homepage configuration.
   */
  async updateHomepageConfig(config: HomepageConfig): Promise<HomepageConfig> {
    return store.updateHomepageConfig(config);
  }

  /**
   * Retrieves active hero banners for the storefront slider.
   */
  async getHeroBanners(publishedOnly = true): Promise<HeroBanner[]> {
    return store.getHeroBanners(!publishedOnly);
  }

  /**
   * Retrieves announcements configuration for the top bar.
   */
  async getAnnouncementsConfig(): Promise<AnnouncementConfig> {
    return store.getAnnouncementsConfig();
  }

  /**
   * Retrieves published customer reviews.
   */
  async getReviews(): Promise<CustomerReview[]> {
    return store.getReviews(true);
  }

  /**
   * Retrieves published Seen On You videos.
   */
  async getSeenOnYou(): Promise<SeenOnYouVideo[]> {
    return store.getSeenOnYou();
  }
}

export const homepageService = new HomepageService();
