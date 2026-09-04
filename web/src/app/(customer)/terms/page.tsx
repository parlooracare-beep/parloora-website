import { Scale, ShieldCheck, AlertCircle, HelpCircle, FileText, Globe } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-brand-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 mb-4">
            <Scale className="w-4 h-4" />
            <span className="text-sm font-bold uppercase tracking-widest">Legal Agreement</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-brand-gray-900 mb-4">Terms of Service</h1>
          <p className="text-brand-gray-500">Last Updated: April 30, 2026</p>
        </div>

        <div className="space-y-8">
          <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
            <CardContent className="p-8 md:p-12 prose prose-slate max-w-none">
              <div className="flex items-center gap-4 mb-8 p-6 bg-brand-gray-50 rounded-2xl border border-brand-gray-100">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-gray-900 m-0">Acceptance of Terms</h3>
                  <p className="text-sm text-brand-gray-500 m-0">By using Parloora, you agree to follow these rules. Please read them carefully.</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-brand-gray-900 mb-4 flex items-center gap-2">
                <Globe className="w-6 h-6 text-primary" /> 1. Use of the Marketplace
              </h2>
              <p>
                Parloora provides a platform connecting beauty service providers ("Sellers") with customers. We do not provide the services ourselves but facilitate the booking and payment process.
              </p>

              <h2 className="text-2xl font-bold text-brand-gray-900 mt-12 mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" /> 2. Booking & Cancellations
              </h2>
              <p>
                When you book a service, you enter into a direct contract with the Seller. Cancellation policies vary by parlour and are displayed at the time of booking. Parloora reserves the right to charge a small service fee for facilitating bookings.
              </p>

              <h2 className="text-2xl font-bold text-brand-gray-900 mt-12 mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-primary" /> 3. Payments & Refunds
              </h2>
              <p>
                Payments are processed securely via our global partners. Refunds for physical goods are governed by our 7-day return policy. Service refunds must be coordinated directly with the parlour unless there is a dispute, in which case Parloora will mediate.
              </p>

              <h2 className="text-2xl font-bold text-brand-gray-900 mt-12 mb-4 flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-primary" /> 4. User Conduct
              </h2>
              <p>
                You agree not to use the platform for any fraudulent or harmful activity. Any violation of these terms may result in immediate account suspension without notice.
              </p>

              <div className="mt-16 p-8 bg-brand-gray-900 rounded-3xl text-center text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl -mr-16 -mt-16" />
                <h3 className="text-xl font-bold mb-2 relative z-10">Need legal assistance?</h3>
                <p className="text-brand-gray-400 mb-6 text-sm relative z-10">Our legal team is available for any clarifications regarding our global terms.</p>
                <button className="bg-white text-brand-gray-900 px-8 py-3 rounded-xl font-bold hover:bg-brand-gray-100 transition-all relative z-10">
                  Email Legal Team
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
