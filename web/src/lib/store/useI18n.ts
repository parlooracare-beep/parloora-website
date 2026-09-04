import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Language {
  code: "en" | "bn"
  name: string
  flag: string
  currency: "BDT"
  locale: string
  rate: number // exchange rate from BDT to this currency
}

export const LANGUAGES: Language[] = [
  { code: "en", name: "English", flag: "🇺🇸", currency: "BDT", locale: "en-BD", rate: 1.0 },
  { code: "bn", name: "বাংলা", flag: "🇧🇩", currency: "BDT", locale: "bn-BD", rate: 1.0 },
]

interface I18nStore {
  currentLang: Language
  setLanguage: (code: "en" | "bn") => void
  t: (key: string) => string
}

const translations: Record<string, Record<"en" | "bn", string>> = {
  // Navigation
  "Home": { en: "Home", bn: "হোম" },
  "Parlours": { en: "Parlours", bn: "পার্লারসমূহ" },
  "Shop": { en: "Shop", bn: "শপ" },
  "Wishlist": { en: "Wishlist", bn: "উইশলিস্ট" },
  "My Bookings": { en: "My Bookings", bn: "আমার বুকিং" },
  "Log in": { en: "Log in", bn: "লগ ইন" },
  "Sign up": { en: "Sign up", bn: "সাইন আপ" },
  "Sign Out": { en: "Sign Out", bn: "সাইন আউট" },
  "Search parlours or services...": { en: "Search parlours or services...", bn: "পার্লার বা সেবা খুঁজুন..." },
  "Your Cart": { en: "Your Cart", bn: "আপনার কার্ট" },
  "items": { en: "items", bn: "টি পণ্য" },
  "Your cart is empty": { en: "Your cart is empty", bn: "আপনার কার্ট খালি" },
  "Continue Shopping": { en: "Continue Shopping", bn: "শপিং চালিয়ে যান" },
  "Subtotal": { en: "Subtotal", bn: "সাবটোটাল" },
  "Proceed to Checkout": { en: "Proceed to Checkout", bn: "চেকআউট করুন" },

  // Buttons & Common Actions
  "Add to Cart": { en: "Add to Cart", bn: "কার্টে যোগ করুন" },
  "Buy Now": { en: "Buy Now", bn: "এখনই কিনুন" },
  "Book Now": { en: "Book Now", bn: "বুক করুন" },
  "Select Staff": { en: "Select Staff", bn: "স্টাফ নির্বাচন করুন" },
  "Select Date & Time": { en: "Select Date & Time", bn: "তারিখ ও সময়" },
  "Payment Method": { en: "Payment Method", bn: "পেমেন্ট পদ্ধতি" },
  "Pay at Salon": { en: "Pay at Salon", bn: "সালনে পেমেন্ট" },
  "Pay Online (Stripe)": { en: "Pay Online (Stripe)", bn: "অনলাইন পেমেন্ট" },
  "Processing...": { en: "Processing...", bn: "প্রসেসিং..." },
  "Confirm Appointment": { en: "Confirm Appointment", bn: "অ্যাপয়েন্টমেন্ট নিশ্চিত করুন" },
  "Save All Changes": { en: "Save All Changes", bn: "সব পরিবর্তন সংরক্ষণ করুন" },

  // Sections
  "Skincare": { en: "Skincare", bn: "স্কিনকেয়ার" },
  "Haircare": { en: "Haircare", bn: "হেয়ারকেয়ার" },
  "Makeup": { en: "Makeup", bn: "মেকআপ" },
  "Fragrance": { en: "Fragrance", bn: "সুগন্ধি" },
  "Tools": { en: "Tools", bn: "টুলস" },
  "All": { en: "All", bn: "সব" },
}

export const useI18n = create<I18nStore>()(
  persist(
    (set, get) => ({
      currentLang: LANGUAGES[0],
      setLanguage: (code) => {
        const lang = LANGUAGES.find((l) => l.code === code) || LANGUAGES[0]
        set({ currentLang: lang })
        
        // Update document dir for RTL Arabic support
        if (typeof document !== "undefined") {
          document.documentElement.dir = "ltr"
          document.documentElement.lang = code
        }
      },
      t: (key) => {
        const lang = get().currentLang.code
        return translations[key]?.[lang] || key
      },
    }),
    {
      name: "parloora-i18n-storage",
      onRehydrateStorage: () => (state) => {
        // Set initial HTML dir on load
        if (state && typeof document !== "undefined") {
          document.documentElement.dir = "ltr"
          document.documentElement.lang = state.currentLang.code
        }
      }
    }
  )
)
