import * as React from "react"
import { Cookie, ShieldCheck, Eye, ExternalLink } from "lucide-react"

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-brand-gray-50/30 pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-xl shadow-brand-gray-100 border border-brand-gray-100">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-primary/10 p-3 rounded-2xl text-primary">
              <Cookie className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-brand-gray-900">Cookie Policy</h1>
              <p className="text-brand-gray-500 font-medium">Last updated: May 2026</p>
            </div>
          </div>

          <div className="prose prose-brand-gray max-w-none space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-brand-gray-900 mb-4 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-primary" /> 1. What Are Cookies?
              </h2>
              <p className="text-brand-gray-600 leading-relaxed">
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. 
                They are widely used to make websites work more efficiently, as well as to provide reporting information 
                and personalize your experience.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-gray-900 mb-4 flex items-center gap-3">
                <Eye className="w-6 h-6 text-primary" /> 2. How We Use Cookies
              </h2>
              <p className="text-brand-gray-600 leading-relaxed mb-6">
                Parloora uses cookies for several reasons. Some cookies are required for technical reasons in order for our 
                website to operate, and we refer to these as "essential" or "strictly necessary" cookies.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-brand-gray-50 p-6 rounded-2xl border border-brand-gray-100">
                  <h3 className="font-bold text-brand-gray-900 mb-2">Essential Cookies</h3>
                  <p className="text-sm text-brand-gray-500">
                    Necessary for authentication, security, and making sure the booking process works correctly.
                  </p>
                </div>
                <div className="bg-brand-gray-50 p-6 rounded-2xl border border-brand-gray-100">
                  <h3 className="font-bold text-brand-gray-900 mb-2">Performance Cookies</h3>
                  <p className="text-sm text-brand-gray-500">
                    Help us understand how visitors interact with our website by collecting and reporting information anonymously.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-gray-900 mb-4 flex items-center gap-3">
                <ExternalLink className="w-6 h-6 text-primary" /> 3. Managing Cookies
              </h2>
              <p className="text-brand-gray-600 leading-relaxed">
                Most web browsers allow you to control cookies through their settings preferences. However, if you limit 
                the ability of websites to set cookies, you may worsen your overall user experience, as it will no longer 
                be personalized to you. It may also stop you from saving customized settings like login information.
              </p>
            </section>

            <div className="bg-primary/5 p-8 rounded-[2rem] border border-primary/10">
              <h3 className="text-xl font-bold text-primary mb-2">Questions?</h3>
              <p className="text-brand-gray-600">
                If you have any questions about our use of cookies or other technologies, please email us at{" "}
                <a href="mailto:privacy@parloora.com" className="text-primary font-bold hover:underline">
                  privacy@parloora.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
