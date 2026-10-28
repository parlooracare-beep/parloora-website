"use client"

import * as React from "react"
import { Globe, Check, ChevronDown } from "lucide-react"
import { usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useI18n, LANGUAGES, type Language } from "@/lib/store/useI18n"
import type { Locale } from "@/lib/i18n"

interface LanguageSwitcherProps {
  className?: string
  variant?: "default" | "minimal" | "dark" | "light"
}

export function LanguageSwitcher({ className, variant = "default" }: LanguageSwitcherProps) {
  const { currentLang, setLanguage } = useI18n()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleSelectLanguage = (code: Locale) => {
    if (code === currentLang.code) return

    setLanguage(code)

    // Update URL prefix seamlessly without page refresh or loss of form/booking state
    if (typeof window !== "undefined") {
      const currentQuery = searchParams.toString() ? `?${searchParams.toString()}` : ""
      let newPath = pathname

      // Strip existing locale prefix if any
      if (newPath.startsWith("/en/") || newPath === "/en") {
        newPath = newPath.replace(/^\/en(\/|$)/, "/")
      } else if (newPath.startsWith("/bn/") || newPath === "/bn") {
        newPath = newPath.replace(/^\/bn(\/|$)/, "/")
      }

      // Prepend selected locale if desired, keeping query params
      const localizedUrl = code === "bn"
        ? `/bn${newPath === "/" ? "" : newPath}${currentQuery}`
        : `/en${newPath === "/" ? "" : newPath}${currentQuery}`

      window.history.pushState({}, "", localizedUrl)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Language selector: currently ${currentLang.nativeName}`}
          className={cn(
            "h-9 px-3 gap-2 rounded-full font-bold text-xs transition-all border outline-none select-none",
            variant === "dark"
              ? "text-white/80 hover:text-white hover:bg-white/10 border-white/15 bg-white/5"
              : "text-brand-gray-700 hover:text-primary transition-all hover:bg-primary/5 border-brand-gray-200 bg-white shadow-xs",
            className
          )}
        >
          <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="font-bold tracking-wide">{currentLang.nativeName}</span>
          <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-44 p-1.5 rounded-2xl border-brand-gray-100 shadow-xl bg-white z-50 animate-in fade-in-50 zoom-in-95 duration-150"
      >
        <LanguageItems currentLang={currentLang} onSelect={handleSelectLanguage} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function LanguageItems({
  currentLang,
  onSelect,
}: {
  currentLang: Language
  onSelect: (langCode: Locale) => void
}) {
  return (
    <div role="menu" aria-label="Available languages">
      <div className="px-3 py-1.5 mb-1 text-[10px] font-black uppercase text-brand-gray-400 tracking-wider">
        Select Language / ভাষা
      </div>
      {LANGUAGES.map((lang) => {
        const isSelected = currentLang.code === lang.code
        return (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => onSelect(lang.code)}
            className={cn(
              "flex items-center justify-between rounded-xl cursor-pointer px-3 py-2 text-xs font-semibold transition-all mb-0.5",
              isSelected
                ? "bg-primary/10 text-primary font-bold"
                : "text-brand-gray-700 hover:bg-brand-gray-50 hover:text-brand-gray-900"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">{lang.flag}</span>
              <div className="flex flex-col text-left">
                <span className="leading-tight">{lang.nativeName}</span>
                <span className="text-[10px] text-brand-gray-400 font-normal">{lang.name}</span>
              </div>
            </div>
            {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
          </DropdownMenuItem>
        )
      })}
    </div>
  )
}
