import * as React from "react"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Check, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function SellerPricingPage() {
  return (
    <div className="min-h-screen py-24 bg-brand-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h1 className="text-4xl md:text-6xl font-black text-brand-gray-900 mb-6 tracking-tight">Flexible Plans for <span className="text-primary italic">Every Business</span></h1>
          <p className="text-brand-gray-500 text-lg">Choose the plan that fits your growth ambitions. No hidden fees.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              name: "Starter", 
              price: "0", 
              features: ["10 services listing", "Basic booking management", "Customer support"],
              btn: "Get Started",
              link: "/seller/register"
            },
            { 
              name: "Professional", 
              price: "49", 
              popular: true,
              features: ["Unlimited services", "Advanced analytics", "Marketing tools", "Priority support"],
              btn: "Join Pro",
              link: "/seller/register"
            },
            { 
              name: "Enterprise", 
              price: "Custom", 
              features: ["Multi-location support", "Dedicated manager", "API access", "White-label options"],
              btn: "Contact Us",
              link: "mailto:sales@parloora.com"
            }
          ].map((plan, i) => (
            <div key={i} className={cn(
              "bg-white rounded-3xl p-10 border transition-all duration-500 relative flex flex-col",
              plan.popular ? "border-primary shadow-2xl shadow-primary/20 scale-105 z-10" : "border-brand-gray-100"
            )}>
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">Most Popular</div>
              )}
              <div className="mb-8">
                <h3 className="text-2xl font-black text-brand-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-brand-gray-900">${plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-brand-gray-500 font-bold">/mo</span>}
                </div>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm text-brand-gray-600">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-emerald-500" />
                    </div>
                    {feat}
                  </li>
                ))}
              </ul>
              <Button asChild className={cn(
                "w-full h-14 rounded-2xl font-black text-lg",
                plan.popular ? "bg-primary text-white shadow-xl shadow-primary/25" : "bg-brand-gray-900 text-white"
              )}>
                <Link href={plan.link}>{plan.btn}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
