import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DNORA | Luxury Handbags, Totes, Slings & Accessories",
    template: "%s | DNORA Luxury Essentials",
  },
  description:
    "Discover DNORA: Premium handcrafted handbags, spacious totes, elegant sling bags, satchels, backpacks, and luxury lifestyle accessories. Designed for effortless modern style.",
  keywords: [
    "DNORA",
    "women handbags",
    "tote bags",
    "sling bags",
    "satchel bags",
    "designer handbags India",
    "luxury accessories",
    "DNORA bags",
  ],
  metadataBase: new URL("https://dnora.luxury"),
  openGraph: {
    title: "DNORA | Luxury Handbags, Totes & Accessories",
    description:
      "Premium designer handbags, totes, slings, satchels, and accessories crafted for effortless modern living.",
    url: "https://dnora.luxury",
    siteName: "DNORA",
    locale: "en_IN",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jakarta.variable} antialiased scroll-smooth`}
    >
      <body className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#111111] selection:bg-[#E2CEB2]">
        {children}
      </body>
    </html>
  );
}
