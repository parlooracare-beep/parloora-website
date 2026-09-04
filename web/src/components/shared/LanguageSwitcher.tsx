"use client"

import * as React from "react"
import { Globe, Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

import { useI18n, LANGUAGES } from "@/lib/store/useI18n"

export function LanguageSwitcher() {
  const { currentLang, setLanguage } = useI18n()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 px-3 gap-2 rounded-full text-brand-gray-600 hover:text-primary transition-all hover:bg-primary/5 border border-brand-gray-100 bg-white">
          <Globe className="w-4 h-4" />
          <span className="text-xs font-bold uppercase">{currentLang.code}</span>
          <ChevronDown className="w-3 h-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl border-brand-gray-100 shadow-2xl bg-white z-50">
        <LanguageItems currentLang={currentLang} onSelect={setLanguage} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function LanguageItems({ currentLang, onSelect }: { currentLang: any, onSelect: (langCode: any) => void }) {
  return (
    <>
      <div className="px-2 py-1.5 mb-1 text-[10px] font-black uppercase text-brand-gray-400 tracking-widest">
        Select Language
      </div>
      {LANGUAGES.map((lang) => (
        <DropdownMenuItem
          key={lang.code}
          onClick={() => onSelect(lang.code)}
          className={cn(
            "flex items-center justify-between rounded-xl cursor-pointer px-3 py-2 text-sm transition-all",
            currentLang.code === lang.code ? "bg-primary/10 text-primary font-bold" : "hover:bg-brand-gray-50"
          )}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">{lang.flag}</span>
            <span>{lang.name}</span>
          </div>
          {currentLang.code === lang.code && <Check className="w-4 h-4" />}
        </DropdownMenuItem>
      ))}
    </>
  )
}
