"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useCart } from "@/lib/store/useCart"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

interface CartDrawerProps {
  isOpen?: boolean
  onClose?: () => void
}

export function CartDrawer(props: CartDrawerProps) {
  const store = useCart()
  const isControlled = props.isOpen !== undefined
  const isOpen = isControlled ? props.isOpen : store.isOpen
  const onClose = props.onClose || store.closeCart

  const { items, updateQuantity, removeItem, totalPrice, totalItems } = store
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Lock body scroll when cart is open
  React.useEffect(() => {
    if (!isOpen) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  // Close on escape key
  React.useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [isOpen, onClose])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99998] pointer-events-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998]"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 bottom-0 h-screen h-[100dvh] max-h-[100dvh] w-full max-w-md bg-white shadow-2xl z-[99999] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 sm:p-6 border-b flex items-center justify-between bg-brand-gray-50/70 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-brand-gray-900 leading-tight">Your Cart</h2>
                  <p className="text-xs text-brand-gray-500 font-medium">
                    {totalItems()} {totalItems() === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close cart"
                className="p-2 hover:bg-brand-gray-200/60 rounded-full transition-colors text-brand-gray-500 hover:text-brand-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items List (Scrollable middle section) */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4">
              {items.length === 0 ? (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-brand-gray-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-brand-gray-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-brand-gray-900">Your cart is empty</h3>
                    <p className="text-sm text-brand-gray-500 max-w-[220px] mx-auto mt-1">
                      Explore our products and find premium beauty essentials.
                    </p>
                  </div>
                  <Button asChild onClick={onClose} variant="outline" className="rounded-xl mt-2">
                    <Link href="/shop">Start Shopping</Link>
                  </Button>
                </div>
              ) : (
                items.map((item) => {
                  const imageSrc = item.image_url || item.image
                  return (
                    <div
                      key={item.id}
                      className="flex gap-3.5 p-3 rounded-2xl bg-white border border-brand-gray-100 shadow-sm hover:border-brand-gray-200 transition-all"
                    >
                      {/* Product Thumbnail */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-brand-gray-100 shrink-0 relative flex items-center justify-center">
                        {imageSrc ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imageSrc}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none"
                            }}
                          />
                        ) : (
                          <ShoppingBag className="w-7 h-7 text-brand-gray-300" />
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-bold text-brand-gray-900 line-clamp-1 leading-snug">
                              {item.name}
                            </h4>
                            <p className="text-xs text-brand-gray-400 font-medium mt-0.5">
                              {item.brand || "Parloora Selection"}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            aria-label={`Remove ${item.name} from cart`}
                            className="text-brand-gray-400 hover:text-red-500 p-1 transition-colors rounded-md hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between pt-2 mt-1">
                          {/* Stepper */}
                          <div className="flex items-center gap-2 bg-brand-gray-50 border border-brand-gray-200 rounded-lg p-0.5">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              aria-label="Decrease quantity"
                              className="p-1 hover:bg-white rounded text-brand-gray-600 hover:text-brand-gray-900 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold w-5 text-center text-brand-gray-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              aria-label="Increase quantity"
                              className="p-1 hover:bg-white rounded text-brand-gray-600 hover:text-brand-gray-900 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Price */}
                          <span className="font-bold text-sm text-brand-gray-900">
                            {formatCurrency(Number(item.price) * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer / Checkout */}
            {items.length > 0 && (
              <div className="p-5 sm:p-6 border-t bg-brand-gray-50/70 shrink-0 mt-auto space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-brand-gray-500 font-semibold text-sm">Subtotal</span>
                  <span className="text-xl font-black text-brand-gray-900">
                    {formatCurrency(totalPrice())}
                  </span>
                </div>
                <p className="text-[10px] text-brand-gray-400 text-center uppercase font-bold tracking-wider">
                  Shipping and taxes calculated at checkout
                </p>
                <div className="grid gap-2.5">
                  <Button
                    asChild
                    className="w-full h-13 py-3.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold text-base shadow-lg shadow-primary/20 hover:opacity-95 active:scale-[0.99] transition-all"
                  >
                    <Link href="/checkout" onClick={onClose}>
                      Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2 inline" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={onClose}
                    className="w-full text-brand-gray-500 hover:text-brand-gray-900 rounded-xl"
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default CartDrawer
