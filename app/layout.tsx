import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

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
        url: "https://res.cloudinary.com/izdmpa4z/image/upload/v1789649479/dnora/heroes/autumn-winter-couture-1.jpg",
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
      "https://res.cloudinary.com/izdmpa4z/image/upload/v1789649479/dnora/heroes/autumn-winter-couture-1.jpg",
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
    <html lang="en" className={`${plusJakarta.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans bg-white text-[#0E0E0E] antialiased selection:bg-[#0E0E0E] selection:text-white">
        {children}
      </body>
    </html>
  );
}
