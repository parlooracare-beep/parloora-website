import { create } from "zustand"
import { persist } from "zustand/middleware"
import { Database } from "@/types/supabase"

type Product = Database["public"]["Tables"]["products"]["Row"]

export interface CartItem extends Product {
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, qty = 1) => {
        const currentItems = get().items
        const existingItem = currentItems.find((item) => item.id === product.id)
        
        if (existingItem) {
          set({
            items: currentItems.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + qty }
                : item
            ),
          })
        } else {
          set({ items: [...currentItems, { ...product, quantity: qty }] })
        }
      },
      
      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.id !== productId),
        })
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        
        set({
          items: get().items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        })
      },
      
      clearCart: () => set({ items: [] }),
      
      totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      
      totalPrice: () => {
        return get().items.reduce(
          (total, item) => total + Number(item.price) * item.quantity,
          0
        )
      },
    }),
    {
      name: "parloora-cart-storage",
    }
  )
)
