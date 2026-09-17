import { SidebarMenuItem } from "@/types";

export const DEFAULT_STOREFRONT_NAVIGATION: SidebarMenuItem[] = [
  {
    id: "sf-home",
    label: "Home",
    href: "/",
    icon: "Globe",
    is_active: true,
  },
  {
    id: "sf-shop",
    label: "Handbag Collections",
    href: "/shop",
    icon: "ShoppingBag",
    is_active: true,
    submenus: [
      { id: "sf-sub-all", label: "Explore All Handbags", href: "/shop" },
      { id: "sf-sub-bestsellers", label: "Best Sellers", href: "/#best-sellers", badge: "Hot" },
      { id: "sf-sub-new", label: "New Arrivals", href: "/#new-arrivals", badge: "New" },
      { id: "sf-sub-categories", label: "Featured Categories", href: "/#categories" },
    ],
  },
  {
    id: "sf-categories",
    label: "Categories",
    href: "/#categories",
    icon: "Box",
    is_active: true,
    submenus: [
      { id: "sf-cat-tote", label: "Tote Bags", href: "/shop?category=Tote" },
      { id: "sf-cat-shoulder", label: "Shoulder Bags", href: "/shop?category=Shoulder" },
      { id: "sf-cat-crossbody", label: "Crossbody Bags", href: "/shop?category=Crossbody" },
      { id: "sf-cat-clutch", label: "Evening Clutches", href: "/shop?category=Clutch" },
    ],
  },
  {
    id: "sf-account",
    label: "Member Privé Portal",
    href: "/account",
    icon: "User",
    badge: "Privé",
    is_active: true,
    submenus: [
      { id: "sf-sub-orders", label: "Orders & Tracking", href: "/account" },
      { id: "sf-sub-addresses", label: "Delivery Addresses", href: "/account" },
      { id: "sf-sub-profile", label: "Client Profile", href: "/account" },
    ],
  },
  {
    id: "sf-editorial",
    label: "The Maison Story",
    href: "/#editorial",
    icon: "Sparkles",
    is_active: true,
  },
];

export const DEFAULT_ACCOUNT_NAVIGATION: SidebarMenuItem[] = [
  {
    id: "acc-orders",
    label: "Orders & Tracking",
    href: "/account?tab=orders",
    icon: "Package",
    is_active: true,
    submenus: [
      { id: "acc-sub-orders-all", label: "All Purchases", href: "/account?tab=orders" },
      { id: "acc-sub-orders-track", label: "Live Delivery Tracking", href: "/account?tab=orders" },
    ],
  },
  {
    id: "acc-addresses",
    label: "Saved Addresses",
    href: "/account?tab=addresses",
    icon: "MapPin",
    is_active: true,
  },
  {
    id: "acc-profile",
    label: "Client Profile",
    href: "/account?tab=profile",
    icon: "User",
    is_active: true,
  },
  {
    id: "acc-concierge",
    label: "VIP Concierge & Support",
    href: "mailto:concierge@dnora.luxury",
    icon: "Sparkles",
    badge: "24/7",
    is_active: true,
  },
];
