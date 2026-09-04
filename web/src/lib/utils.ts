import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import { useI18n } from "./store/useI18n"

export function formatCurrency(amount: number | string, currency?: string, locale?: string) {
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return "";
  
  let selectedCurrency = currency;
  let selectedLocale = locale;
  let rate = 1.0;
  
  try {
    const state = useI18n.getState();
    if (state && state.currentLang) {
      if (!selectedCurrency) selectedCurrency = state.currentLang.currency;
      if (!selectedLocale) selectedLocale = state.currentLang.locale;
      if (!currency) {
        rate = state.currentLang.rate;
      }
    }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    // SSR fallback
  }

  if (!selectedCurrency) selectedCurrency = "BDT";
  if (!selectedLocale) selectedLocale = "en-BD";

  const convertedAmount = numericAmount * rate;
  const formattedAmount = new Intl.NumberFormat(selectedLocale, {
    style: "currency",
    currency: selectedCurrency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(convertedAmount);

  // In en-BD locale, Intl.NumberFormat might output "BDT 1,234". 
  // We explicitly replace "BDT" with the Taka symbol "৳" for a better UX.
  return formattedAmount.replace("BDT", "৳");
}

export function formatDate(date: string | Date, locale: string = "en-US") {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
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
