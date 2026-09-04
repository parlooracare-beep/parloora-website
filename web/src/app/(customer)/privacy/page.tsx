import { Shield, Lock, Eye, FileText, Globe, Scale } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-brand-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 mb-4">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-bold uppercase tracking-widest">Trust & Safety</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-brand-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-brand-gray-500">Last Updated: April 30, 2026</p>
        </div>

        <div className="space-y-8">
          <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
            <CardContent className="p-8 md:p-12 prose prose-slate max-w-none">
              <div className="flex items-center gap-4 mb-8 p-6 bg-brand-gray-50 rounded-2xl border border-brand-gray-100">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shrink-0">
                  <Eye className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-gray-900 m-0">Our Privacy Commitment</h3>
                  <p className="text-sm text-brand-gray-500 m-0">Your data belongs to you. We only use it to improve your experience.</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-brand-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" /> 1. Information We Collect
              </h2>
              <p>
                We collect information you provide directly to us when you create an account, make a booking, or purchase products. This includes:
              </p>
              <ul>
                <li><strong>Account Data:</strong> Name, email address, phone number, and password.</li>
                <li><strong>Booking Data:</strong> Service selections, preferred times, and parlour locations.</li>
                <li><strong>Payment Info:</strong> Transaction details processed through our secure partners (we do not store full credit card numbers).</li>
              </ul>

              <h2 className="text-2xl font-bold text-brand-gray-900 mt-12 mb-4 flex items-center gap-2">
                <Globe className="w-6 h-6 text-primary" /> 2. International Data Transfers
              </h2>
              <p>
                As a global marketplace, Parloora may process your information on servers located outside your home country. We implement standard contractual clauses and high-level encryption to ensure your data remains protected under international standards, including GDPR.
              </p>

              <h2 className="text-2xl font-bold text-brand-gray-900 mt-12 mb-4 flex items-center gap-2">
                <Lock className="w-6 h-6 text-primary" /> 3. Data Security
              </h2>
              <p>
                We use industry-standard SSL/TLS encryption for all data transmissions. Access to your personal data is strictly limited to authorized personnel and automated systems necessary to fulfill your bookings.
              </p>

              <h2 className="text-2xl font-bold text-brand-gray-900 mt-12 mb-4 flex items-center gap-2">
                <Scale className="w-6 h-6 text-primary" /> 4. Your Rights
              </h2>
              <p>
                You have the right to access, correct, or delete your personal data at any time. You can request a full export of your account data through your profile settings or by contacting our support team.
              </p>

              <div className="mt-16 p-8 bg-primary/5 rounded-3xl border border-primary/10 text-center">
                <h3 className="text-xl font-bold text-brand-gray-900 mb-2">Questions about your privacy?</h3>
                <p className="text-brand-gray-600 mb-6 text-sm">Our data protection officer is ready to help you with any concerns.</p>
                <button className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all">
                  Contact Privacy Team
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
