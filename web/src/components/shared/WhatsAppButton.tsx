"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { contactInfo } from "@/config/contact"
import { useI18n } from "@/lib/store/useI18n"

const WhatsAppIcon = () => (
  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

export function WhatsAppButton() {
  const pathname = usePathname()
  const { t } = useI18n()

  // Do not display on seller or admin management screens to prevent cluttering controls
  if (pathname.startsWith("/seller") || pathname.startsWith("/admin")) {
    return null
  }

  const tooltipText = t("contact.chatOnWhatsapp", "Chat with us on WhatsApp")

  return (
    <aside
      aria-label="WhatsApp Support"
      className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 group pointer-events-auto"
    >
      <a
        href={contactInfo.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={tooltipText}
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20BD5A] text-white shadow-[0_6px_20px_rgba(37,211,102,0.4)] hover:shadow-[0_8px_25px_rgba(37,211,102,0.55)] transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
      >
        {/* Subtle breathing ripple */}
        <span
          className="absolute inset-0 rounded-full bg-[#25D366] opacity-30 animate-ping pointer-events-none -z-10"
          style={{ animationDuration: "3s" }}
        />

        <WhatsAppIcon />

        {/* Desktop Tooltip */}
        <span className="hidden sm:block absolute right-full mr-3.5 px-3 py-1.5 rounded-xl bg-brand-gray-900/95 text-white text-xs font-bold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none select-none border border-white/10 backdrop-blur-sm">
          {tooltipText}
          <span className="absolute top-1/2 -right-1 -translate-y-1/2 border-4 border-transparent border-l-brand-gray-900/95" />
        </span>
      </a>
    </aside>
  )
}
