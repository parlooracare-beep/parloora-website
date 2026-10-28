# Parloora — Beauty & Self-Care Booking Marketplace

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Production%20Live-black?style=flat&logo=vercel)](https://parloora.vercel.app)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.2.4-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.4-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-CSS%204-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend%20%26%20Auth-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)

**Parloora** is a Bangladesh-based beauty and self-care marketplace connecting customers with verified local beauty parlours, salons, spas, and independent beauty specialists.

- **Tagline**: *Book Your Self Care Services In Seconds*
- **Official Website**: [https://parloora.com](https://parloora.com) (Live on [Vercel](https://parloora.vercel.app))
- **Primary Market**: Bangladesh (Nationwide coverage across all 64 districts)

---

## 📞 Official Contact Channels

| Channel | Details | Link |
| :--- | :--- | :--- |
| **Customer Care** | `01884599271` | [Call Hotline](tel:01884599271) |
| **WhatsApp Support** | `01884599271` | [Chat on WhatsApp](https://wa.me/8801884599271) |
| **Office Location** | Dhaka, Bangladesh | [Contact Page](https://parloora.com/contact) |
| **Facebook** | `@parloora` | [facebook.com/parloora](https://www.facebook.com/parloora) |
| **Instagram** | `@parloora` | [instagram.com/parloora](https://www.instagram.com/parloora) |
| **YouTube** | `@Parloora` | [youtube.com/@Parloora](https://www.youtube.com/@Parloora) |

---

## 🏗️ Repository Architecture

This repository is structured as a modern Next.js monorepo:

```
parloora-website/
├── web/                           # Next.js 16 App Router application
│   ├── src/
│   │   ├── app/
│   │   │   ├── (customer)/        # Customer-facing marketplace & landing pages
│   │   │   │   ├── contact/       # Official Contact Us page with Schema.org
│   │   │   │   ├── about/         # Verified About Us page
│   │   │   │   └── parlours/      # Parlour search & discovery across 64 districts
│   │   │   ├── (seller)/          # Seller/Merchant dashboard & onboarding
│   │   │   └── (admin)/           # Super admin dashboard & controls
│   │   ├── components/            # Reusable UI & Layout components
│   │   │   └── shared/
│   │   │       ├── WhatsAppButton.tsx  # Floating quick-contact WhatsApp button
│   │   │       └── Footer.tsx          # Brand footer with verified contacts & social
│   │   ├── config/
│   │   │   └── contact.ts         # Centralized single source of truth for contact details
│   │   ├── lib/                   # Supabase clients, utilities, and i18n
│   │   └── messages/              # English (en.json) & Bangla (bn.json) dictionaries
│   ├── public/                    # Static assets, icons, manifest, and robots.txt
│   └── package.json               # Next.js dependencies & test scripts
├── package.json                   # Root monorepo workspace configuration
├── vercel.json                    # Vercel deployment framework & build configuration
└── AGENTS.md                      # Development guidelines & automated deployment rules
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x

### 1. Installation
```bash
# Navigate to web application
cd web
npm install
```

### 2. Local Development
```bash
npm run dev
# Open http://localhost:3000 in your browser
```

### 3. Verification & Testing
```bash
# Type check (TypeScript)
npx tsc --noEmit

# Code quality check (ESLint)
npx eslint --quiet

# Run automated test suite (Launch readiness, i18n parity, SEO, contact verification)
npm test

# Build production bundle
npm run build
```

---

## 🚢 Continuous Deployment (CI/CD)

- **GitHub Repository**: [`parlooracare-beep/parloora-website`](https://github.com/parlooracare-beep/parloora-website)
- **Production Host**: [Vercel](https://vercel.com)
- Every push to the `main` branch automatically triggers CI/CD verification and production deployment.

---

© 2026 Parloora. All rights reserved.
