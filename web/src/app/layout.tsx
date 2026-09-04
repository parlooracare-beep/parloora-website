import type { Metadata } from "next";
import "./globals.css";

// Mapped to system fonts for offline compiler builds
const geistSans = { variable: "font-sans" };
const geistMono = { variable: "font-mono" };

export const metadata: Metadata = {
  title: {
    default: "Parloora | Global Premium Beauty & Salon Marketplace",
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
  openGraph: {
    title: "Parloora | Global Beauty Marketplace",
    description: "Book premium beauty services and shop exclusive products worldwide.",
    url: 'https://parloora.com',
    siteName: 'Parloora',
    images: [
      {
        url: 'https://parloora.com/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Parloora | Global Beauty Marketplace',
    description: 'Book premium beauty services and shop exclusive products worldwide.',
    creator: '@parloora',
    images: ['https://parloora.com/twitter-image.jpg'],
  },
  alternates: {
    canonical: 'https://parloora.com',
    languages: {
      'en-US': 'https://parloora.com/en-us',
      'ar-SA': 'https://parloora.com/ar-sa',
      'bn-BD': 'https://parloora.com/bn-bd',
    },
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
