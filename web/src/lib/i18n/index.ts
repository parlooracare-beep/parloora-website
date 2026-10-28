import enMessages from "@/messages/en.json"
import bnMessages from "@/messages/bn.json"

export type Locale = "en" | "bn"

export interface LanguageConfig {
  code: Locale
  name: string
  nativeName: string
  flag: string
  currency: "BDT"
  locale: string
  rate: number
}

export const SUPPORTED_LOCALES: LanguageConfig[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇬🇧",
    currency: "BDT",
    locale: "en-BD",
    rate: 1.0,
  },
  {
    code: "bn",
    name: "Bangla",
    nativeName: "বাংলা",
    flag: "🇧🇩",
    currency: "BDT",
    locale: "bn-BD",
    rate: 1.0,
  },
]

export const DEFAULT_LOCALE: Locale = "en"

export const dictionaries = {
  en: enMessages,
  bn: bnMessages,
}

// Flat mapping for backwards-compatibility with existing legacy string keys
const legacyKeyMap: Record<string, Record<Locale, string>> = {
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
  "Add to Cart": { en: "Add to Cart", bn: "কার্টে যোগ করুন" },
  "Buy Now": { en: "Buy Now", bn: "এখনই কিনুন" },
  "Book Now": { en: "Book Now", bn: "এখনই বুক করুন" },
  "Select Staff": { en: "Select Staff", bn: "স্টাফ নির্বাচন করুন" },
  "Select Date & Time": { en: "Select Date & Time", bn: "তারিখ ও সময় নির্বাচন করুন" },
  "Payment Method": { en: "Payment Method", bn: "পেমেন্ট পদ্ধতি" },
  "Pay at Salon": { en: "Pay at Salon", bn: "পার্লারে পেমেন্ট" },
  "Pay Online (Stripe)": { en: "Pay Online (Stripe)", bn: "অনলাইন পেমেন্ট" },
  "Processing...": { en: "Processing...", bn: "প্রসেসিং..." },
  "Confirm Appointment": { en: "Confirm Appointment", bn: "অ্যাপয়েন্টমেন্ট নিশ্চিত করুন" },
  "Save All Changes": { en: "Save All Changes", bn: "সব পরিবর্তন সংরক্ষণ করুন" },
  "Skincare": { en: "Skincare", bn: "স্কিনকেয়ার" },
  "Haircare": { en: "Haircare", bn: "হেয়ারকেয়ার" },
  "Makeup": { en: "Makeup", bn: "মেকআপ" },
  "Fragrance": { en: "Fragrance", bn: "সুগন্ধি" },
  "Tools": { en: "Tools", bn: "টুলস" },
  "All": { en: "All", bn: "সব" },
}

/**
 * Resolves a nested key (e.g. "booking.confirmBooking") or legacy flat key
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveKey(obj: any, path: string): string | undefined {
  if (!obj || typeof obj !== "object") return undefined
  const parts = path.split(".")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = obj
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part]
    } else {
      return undefined
    }
  }
  return typeof current === "string" ? current : undefined
}

export function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>
): string {
  // 1. Try dot-path in target locale
  let result = resolveKey(dictionaries[locale], key)

  // 2. Fallback to English if target is Bangla and key was missing
  if (!result && locale !== "en") {
    result = resolveKey(dictionaries.en, key)
  }

  // 3. Fallback to legacy flat mapping
  if (!result && legacyKeyMap[key]) {
    result = legacyKeyMap[key][locale] || legacyKeyMap[key].en
  }

  // 4. Ultimate fallback to the key itself
  if (!result) {
    result = key
  }

  // 5. Interpolate {param} variables
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      result = result.replace(new RegExp(`{${k}}`, "g"), String(v))
    }
  }

  return result
}

// ─── Locale-aware Formatting Helpers ─────────────────────────────────────────

const BENGALI_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]
const ENGLISH_DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]

export function toBengaliDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => BENGALI_DIGITS[parseInt(d, 10)] ?? d)
}

export function toEnglishDigits(input: string): string {
  return input.replace(/[০-৯]/g, (d) => {
    const idx = BENGALI_DIGITS.indexOf(d)
    return idx !== -1 ? ENGLISH_DIGITS[idx] : d
  })
}

export function formatCurrency(
  amount: number | string,
  locale: Locale = "en",
  currency: string = "BDT"
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  if (isNaN(num)) return ""

  const intlLocale = locale === "bn" ? "bn-BD" : "en-BD"
  const formatted = new Intl.NumberFormat(intlLocale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)

  // Replace "BDT" with standard "৳" symbol for Bangladeshi aesthetics
  return formatted.replace("BDT", "৳").trim()
}

export function formatDate(
  date: string | Date,
  locale: Locale = "en",
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" ? new Date(date) : date
  if (isNaN(d.getTime())) return ""

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  }

  const intlLocale = locale === "bn" ? "bn-BD" : "en-US"
  return new Intl.DateTimeFormat(intlLocale, defaultOptions).format(d)
}

export function formatTime(timeStr: string, locale: Locale = "en"): string {
  if (!timeStr) return ""
  if (locale !== "bn") return timeStr

  // In Bangla mode, convert digits to Bengali digits e.g. "10:00 AM" -> "১০:০০ AM"
  return toBengaliDigits(timeStr)
}

export function formatNumber(num: number | string, locale: Locale = "en"): string {
  const val = typeof num === "string" ? parseFloat(num) : num
  if (isNaN(val)) return ""
  const intlLocale = locale === "bn" ? "bn-BD" : "en-US"
  return new Intl.NumberFormat(intlLocale).format(val)
}
