import type { Metadata } from "next";
import "./globals.css";

// Mapped to system fonts for offline compiler builds
const geistSans = { variable: "font-sans" };
const geistMono = { variable: "font-mono" };

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")
      ? process.env.NEXT_PUBLIC_SITE_URL
      : "https://parloora.vercel.app"
  ),
  title: {
    default: "Parloora — Book Your Self Care Services In Seconds",
    template: "%s | Parloora"
  },
  description: "The world's leading marketplace for premium salon services, spa treatments, and beauty products. Discover verified parlours and book instantly in any city.",
  keywords: ["beauty services", "salon booking", "premium spa", "skincare products", "hair styling", "worldwide beauty"],
  authors: [{ name: "Parloora Team" }],
  creator: "Parloora",
  publisher: "Parloora Global",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: "Parloora — Book Your Self Care Services In Seconds",
    description: "Book premium beauty services and shop exclusive products worldwide.",
    url: 'https://parloora.vercel.app',
    siteName: 'Parloora',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'Parloora',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Parloora — Book Your Self Care Services In Seconds',
    description: 'Book premium beauty services and shop exclusive products worldwide.',
    creator: '@parloora',
    images: ['/logo.png'],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Parloora',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: '#4B1E6D',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

import { getThemeSettings } from "@/lib/actions/site";

function hexToRgb(hex: string): string {
  hex = hex.replace(/^#/, '');
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${isNaN(r) ? 75 : r}, ${isNaN(g) ? 30 : g}, ${isNaN(b) ? 109 : b}`;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getThemeSettings();
  
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --primary: ${theme.primary_color};
            --primary-rgb: ${hexToRgb(theme.primary_color)};
            --secondary: ${theme.secondary_color};
            --secondary-rgb: ${hexToRgb(theme.secondary_color)};
            --radius: ${theme.border_radius};
            --font-family: ${theme.font_family}, sans-serif;
          }
          body {
            font-family: var(--font-family) !important;
          }
        `}} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
