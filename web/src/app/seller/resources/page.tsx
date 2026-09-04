import * as React from "react"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BookOpen, Video, Download, MessageSquare, Sparkles } from "lucide-react"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PartnerResourcesPage() {
  return (
    <div className="min-h-screen py-24 bg-brand-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h1 className="text-4xl md:text-6xl font-black text-brand-gray-900 mb-6 tracking-tight">Partner <span className="text-primary italic">Resources</span></h1>
          <p className="text-brand-gray-500 text-lg leading-relaxed">
            Everything you need to succeed on Parloora. Guides, videos, and professional tools for your beauty business.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: BookOpen, title: "Quick Start Guide", desc: "Learn the basics of setting up your parlour profile." },
            { icon: Video, title: "Video Tutorials", desc: "Watch step-by-step videos on managing bookings." },
            { icon: Download, title: "Marketing Kits", desc: "Download brand assets to promote your shop." },
            { icon: MessageSquare, title: "Partner Community", desc: "Connect with other beauty professionals." }
          ].map((res, i) => (
            <div key={i} className="bg-white rounded-3xl p-8 border border-brand-gray-100 shadow-xl shadow-brand-gray-50 hover:shadow-2xl transition-all duration-500 group">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <res.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-brand-gray-900 mb-3">{res.title}</h3>
              <p className="text-sm text-brand-gray-500 leading-relaxed mb-6">{res.desc}</p>
              <Button variant="ghost" className="p-0 text-primary font-bold hover:bg-transparent hover:underline">
                Explore &rarr;
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-20 p-12 bg-brand-gray-900 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative">
           <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -mr-48 -mt-48" />
           <div className="relative z-10 max-w-lg">
             <h2 className="text-3xl font-bold mb-4 leading-tight">Need personalized support?</h2>
             <p className="text-brand-gray-400">Our Partner Success team is here to help you optimize your business.</p>
           </div>
           <Button className="bg-white text-brand-gray-900 rounded-2xl px-10 h-14 font-black hover:bg-white/90 relative z-10">
             Contact Support
           </Button>
        </div>
      </div>
    </div>
  )
}
