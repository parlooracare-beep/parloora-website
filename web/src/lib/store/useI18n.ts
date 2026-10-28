import { create } from "zustand"
import { persist } from "zustand/middleware"
import {
  type Locale,
  type LanguageConfig,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  translate,
  formatCurrency as formatCurrencyHelper,
  formatDate as formatDateHelper,
  formatTime as formatTimeHelper,
  formatNumber as formatNumberHelper,
} from "@/lib/i18n"
import { createClient } from "@/lib/supabase/client"

export type { LanguageConfig as Language }
export const LANGUAGES = SUPPORTED_LOCALES

interface I18nStore {
  currentLang: LanguageConfig
  locale: Locale
  setLanguage: (code: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
  formatCurrency: (amount: number | string, currency?: string) => string
  formatDate: (date: string | Date, options?: Intl.DateTimeFormatOptions) => string
  formatTime: (timeStr: string) => string
  formatNumber: (num: number | string) => string
}

function syncDocumentLang(code: Locale) {
  if (typeof document !== "undefined") {
    document.documentElement.lang = code
    document.documentElement.dir = "ltr"
  }
  if (typeof document !== "undefined") {
    // Set 1-year persistent cookie for SSR and Edge middleware
    document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000; SameSite=Lax`
  }
}

export const useI18n = create<I18nStore>()(
  persist(
    (set, get) => ({
      currentLang: SUPPORTED_LOCALES[0],
      locale: DEFAULT_LOCALE,

      setLanguage: (code) => {
        const lang = SUPPORTED_LOCALES.find((l) => l.code === code) || SUPPORTED_LOCALES[0]
        set({ currentLang: lang, locale: lang.code })

        syncDocumentLang(lang.code)

        // Asynchronously persist to Supabase if authenticated (account-level preference)
        try {
          const supabase = createClient()
          supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
              supabase.auth.updateUser({
                data: { preferred_language: code },
              }).catch(() => {})
            }
          }).catch(() => {})
        } catch {
          // Graceful fallback
        }
      },

      t: (key, params) => {
        const langCode = get().currentLang.code || DEFAULT_LOCALE
        return translate(langCode, key, params)
      },

      formatCurrency: (amount, currency = "BDT") => {
        const langCode = get().currentLang.code || DEFAULT_LOCALE
        return formatCurrencyHelper(amount, langCode, currency)
      },

      formatDate: (date, options) => {
        const langCode = get().currentLang.code || DEFAULT_LOCALE
        return formatDateHelper(date, langCode, options)
      },

      formatTime: (timeStr) => {
        const langCode = get().currentLang.code || DEFAULT_LOCALE
        return formatTimeHelper(timeStr, langCode)
      },

      formatNumber: (num) => {
        const langCode = get().currentLang.code || DEFAULT_LOCALE
        return formatNumberHelper(num, langCode)
      },
    }),
    {
      name: "parloora-i18n-storage",
      onRehydrateStorage: () => (state) => {
        if (state && typeof document !== "undefined") {
          syncDocumentLang(state.currentLang.code)
        }
      },
    }
  )
)
