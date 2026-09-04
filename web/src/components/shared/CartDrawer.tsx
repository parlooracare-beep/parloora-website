"use client"

import * as React from "react"
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useCart } from "@/lib/store/useCart"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, totalPrice, totalItems } = useCart()

  // Close on escape key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b flex items-center justify-between bg-brand-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-brand-gray-900">Your Cart</h2>
                  <p className="text-xs text-brand-gray-500 font-medium">{totalItems()} items</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-brand-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-brand-gray-500" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-brand-gray-50 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-brand-gray-200" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-brand-gray-900">Your cart is empty</h3>
                    <p className="text-sm text-brand-gray-500 max-w-[200px] mx-auto">
                      Looks like you haven't added any products yet.
                    </p>
                  </div>
                  <Button onClick={onClose} variant="outline" className="rounded-xl">
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="w-20 h-20 bg-brand-gray-100 rounded-xl overflow-hidden flex-shrink-0 relative">
                      {item.image_url || item.image ? (
                        <Image
                          src={item.image_url || item.image || ""}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-brand-gray-300">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between">
                        <h4 className="text-sm font-bold text-brand-gray-900 line-clamp-1">{item.name}</h4>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-brand-gray-400 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-brand-gray-500">{item.brand || "Parloora Selection"}</p>
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-3 bg-brand-gray-50 rounded-lg p-1 border">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-white rounded-md transition-colors"
                          >
                            <Minus className="w-3 h-3 text-brand-gray-600" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-white rounded-md transition-colors"
                          >
                            <Plus className="w-3 h-3 text-brand-gray-600" />
                          </button>
                        </div>
                        <span className="font-bold text-sm text-brand-gray-900">
                          {formatCurrency(Number(item.price) * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t bg-brand-gray-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-brand-gray-500 font-medium">Subtotal</span>
                  <span className="text-xl font-black text-brand-gray-900">{formatCurrency(totalPrice())}</span>
                </div>
                <p className="text-[10px] text-brand-gray-400 text-center uppercase font-bold tracking-widest">
                  Shipping and taxes calculated at checkout
                </p>
                <div className="grid gap-3">
                  <Button asChild className="w-full h-14 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                    <Link href="/checkout" onClick={onClose}>
                      Proceed to Checkout <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={onClose}
                    className="w-full text-brand-gray-500 hover:text-brand-gray-900"
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
