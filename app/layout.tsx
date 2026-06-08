import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Artisan Root | Cultivating Creative Spaces",
    template: "%s | Artisan Root"
  },
  description:
    "Shop macrame decor, handmade wall hangings, plant hangers, and handcraft pieces from Artisan Root.",
  applicationName: "Artisan Root",
  authors: [{ name: "Artisan Root" }],
  creator: "Artisan Root",
  publisher: "Artisan Root",
  keywords: [
    "macrame",
    "handcraft",
    "handmade decor",
    "plant hangers",
    "wall hangings",
    "artisan home decor"
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Artisan Root",
    title: "Artisan Root | Cultivating Creative Spaces",
    description:
      "Thoughtfully crafted macrame and handcraft pieces for warm, creative spaces."
  },
  twitter: {
    card: "summary_large_image",
    title: "Artisan Root | Cultivating Creative Spaces",
    description:
      "Thoughtfully crafted macrame and handcraft pieces for warm, creative spaces."
  },
  robots: {
    index: true,
    follow: true
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f9f3ec"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only z-[200] rounded-full bg-artisan-terracotta px-4 py-2 font-black text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to main content
        </a>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
