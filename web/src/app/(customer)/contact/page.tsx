import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"
import { ContactContent } from "./ContactContent"

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  title: "Contact Us | Customer Care & WhatsApp Support",
  description:
    "Official contact information for Parloora. Reach customer care and WhatsApp support at 01884599271. Office located in Dhaka, Bangladesh.",
  alternates: {
    canonical: `${siteUrl}/contact`,
    languages: {
      "en": `${siteUrl}/contact`,
      "bn": `${siteUrl}/bn/contact`,
      "x-default": `${siteUrl}/contact`,
    },
  },
  openGraph: {
    title: "Contact Parloora — Customer Care & WhatsApp Support",
    description:
      "Call or message Parloora Customer Care at 01884599271. Office located in Dhaka, Bangladesh. Book your self-care services in seconds.",
    url: `${siteUrl}/contact`,
    type: "website",
    siteName: "Parloora",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Parloora — Customer Care & WhatsApp Support",
    description: "Official contact channels: 01884599271 | Dhaka, Bangladesh",
  },
}

export default function ContactPage() {
  return <ContactContent />
}
