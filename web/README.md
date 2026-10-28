# Parloora — Beauty & Self-Care Booking Marketplace

Parloora is a Bangladesh-based beauty and self-care marketplace and a concern of Amdads Group. It connects customers with beauty parlours, salons, spas, and independent beauty professionals through a modern, mobile-first web application.

- **Tagline**: Book Your Self Care Services In Seconds
- **Website**: [https://parloora.com](https://parloora.com)
- **Initial Target Market**: Moulvibazar, Bangladesh

---

## 🌟 Key Features

1. **Customer Marketplace (`/parlours`)**:
   - Location-aware search and service discovery across Bangladesh.
   - Real-time service comparisons, transparent pricing, and appointment booking.
   - Wishlist, reviews, shopping, and verified provider profiles.

2. **Mobile-First App Experience**:
   - Native-app style bottom navigation bar (`MobileNav`) for smartphones.
   - Mobile-first home header with location selector and category scrolls (`MobileHomeHeader`).
   - Progressive Web App (PWA) with install prompts, service worker caching, and offline status handling.

3. **Seller / Parlour Portal (`/seller/dashboard`)**:
   - Real-time appointment management (confirm, reschedule, complete).
   - Service listings, pricing, duration, and staff management.
   - Payout requests and business analytics.

4. **Super Admin Suite (`/admin/dashboard`)**:
   - Comprehensive system oversight: users, sellers, parlours, bookings, and financial transactions.
   - Dynamic page builder, promotional discount codes, blog CMS, and audit logging.

5. **SEO & Accessibility**:
   - Server-side rendered (SSR) & statically generated (SSG) pages with Next.js App Router.
   - Structured JSON-LD schemas (`Organization`, `WebPage`, `BreadcrumbList`, `FAQPage`).
   - Premium brand design with Accessible WCAG-compliant color palettes.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 & Lucide Icons
- **Backend & Database**: Supabase (PostgreSQL, Row-Level Security, Auth, Storage)
- **State & Data Fetching**: React Query & Zustand
- **Deployment**: Vercel CI/CD

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Type check
npx tsc --noEmit

# 4. ESLint verification
npx eslint --quiet

# 5. Production build
npm run build
```
