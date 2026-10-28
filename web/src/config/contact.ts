/**
 * Parloora Official Contact Information
 * Single source of truth across the entire platform.
 * 
 * Customer Care & WhatsApp: 01884599271
 * Office: Dhaka, Bangladesh
 * Website: https://parloora.com
 * Official Social: Facebook, Instagram, YouTube
 */

export const contactInfo = {
  website: "https://parloora.com",
  tagline: "Book Your Self Care Services In Seconds",
  taglineBn: "মুহূর্তেই আপনার সেলফ-কেয়ার সেবা বুক করুন",
  office: "Dhaka, Bangladesh",
  officeBn: "ঢাকা, বাংলাদেশ",
  customerCare: "01884599271",
  customerCareTel: "tel:01884599271",
  customerCareInternational: "+8801884599271",
  whatsappDisplay: "01884599271",
  whatsappInternational: "8801884599271",
  whatsappUrl: "https://wa.me/8801884599271",
  social: {
    facebook: "https://www.facebook.com/parloora",
    instagram: "https://www.instagram.com/parloora",
    youtube: "https://www.youtube.com/@Parloora",
  },
} as const

export type ContactInfo = typeof contactInfo
