"use client"

import * as React from "react"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Sparkles, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getFooterSettings, FooterSettings } from "@/lib/actions/site"

// Inline SVG social icons (lucide-react may not have these)
const FacebookIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)
const InstagramIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
)
const TwitterIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)
const YoutubeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)

export function Footer() {
  const [settings, setSettings] = React.useState<FooterSettings | null>(null)

  React.useEffect(() => {
    async function fetchSettings() {
      const data = await getFooterSettings()
      setSettings(data)
    }
    fetchSettings()
  }, [])

  const currentYear = new Date().getFullYear()

  const {
    about_text = "Your premium destination for beauty and wellness services. Book appointments with top parlours in your area instantly.",
    address = "123 Beauty Avenue, Style District, Dhaka, Bangladesh",
    phone = "+880 1234 567 890",
    email = "support@parloora.com",
    facebook_url = "#",
    instagram_url = "#",
    twitter_url = "#",
    youtube_url = "#"
  } = settings || {}

  return (
    <footer className="bg-brand-gray-900 pt-12 md:pt-24 pb-8 md:pb-12 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -ml-48 -mt-48" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] -mr-32 -mb-32" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-10 md:mb-20">
          {/* Brand & Description */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="Parloora Logo" width={48} height={48} className="rounded-2xl object-contain shadow-2xl" />
              <span className="text-2xl font-black tracking-tighter text-white">
                Parloora
              </span>
            </Link>
            <p className="text-brand-gray-400 text-sm leading-relaxed font-medium">
              {about_text}
            </p>
            <div className="flex items-center gap-5 pt-2">
              {[
                { icon: <FacebookIcon />, url: facebook_url, label: "Facebook" },
                { icon: <InstagramIcon />, url: instagram_url, label: "Instagram" },
                { icon: <TwitterIcon />, url: twitter_url, label: "Twitter" },
                { icon: <YoutubeIcon />, url: youtube_url, label: "YouTube" }
              ].map((social) => (
                <a 
                  key={social.label}
                  href={social.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-gray-400 hover:text-white hover:bg-primary transition-all duration-300 hover:scale-110 active:scale-95"
                >
                  {social.icon}
                  <span className="sr-only">{social.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-black text-white uppercase tracking-widest text-xs mb-4 md:mb-8">Quick Links</h3>
            <ul className="space-y-4">
              {[
                { name: "About Us", href: "/about" },
                { name: "Find a Parlour", href: "/parlours" },
                { name: "All Services", href: "/parlours" },
                { name: "Special Offers", href: "/parlours" },
                { name: "Beauty Blog", href: "/blog" }
              ].map(item => (
                <li key={item.name}>
                  <Link href={item.href} className="text-brand-gray-400 hover:text-secondary text-sm font-bold transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary/0 group-hover:bg-secondary transition-all" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Partners */}
          <div>
            <h3 className="font-black text-white uppercase tracking-widest text-xs mb-4 md:mb-8">For Partners</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/signup?role=seller" className="text-brand-gray-400 hover:text-secondary text-sm font-bold transition-colors">
                  Register your Parlour
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-brand-gray-400 hover:text-secondary text-sm font-bold transition-colors">
                  Seller Login
                </Link>
              </li>
              <li>
                <Link href="/seller/pricing" className="text-brand-gray-400 hover:text-secondary text-sm font-bold transition-colors">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link href="/seller/resources" className="text-brand-gray-400 hover:text-secondary text-sm font-bold transition-colors">
                  Partner Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-black text-white uppercase tracking-widest text-xs mb-4 md:mb-8">Contact Us</h3>
            <ul className="space-y-5">
              <li className="flex items-start gap-4 text-sm text-brand-gray-400 font-medium">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-secondary" />
                </div>
                <span>{address}</span>
              </li>
              <li className="flex items-center gap-4 text-sm text-brand-gray-400 font-medium">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-secondary" />
                </div>
                <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:text-white transition-colors">{phone}</a>
              </li>
              <li className="flex items-center gap-4 text-sm text-brand-gray-400 font-medium">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-secondary" />
                </div>
                <a href={`mailto:${email}`} className="hover:text-white transition-colors">{email}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 md:pt-10 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
          <p className="text-xs text-brand-gray-500 font-bold uppercase tracking-widest text-center md:text-left">
            &copy; {currentYear} Parloora Platform. Engineered for Beauty.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(item => (
              <Link key={item} href={`/${item.toLowerCase().replace(/\s+/g, "-")}`} className="text-[10px] font-black uppercase tracking-widest text-brand-gray-500 hover:text-white transition-colors">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
