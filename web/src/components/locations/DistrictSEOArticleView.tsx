import * as React from "react"
import Link from "next/link"
import {
  Sparkles,
  Scissors,
  ShieldCheck,
  MapPin,
  Calendar,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  HeartHandshake,
  Store,
  Clock,
  DollarSign,
  ChevronRight,
  UserCheck,
} from "lucide-react"
import { DistrictSEOArticle } from "@/lib/locations/content"
import { ServiceCategorySEO } from "@/lib/locations/data"

interface DistrictSEOArticleViewProps {
  article: DistrictSEOArticle
  categories: ServiceCategorySEO[]
  hasActiveParlours: boolean
  totalParlours: number
}

export function DistrictSEOArticleView({
  article,
  categories,
  hasActiveParlours,
  totalParlours,
}: DistrictSEOArticleViewProps) {
  const [openFaq, setOpenFaq] = React.useState<number | null>(0)

  return (
    <article className="space-y-12 text-brand-gray-800">
      {/* ── SECTION 1: Introduction ── */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-brand-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>District Beauty & Self-Care Guide</span>
          </span>
          <span className="text-xs text-brand-gray-400 font-medium">
            Updated {article.lastUpdated} • {article.wordCount} words
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-brand-gray-900 tracking-tight mb-5 leading-tight">
          Find Beauty Parlours and Salons in {article.districtName} ({article.bnName})
        </h2>

        <div className="prose prose-base sm:prose-lg max-w-none text-brand-gray-600 leading-relaxed font-normal">
          <p>{article.section1_intro}</p>
        </div>

        {/* Live coverage badge */}
        <div className="mt-6 pt-6 border-t border-brand-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${hasActiveParlours ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
            <span className="text-xs sm:text-sm font-semibold text-brand-gray-700">
              {hasActiveParlours
                ? `${totalParlours} verified ${totalParlours === 1 ? "parlour" : "parlours"} currently accepting appointments in ${article.districtName}`
                : `Parloora coverage in ${article.districtName} is actively expanding. Browse available listings or register below.`}
            </span>
          </div>

          <Link
            href="#booking-journey"
            className="text-xs sm:text-sm font-bold text-primary hover:text-primary-dark inline-flex items-center gap-1 group"
          >
            <span>How booking works</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ── SECTION 2: Discover Beauty & Self-Care Services ── */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-brand-gray-100 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-2xl bg-[#E2A9A9]/20 flex items-center justify-center text-primary font-black text-sm">
            02
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-brand-gray-900 tracking-tight">
            Discover Beauty and Self-Care Services in {article.districtName}
          </h2>
        </div>

        <div className="prose prose-base max-w-none text-brand-gray-600 leading-relaxed space-y-4">
          <p>{article.section2_discovery}</p>
        </div>

        {/* Target keywords badge strip */}
        {article.secondaryKeywords.length > 0 && (
          <div className="mt-6 pt-6 border-t border-brand-gray-100">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-gray-400 block mb-3">
              Popular Search Categories in {article.districtName}
            </span>
            <div className="flex flex-wrap gap-2">
              {article.secondaryKeywords.slice(0, 8).map((kw, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-brand-gray-50 border border-brand-gray-200/60 rounded-xl text-xs font-medium text-brand-gray-700"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── SECTION 3: Types of Providers & Deep Internal Links ── */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-brand-gray-100 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-2xl bg-[#C8A2D6]/20 flex items-center justify-center text-primary font-black text-sm">
            03
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-brand-gray-900 tracking-tight">
            Types of Beauty Providers in {article.districtName}
          </h2>
        </div>

        <div className="prose prose-base max-w-none text-brand-gray-600 leading-relaxed mb-8">
          <p>{article.section3_types}</p>
        </div>

        {/* Category Cards with Internal Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/locations/${article.slug}/${cat.slug}`}
              className="p-5 rounded-2xl border border-brand-gray-100 bg-brand-gray-50/50 hover:bg-white hover:border-primary/40 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">
                    {cat.bnName}
                  </span>
                  <ChevronRight className="w-4 h-4 text-brand-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-base font-bold text-brand-gray-900 group-hover:text-primary transition-colors mb-1.5">
                  {cat.name} in {article.districtName}
                </h3>
                <p className="text-xs text-brand-gray-500 leading-relaxed line-clamp-2">
                  {cat.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-brand-gray-100/80 flex items-center justify-between text-[11px] font-semibold text-primary">
                <span>Explore providers &rarr;</span>
                <span className="text-brand-gray-400 font-normal">Transparent Rates</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── SECTION 4: How to Choose a Suitable Provider ── */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-brand-gray-100 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 font-black text-sm">
            04
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-brand-gray-900 tracking-tight">
            How to Choose a Suitable Provider in {article.districtName}
          </h2>
        </div>

        <div className="prose prose-base max-w-none text-brand-gray-600 leading-relaxed mb-6">
          <p>{article.section4_howToChoose}</p>
        </div>

        {/* 4 Practical Selection Checkpoints */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-brand-gray-50 border border-brand-gray-100">
            <div className="flex items-center gap-2 font-bold text-sm text-brand-gray-900 mb-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Transparent Rate Cards</span>
            </div>
            <p className="text-xs text-brand-gray-600 leading-relaxed">
              Verify itemized service rates and treatment durations directly on the parlour profile before confirming to avoid surprise costs.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-brand-gray-50 border border-brand-gray-100">
            <div className="flex items-center gap-2 font-bold text-sm text-brand-gray-900 mb-1.5">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Sanitation & Hygiene Standards</span>
            </div>
            <p className="text-xs text-brand-gray-600 leading-relaxed">
              Prioritize salons that prioritize sterilized tools, clean linens, hygienic pedicure tubs, and verified cosmetic products.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-brand-gray-50 border border-brand-gray-100">
            <div className="flex items-center gap-2 font-bold text-sm text-brand-gray-900 mb-1.5">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Verified Client Feedback</span>
            </div>
            <p className="text-xs text-brand-gray-600 leading-relaxed">
              Read authentic client reviews to evaluate staff courtesy, punctuality, and overall satisfaction for bridal and grooming services.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-brand-gray-50 border border-brand-gray-100">
            <div className="flex items-center gap-2 font-bold text-sm text-brand-gray-900 mb-1.5">
              <MapPin className="w-4 h-4 text-rose-600" />
              <span>Location & Schedule Accessibility</span>
            </div>
            <p className="text-xs text-brand-gray-600 leading-relaxed">
              Select parlours located near your residence, commute route, or event venue in {article.districtName} for stress-free visits.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: Real Booking Journey ── */}
      <section id="booking-journey" className="bg-gradient-to-br from-[#1C0825] via-[#4B1D5F] to-[#2E0F3E] text-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#E2A9A9]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-[#E2A9A9]/30 rounded-full px-3.5 py-1 mb-4 backdrop-blur-xl">
            <Calendar className="w-3.5 h-3.5 text-[#E2A9A9]" />
            <span className="text-[#E2A9A9] text-xs font-bold uppercase tracking-wider">
              Easy 6-Step Digital Process
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-4 leading-tight">
            Book Through Parloora in {article.districtName}
          </h2>

          <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-2xl mb-8 font-normal">
            {article.section5_booking}
          </p>

          {/* Step Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { num: "01", title: "Explore Providers", desc: `Browse verified ${article.districtName} salons.` },
              { num: "02", title: "Select Service", desc: "Choose haircuts, facials, or bridal glam." },
              { num: "03", title: "Compare Details", desc: "Check durations, prices & reviews." },
              { num: "04", title: "Pick Appointment", desc: "Select live calendar date & time." },
              { num: "05", title: "Review Details", desc: "Add styling notes & confirm." },
              { num: "06", title: "Pay at Parlour", desc: "Pay cash upon arrival or online." },
            ].map((step, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-black text-[#E2A9A9] block mb-1">{step.num}</span>
                  <div className="font-bold text-xs sm:text-sm text-white mb-1">{step.title}</div>
                  <p className="text-[11px] text-white/70 leading-snug">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: Local Discovery & Verified Upazilas ── */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-brand-gray-100 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-black text-sm">
            06
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-brand-gray-900 tracking-tight">
            Local Discovery across {article.districtName} Upazilas
          </h2>
        </div>

        <div className="prose prose-base max-w-none text-brand-gray-600 leading-relaxed mb-6">
          <p>{article.section6_localDiscovery}</p>
        </div>

        {/* Local Area Chips */}
        <div className="p-5 rounded-2xl bg-brand-gray-50 border border-brand-gray-100">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-3">
            <MapPin className="w-4 h-4" />
            <span>Key Administrative Areas & Upazilas in {article.districtName}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {article.secondaryKeywords
              .filter((kw) => kw.includes("beauty parlour") || kw.includes("salon"))
              .slice(0, 6)
              .map((area, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 bg-white border border-brand-gray-200/80 rounded-xl text-xs font-semibold text-brand-gray-800 shadow-2xs"
                >
                  {area}
                </span>
              ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 7: Tips for Planning a Beauty Appointment ── */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-brand-gray-100 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-800 font-black text-sm">
            07
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-brand-gray-900 tracking-tight">
            Tips for Planning a Beauty Appointment in {article.districtName}
          </h2>
        </div>

        <div className="prose prose-base max-w-none text-brand-gray-600 leading-relaxed">
          <p>{article.section7_tips}</p>
        </div>
      </section>

      {/* ── SECTION 8: Frequently Asked Questions ── */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-brand-gray-100 shadow-sm">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-800 font-black text-sm">
            08
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-brand-gray-900 tracking-tight">
              Frequently Asked Questions — {article.districtName}
            </h2>
            <p className="text-xs sm:text-sm text-brand-gray-500 font-medium">
              Common questions about finding, booking, and listing parlour services in {article.districtName}.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {article.section8_faqs.map((faq, i) => {
            const isOpen = openFaq === i
            return (
              <div
                key={i}
                className="border border-brand-gray-100 rounded-2xl overflow-hidden transition-all bg-brand-gray-50/50"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-brand-gray-900 hover:text-primary transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-primary shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 text-brand-gray-400 transition-transform ${isOpen ? "rotate-90 text-primary" : ""}`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-brand-gray-600 leading-relaxed border-t border-brand-gray-100 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ── SECTION 9: Call to Action (Customer & Salon Partner) ── */}
      <section className="bg-gradient-to-r from-primary to-[#2E0F3E] text-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg text-center relative overflow-hidden">
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-[#E2A9A9]/30 rounded-full px-4 py-1 mb-4 backdrop-blur-xl">
            <HeartHandshake className="w-3.5 h-3.5 text-[#E2A9A9]" />
            <span className="text-[#E2A9A9] text-xs font-bold uppercase tracking-wider">
              {article.districtName} Community
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-4">
            Book Your Self-Care Appointment in {article.districtName}
          </h2>

          <p className="text-white/85 text-xs sm:text-sm md:text-base leading-relaxed mb-8 font-normal">
            {article.section9_cta}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#parlours-list"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#E2A9A9] text-[#1C0825] font-black text-xs sm:text-sm hover:bg-[#F3D5D5] transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Explore {article.districtName} Parlours</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <Link
              href="/seller/register"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
            >
              <Store className="w-4 h-4 text-[#E2A9A9]" />
              <span>List Your Salon for Free</span>
            </Link>
          </div>
        </div>
      </section>
    </article>
  )
}
