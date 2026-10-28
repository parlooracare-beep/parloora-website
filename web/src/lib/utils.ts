import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import { useI18n } from "./store/useI18n"

export function formatCurrency(amount: number | string, currency: string = "BDT", locale?: string) {
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return "";

  let activeLocale = locale;
  try {
    const state = useI18n.getState();
    if (state && !activeLocale) {
      activeLocale = state.currentLang.code === "bn" ? "bn-BD" : "en-BD";
    }
  } catch {
    // SSR fallback
  }

  if (!activeLocale) activeLocale = "en-BD";

  const formattedAmount = new Intl.NumberFormat(activeLocale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericAmount);

  // Normalize BDT to standard ৳
  return formattedAmount.replace("BDT", "৳").trim();
}

export function formatDate(date: string | Date, locale?: string, options?: Intl.DateTimeFormatOptions) {
  let activeLocale = locale;
  try {
    const state = useI18n.getState();
    if (state && !activeLocale) {
      activeLocale = state.currentLang.code === "bn" ? "bn-BD" : "en-US";
    }
  } catch {
    // SSR fallback
  }
  if (!activeLocale) activeLocale = "en-US";

  return new Intl.DateTimeFormat(activeLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  }).format(new Date(date))
}

export function formatParlourName(name: string) {
  if (!name) return "";
  
  // Regex to match email addresses
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  
  return name.replace(emailRegex, (match) => {
    const prefix = match.split("@")[0];
    // Capitalize first letter
    return prefix.charAt(0).toUpperCase() + prefix.slice(1);
  });
}
