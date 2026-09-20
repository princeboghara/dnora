import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { NavigationLoadingProvider } from "@/components/ui/NavigationLoadingProvider";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#0E0E0E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "DNORA | Luxury Handbags & Modern Leather Goods",
    template: "%s | DNORA",
  },
  description:
    "Discover DNORA: Architectural silhouettes, meticulous artisan craft, and timeless modern women's handbags, totes, and purses. Designed for discerning taste.",
  keywords: [
    "DNORA",
    "luxury handbags",
    "designer purses",
    "modern leather goods",
    "women's luxury bags",
    "tote bags",
    "crossbody bags",
    "shoulder bags",
  ],
  authors: [{ name: "DNORA Luxury House" }],
  creator: "DNORA",
  publisher: "DNORA",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "DNORA | Luxury Handbags & Modern Leather Goods",
    description:
      "Architectural silhouettes, meticulous craft, and modern luxury handbags.",
    url: "https://dnora.luxury",
    siteName: "DNORA",
    images: [
      {
        url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85",
        width: 1200,
        height: 630,
        alt: "DNORA Luxury Handbag Collection",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DNORA | Modern Luxury Handbags",
    description:
      "Architectural silhouettes, meticulous artisan craft, and modern women's handbags.",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85",
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${plusJakarta.variable} ${inter.variable} h-full`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Cinzel:wght@400..900&family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:ital,wght@0,400..900;1,400..900&family=Italiana&family=Lora:ital,wght@0,400..700;1,400..700&family=Marcellus&family=Montserrat:wght@400;600;700;800&family=Oswald:wght@500;600;700&family=Outfit:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Prata&family=Space+Grotesk:wght@400..700&family=Syne:wght@500;700;800&family=Tenor+Sans&family=Urbanist:ital,wght@0,400..900;1,400..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans bg-white text-[#0E0E0E] antialiased selection:bg-[#0E0E0E] selection:text-white">
        <NavigationLoadingProvider>
          {children}
        </NavigationLoadingProvider>
      </body>
    </html>
  );
}
