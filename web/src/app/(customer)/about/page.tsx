import * as React from "react"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Sparkles, Heart, Shield, Users, Award } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="bg-brand-gray-900 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold uppercase tracking-wider">Our Story</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">Redefining <span className="text-primary italic">Beauty</span></h1>
          <p className="text-brand-gray-400 text-xl max-w-2xl mx-auto leading-relaxed">
            Parloora is the world&apos;s leading marketplace for premium beauty and wellness services. 
            We connect sophisticated clients with the finest parlours globally.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-12">
          {[
            { icon: Heart, title: "Passion for Excellence", desc: "We are committed to providing only the highest quality beauty experiences." },
            { icon: Shield, title: "Verified Partners", desc: "Every parlour on our platform undergoes a rigorous quality and safety audit." },
            { icon: Users, title: "Community Driven", desc: "We empower beauty professionals to grow their businesses and reach new heights." }
          ].map((val, i) => (
            <div key={i} className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <val.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-brand-gray-900">{val.title}</h3>
              <p className="text-brand-gray-500 leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-brand-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Partner Parlours", val: "500+" },
              { label: "Monthly Bookings", val: "10k+" },
              { label: "Happy Customers", val: "50k+" },
              { label: "Cities Covered", val: "25+" }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl font-black text-brand-gray-900 mb-2">{stat.val}</div>
                <div className="text-sm text-brand-gray-500 font-bold uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
