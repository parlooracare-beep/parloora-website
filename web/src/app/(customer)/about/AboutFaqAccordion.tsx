"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

export interface FaqItem {
  id: string
  question: string
  answer: string
}

interface AboutFaqAccordionProps {
  items: FaqItem[]
}

export function AboutFaqAccordion({ items }: AboutFaqAccordionProps) {
  const [openId, setOpenId] = React.useState<string | null>(items[0]?.id || null)

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {items.map((item, index) => {
        const isOpen = openId === item.id
        const headingId = `faq-heading-${item.id}`
        const panelId = `faq-panel-${item.id}`

        return (
          <div
            key={item.id}
            className={`rounded-2xl transition-all duration-300 border ${
              isOpen
                ? "bg-white shadow-lg shadow-[#5A189A]/5 border-[#5A189A]/30"
                : "bg-white/80 hover:bg-white border-[#E0AFA0]/30 shadow-sm"
            }`}
          >
            <h3>
              <button
                id={headingId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggleItem(item.id)}
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-bold text-base sm:text-lg text-[#2B2B2B] hover:text-[#5A189A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5A189A] focus-visible:ring-offset-2 rounded-2xl cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#5A189A]/10 text-[#5A189A] text-xs font-black shrink-0">
                    {index + 1}
                  </span>
                  <span>{item.question}</span>
                </span>
                <span
                  className={`flex items-center justify-center w-8 h-8 rounded-full transition-transform duration-300 shrink-0 ${
                    isOpen
                      ? "rotate-180 bg-[#5A189A] text-white"
                      : "bg-[#FAF9F6] text-[#2B2B2B]/60"
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headingId}
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-6 pb-6 pt-1 text-[#2B2B2B]/80 leading-relaxed text-sm sm:text-base border-t border-[#FAF9F6]">
                  {item.answer}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
