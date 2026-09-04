"use client"

import * as React from "react"
import Link from "next/link"
import { Clock, ShieldCheck, Mail, ArrowLeft, ExternalLink, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function SellerPendingPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-500/10">
            <Clock className="w-10 h-10 text-amber-600 animate-pulse" />
          </div>
          <h1 className="text-4xl font-black text-brand-gray-900 mb-4 tracking-tight">
            Application Under Review
          </h1>
          <p className="text-brand-gray-500 text-lg leading-relaxed max-w-md mx-auto">
            Your business application is being processed by our moderation team. 
            We usually complete reviews within <span className="text-brand-gray-900 font-bold">24 hours</span>.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-brand-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-brand-gray-900 mb-2">Verification Progress</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  Account created successfully
                </li>
                <li className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  Business details submitted
                </li>
                <li className="flex items-center gap-2 text-sm text-amber-600 font-medium">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                  Identity & business verification
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-brand-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-bold text-brand-gray-900 mb-2">What&apos;s next?</h3>
              <p className="text-sm text-brand-gray-500 leading-relaxed mb-4">
                Keep an eye on your inbox. We&apos;ll send you an email as soon as your shop is live on Parloora.
              </p>
              <Button variant="outline" size="sm" className="w-full rounded-xl border-brand-gray-200 gap-2">
                Check Email <ExternalLink className="w-3 h-3" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 p-8 bg-brand-gray-900 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
          <div className="absolute right-0 top-0 w-32 h-32 bg-primary/20 blur-3xl -mr-16 -mt-16" />
          <div className="relative z-10">
            <h4 className="font-bold text-lg mb-1">Need help setting up?</h4>
            <p className="text-white/60 text-sm">Our partner support team is available 24/7 to assist you.</p>
          </div>
          <Button className="bg-white text-brand-gray-900 rounded-xl px-6 font-bold hover:bg-white/90 shrink-0 gap-2 relative z-10">
            <MessageCircle className="w-4 h-4" />
            Contact Support
          </Button>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-brand-gray-400 hover:text-brand-gray-900 font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
