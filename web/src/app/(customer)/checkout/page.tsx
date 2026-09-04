"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ShoppingBag, ChevronLeft, CreditCard, Truck, 
  ShieldCheck, ArrowRight, Loader2, CheckCircle2,
  MapPin, Phone, User, Mail
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn, formatCurrency } from "@/lib/utils"
import { useCart } from "@/lib/store/useCart"
import { createOrder } from "@/lib/actions/orders"
import { createClient } from "@/lib/supabase/client"
import { Elements } from "@stripe/react-stripe-js"
import { getStripe } from "@/lib/stripe"
import { StripePaymentForm } from "@/components/shared/StripePaymentForm"
import { X } from "lucide-react"
import { validatePromoCode, applyPromoCode } from "@/lib/actions/promo"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const total = totalPrice()

  // Promo code states
  const [promoCode, setPromoCode] = React.useState("")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [appliedPromo, setAppliedPromo] = React.useState<any>(null)
  const [promoError, setPromoError] = React.useState<string | null>(null)
  const [isValidatingPromo, setIsValidatingPromo] = React.useState(false)
  const [showPromoInput, setShowPromoInput] = React.useState(false)

  const finalTotal = appliedPromo ? Math.max(0, total - appliedPromo.discountAmount) : total

  const handleValidatePromo = async () => {
    if (!promoCode.trim()) return
    setIsValidatingPromo(true)
    setPromoError(null)
    try {
      const res = await validatePromoCode(promoCode, "products", total)
      if (res.success) {
        setAppliedPromo(res)
        setPromoError(null)
      } else {
        setPromoError(res.error || "Invalid promo code")
      }
    } catch (err) {
      console.error(err)
      setPromoError("An error occurred validating promo code")
    } finally {
      setIsValidatingPromo(false)
    }
  }

  const handleRemovePromo = () => {
    setAppliedPromo(null)
    setPromoCode("")
    setPromoError(null)
  }

  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = React.useState<any>(null)
  
  const [stripeClientSecret, setStripeClientSecret] = React.useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [stripePaymentIntentId, setStripePaymentIntentId] = React.useState<string | null>(null)
  const [showStripeModal, setShowStripeModal] = React.useState(false)
  
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    paymentMethod: "Card"
  })

  React.useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user)
        setFormData(prev => ({
          ...prev,
          name: user.user_metadata?.display_name || "",
          email: user.email || ""
        }))
      }
    })
  }, [])

  if (items.length === 0 && !isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-brand-gray-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-brand-gray-300" />
        </div>
        <h1 className="text-2xl font-black text-brand-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-brand-gray-500 mb-8 max-w-xs">Add some premium beauty products to your cart before checking out.</p>
        <Button asChild className="bg-primary hover:bg-primary/90 text-white px-8 h-12 rounded-xl font-bold">
          <Link href="/shop">Start Shopping</Link>
        </Button>
      </div>
    )
  }

  const handleStripeSuccess = async (piId: string) => {
    setShowStripeModal(false)
    setIsSubmitting(true)
    try {
      const baseOrderData = {
        customer_id: user?.id || null,
        customer_name: formData.name,
        phone: formData.phone,
        address: `${formData.address}, ${formData.city}, ${formData.postalCode}`,
        total_amount: finalTotal,
        total: finalTotal,
        payment_method: "Card",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        items: items as any,
        items_count: items.reduce((acc, item) => acc + item.quantity, 0),
        delivery_method: "Standard Shipping",
        status: "Confirmed",
        payment_status: "paid",
        payment_intent_id: piId,
      }

      const res = await createOrder(baseOrderData)
      if (res.success) {
        if (appliedPromo) {
          await applyPromoCode(appliedPromo.code)
        }
        setIsSuccess(true)
        clearCart()
        setTimeout(() => router.push("/dashboard"), 3000)
      } else {
        alert("Payment confirmed but order registration failed: " + res.error)
      }
    } catch (err) {
      console.error(err)
      alert("An error occurred confirming your order.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const baseOrderData = {
        customer_id: user?.id || null,
        customer_name: formData.name,
        phone: formData.phone,
        address: `${formData.address}, ${formData.city}, ${formData.postalCode}`,
        total_amount: finalTotal,
        total: finalTotal,
        payment_method: formData.paymentMethod,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        items: items as any,
        items_count: items.reduce((acc, item) => acc + item.quantity, 0),
        delivery_method: "Standard Shipping",
      }

      // ── SSLCommerz ──────────────────────────────────────────────────
      if (formData.paymentMethod === "SSLCommerz") {
        const res = await createOrder({ ...baseOrderData, status: "Pending" })
        if (res.success && appliedPromo) {
          await applyPromoCode(appliedPromo.code)
        }
        const orderId = res.data?.id

        const ssl = await fetch("/api/checkout/sslcommerz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: finalTotal,
            orderId,
            customerName: formData.name,
            customerEmail: formData.email,
            customerPhone: formData.phone,
            customerAddress: `${formData.address}, ${formData.city}`,
          }),
        }).then((r) => r.json())

        if (ssl.success && ssl.gatewayUrl) {
          window.location.href = ssl.gatewayUrl
          return
        }
        alert("SSLCommerz error: " + (ssl.error || "Unknown error"))
        return
      }

      // ── bKash ───────────────────────────────────────────────────────
      if (formData.paymentMethod === "bKash") {
        const res = await createOrder({ ...baseOrderData, status: "Pending" })
        if (res.success && appliedPromo) {
          await applyPromoCode(appliedPromo.code)
        }
        const orderId = res.data?.id

        const bk = await fetch("/api/checkout/bkash", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: finalTotal, orderId }),
        }).then((r) => r.json())

        if (bk.success && bk.bkashURL) {
          window.location.href = bk.bkashURL
          return
        }
        alert("bKash error: " + (bk.error || "Unknown error"))
        return
      }

      // ── Stripe Card ──────────────────────────────────────────────────
      if (formData.paymentMethod === "Card") {
        const response = await fetch("/api/checkout/stripe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: finalTotal,
            email: formData.email,
            customerName: formData.name,
            serviceName: `Purchase of ${items.reduce((acc, item) => acc + item.quantity, 0)} items`,
          }),
        }).then((r) => r.json())

        if (response.success && response.clientSecret) {
          setStripeClientSecret(response.clientSecret)
          setStripePaymentIntentId(response.paymentIntentId)
          setShowStripeModal(true)
          return
        }
        alert("Stripe session creation failed: " + (response.error || "Unknown error"))
        return
      }

      // ── Cash on Delivery ──────────────────────────────
      const res = await createOrder({ ...baseOrderData, status: "Processing" })

      if (res.success) {
        if (appliedPromo) {
          await applyPromoCode(appliedPromo.code)
        }
        setIsSuccess(true)
        clearCart()
        setTimeout(() => router.push("/dashboard"), 3000)
      } else {
        alert("Failed to place order: " + res.error)
      }
    } catch (error) {
      console.error(error)
      alert("An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen bg-brand-gray-50/50 pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link 
            href="/shop" 
            className="w-10 h-10 rounded-full bg-white border border-brand-gray-100 flex items-center justify-center hover:bg-brand-gray-50 transition-colors shadow-sm"
          >
            <ChevronLeft className="w-5 h-5 text-brand-gray-600" />
          </Link>
          <h1 className="text-3xl font-black text-brand-gray-900 tracking-tight">Checkout</h1>
        </div>

        {isSuccess ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto bg-white rounded-3xl p-12 text-center shadow-xl shadow-brand-gray-200 border border-brand-gray-100"
          >
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-100">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-black text-brand-gray-900 mb-4">Order Placed Successfully!</h2>
            <p className="text-brand-gray-500 mb-8 leading-relaxed">
              Thank you for your purchase. We&apos;ve sent an order confirmation to <strong>{formData.email}</strong>. 
              Your beauty essentials will be on their way soon!
            </p>
            <div className="flex items-center justify-center gap-2 text-primary font-bold text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Redirecting to your dashboard...
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Form Section */}
            <div className="lg:col-span-7 space-y-8">
              {/* Shipping Information */}
              <section className="bg-white rounded-3xl p-8 shadow-sm border border-brand-gray-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-gray-900">Shipping Details</h3>
                </div>

                <form className="space-y-6" id="checkout-form" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-brand-gray-400">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-brand-gray-400" />
                        <Input 
                          id="name" 
                          name="name"
                          placeholder="John Doe" 
                          required 
                          value={formData.name}
                          onChange={handleInputChange}
                          className="pl-10 h-12 rounded-xl border-brand-gray-100 focus:ring-primary/20" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-brand-gray-400">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-brand-gray-400" />
                        <Input 
                          id="email" 
                          name="email"
                          type="email" 
                          placeholder="john@example.com" 
                          required 
                          value={formData.email}
                          onChange={handleInputChange}
                          className="pl-10 h-12 rounded-xl border-brand-gray-100 focus:ring-primary/20" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-brand-gray-400">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-brand-gray-400" />
                      <Input 
                        id="phone" 
                        name="phone"
                        placeholder="+880 1XXX XXXXXX" 
                        required 
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="pl-10 h-12 rounded-xl border-brand-gray-100 focus:ring-primary/20" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-brand-gray-400">Delivery Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-brand-gray-400" />
                      <Input 
                        id="address" 
                        name="address"
                        placeholder="Street address, Apartment, etc." 
                        required 
                        value={formData.address}
                        onChange={handleInputChange}
                        className="pl-10 h-12 rounded-xl border-brand-gray-100 focus:ring-primary/20" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-xs font-bold uppercase tracking-wider text-brand-gray-400">City</Label>
                      <Input 
                        id="city" 
                        name="city"
                        placeholder="Dhaka" 
                        required 
                        value={formData.city}
                        onChange={handleInputChange}
                        className="h-12 rounded-xl border-brand-gray-100" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode" className="text-xs font-bold uppercase tracking-wider text-brand-gray-400">Postal Code</Label>
                      <Input 
                        id="postalCode" 
                        name="postalCode"
                        placeholder="1212" 
                        required 
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="h-12 rounded-xl border-brand-gray-100" 
                      />
                    </div>
                  </div>
                </form>
              </section>

              {/* Payment Method */}
              <section className="bg-white rounded-3xl p-8 shadow-sm border border-brand-gray-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-gray-900">Payment Method</h3>
                </div>

                {/* Payment method grid — 4 options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {([
                    {
                      id: "Card",
                      label: "Card (Stripe)",
                      sub: "Visa, Mastercard, AMEX",
                      badge: (
                        <div className="flex gap-1">
                          <div className="w-7 h-4 bg-blue-700 rounded-sm flex items-center justify-center">
                            <span className="text-[7px] font-black text-white">VISA</span>
                          </div>
                          <div className="w-7 h-4 rounded-sm overflow-hidden flex">
                            <div className="w-1/2 bg-red-500" /><div className="w-1/2 bg-amber-400" />
                          </div>
                        </div>
                      ),
                    },
                    {
                      id: "SSLCommerz",
                      label: "SSLCommerz",
                      sub: "Visa, MasterCard, DBBL, bKash & more",
                      badge: (
                        <div className="w-16 h-5 bg-[#003D7C] rounded flex items-center justify-center">
                          <span className="text-[7px] font-black text-white tracking-tight">SSLCommerz</span>
                        </div>
                      ),
                    },
                    {
                      id: "bKash",
                      label: "bKash",
                      sub: "Bangladesh's #1 MFS",
                      badge: (
                        <div className="w-12 h-5 bg-[#E2136E] rounded flex items-center justify-center">
                          <span className="text-[7px] font-black text-white">bKash</span>
                        </div>
                      ),
                    },
                    {
                      id: "Cash on Delivery",
                      label: "Cash on Delivery",
                      sub: "Pay when your order arrives",
                      badge: null,
                    },
                  ] as const).map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.id }))}
                      className={cn(
                        "p-4 rounded-2xl border text-left transition-all duration-200",
                        formData.paymentMethod === method.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                          : "border-brand-gray-100 hover:border-primary/40 hover:bg-brand-gray-50"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className={cn(
                            "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                            formData.paymentMethod === method.id ? "border-primary" : "border-brand-gray-200"
                          )}>
                            {formData.paymentMethod === method.id && (
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            )}
                          </div>
                          <span className="font-bold text-brand-gray-800 text-sm">{method.label}</span>
                        </div>
                        {method.badge}
                      </div>
                      <p className="text-[11px] text-brand-gray-400 pl-6.5">{method.sub}</p>
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* Summary Section */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 space-y-6">
                <Card className="rounded-3xl border-brand-gray-100 shadow-xl shadow-brand-gray-100 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="bg-brand-gray-900 p-6 text-white">
                      <h3 className="text-xl font-black mb-1">Order Summary</h3>
                      <p className="text-white/60 text-xs font-medium uppercase tracking-widest">{items.length} Items in Cart</p>
                    </div>
                    
                    <div className="p-6 space-y-6">
                      <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {items.map((item) => (
                          <div key={item.id} className="flex gap-4">
                            <div className="relative w-16 h-16 rounded-xl bg-brand-gray-50 flex-shrink-0 overflow-hidden border border-brand-gray-100">
                              {item.image_url ? (
                               <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-6 h-6 text-brand-gray-200" /></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-brand-gray-900 truncate">{item.name}</h4>
                              <p className="text-xs text-brand-gray-500 mt-0.5">Qty: {item.quantity}</p>
                              <p className="text-sm font-black text-primary mt-1">{formatCurrency(item.price * item.quantity)}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Collapsible Promo Code */}
                      <div className="pt-4 border-t border-brand-gray-100">
                        {!appliedPromo ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setShowPromoInput(!showPromoInput)}
                              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                            >
                              Have a promo code?
                            </button>
                            
                            {showPromoInput && (
                              <div className="flex gap-2 mt-2">
                                <Input
                                  placeholder="ENTER CODE"
                                  value={promoCode}
                                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                  className="h-10 rounded-xl uppercase font-mono tracking-wider text-xs border-brand-gray-200"
                                />
                                <Button
                                  type="button"
                                  onClick={handleValidatePromo}
                                  disabled={isValidatingPromo || !promoCode.trim()}
                                  className="bg-primary hover:bg-primary/95 text-white h-10 px-4 rounded-xl text-xs font-bold shrink-0"
                                >
                                  {isValidatingPromo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Apply"}
                                </Button>
                              </div>
                            )}
                            {promoError && (
                              <p className="text-[11px] text-red-500 font-medium mt-1">{promoError}</p>
                            )}
                          </>
                        ) : (
                          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-brand-gray-500 font-semibold uppercase tracking-wider">Promo Code Applied:</span>
                              <p className="text-xs font-bold text-emerald-700 font-mono tracking-wider mt-0.5">{appliedPromo.code}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-emerald-600">-৳{appliedPromo.discountAmount}</span>
                              <button
                                type="button"
                                onClick={handleRemovePromo}
                                className="text-red-500 hover:text-red-700 text-xs font-bold"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 pt-6 border-t border-brand-gray-100">
                        <div className="flex justify-between text-sm">
                          <span className="text-brand-gray-500">Subtotal</span>
                          <span className="font-bold text-brand-gray-900">{formatCurrency(total)}</span>
                        </div>
                        {appliedPromo && (
                          <div className="flex justify-between text-sm text-emerald-600">
                            <span>Discount ({appliedPromo.code})</span>
                            <span className="font-bold">-৳{appliedPromo.discountAmount}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-brand-gray-500">Shipping</span>
                          <span className="text-emerald-500 font-bold uppercase text-[10px] tracking-widest">Free</span>
                        </div>
                        <div className="pt-4 border-t border-brand-gray-100 flex justify-between items-center">
                          <span className="text-lg font-black text-brand-gray-900">Total</span>
                          <span className="text-2xl font-black text-primary">{formatCurrency(finalTotal)}</span>
                        </div>
                      </div>

                      <Button 
                        form="checkout-form"
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-16 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-black text-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        {isSubmitting ? (
                          <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> Processing...</>
                        ) : (
                          <>Complete Order <ArrowRight className="w-5 h-5 ml-2" /></>
                        )}
                      </Button>

                      <div className="flex items-center justify-center gap-2 text-brand-gray-400">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Secure Checkout Powered by Parloora</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Return to Shop */}
                <Link 
                  href="/shop" 
                  className="flex items-center justify-center gap-2 text-brand-gray-500 hover:text-primary font-bold text-sm transition-colors py-2"
                >
                  <ChevronLeft className="w-4 h-4" /> Keep Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stripe Payment Modal */}
      <AnimatePresence>
        {showStripeModal && stripeClientSecret && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-brand-gray-100 overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-black text-brand-gray-900">Card Payment</h3>
                  <p className="text-xs text-brand-gray-400 font-bold uppercase tracking-wider mt-0.5">Enter details to complete purchase</p>
                </div>
                <button
                  onClick={() => setShowStripeModal(false)}
                  className="p-2 hover:bg-brand-gray-50 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-brand-gray-400" />
                </button>
              </div>

              <Elements
                stripe={getStripe()}
                options={{
                  clientSecret: stripeClientSecret,
                  appearance: {
                    theme: "stripe",
                    variables: {
                      colorPrimary: "#2D0072",
                      colorBackground: "#ffffff",
                      colorText: "#1F2937",
                      borderRadius: "12px",
                    },
                  },
                }}
              >
                <StripePaymentForm
                  amount={total}
                  onCancel={() => setShowStripeModal(false)}
                  onSuccess={handleStripeSuccess}
                />
              </Elements>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
