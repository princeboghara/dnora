import { AnnouncementConfig, AnnouncementItem } from "@/types";

export const DEFAULT_ANNOUNCEMENT_ITEMS: AnnouncementItem[] = [
  {
    id: "ann-1",
    text: "\"A/W 26\" Collection Is Live — Explore Architectural Silhouettes",
    link: "/shop",
    badge: "New Release",
    is_active: true,
    sort_order: 1,
  },
  {
    id: "ann-2",
    text: "Complimentary Worldwide Express White-Glove Delivery on Orders Over $250",
    link: "/shop",
    badge: "Privilege",
    is_active: true,
    sort_order: 2,
  },
  {
    id: "ann-3",
    text: "Artisan Handcrafted in Florence, Italy • Limited Atelier Batch Production",
    link: "/#editorial",
    badge: "Craftsmanship",
    is_active: true,
    sort_order: 3,
  },
  {
    id: "ann-4",
    text: "Extra 5% Courtesy Privilege on All Prepaid Registrations • Code: DNORA5",
    link: "/shop",
    badge: "Exclusive",
    is_active: true,
    sort_order: 4,
  },
];

export const DEFAULT_ANNOUNCEMENT_CONFIG: AnnouncementConfig = {
  id: "default",
  interval_seconds: 4,
  is_active: true,
  items: DEFAULT_ANNOUNCEMENT_ITEMS,
};
