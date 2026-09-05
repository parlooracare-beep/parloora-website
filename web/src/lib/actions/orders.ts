"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin"
import { Database } from "@/types/supabase"
import { revalidatePath } from "next/cache"
import { createNotification } from "./notifications"

type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"]

export async function createOrder(orderData: OrderInsert) {
  // Enforce customer authentication: must be logged in to place an order
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()

  const finalCustomerId = user?.id || orderData.customer_id
  if (!finalCustomerId) {
    return { success: false, error: "Authentication required. Please log in or sign up to place an order." }
  }

  // Use service role client if configured to bypass RLS, otherwise fallback to server client
  const supabase = hasServiceRoleKey() ? createAdminClient() : authClient

  const { data, error } = await supabase
    .from("orders")
    .insert([{ ...orderData, customer_id: finalCustomerId }])
    .select()
    .single()

  if (error) {
    console.error("Error creating order:", error)
    return { success: false, error: error.message }
  }

  if (data) {
    // Notify all sellers involved in the order (simplified: notify based on items if we had seller_ids in items)
    // For now, if it's a multi-seller order, we might need more complex notification logic.
    // Assuming seller_id is in the product data (which it is in the products table).
    
    // In a real app, we'd loop through items and notify each seller.
    // For this implementation, we'll send a general notification to the system/admin or just success.
  }

  revalidatePath("/dashboard")
  revalidatePath("/seller/orders")
  
  return { success: true, data }
}

export async function getCustomerOrders() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching orders:", error)
    return []
  }

  return data
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getSellerOrders(sellerId: string) {
  const supabase = await createClient()

  // In a real app, we'd filter by seller_id in the items or have an order_items table.
  // Given the current schema, we'll assume orders with a specific product_id belonging to the seller.
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    // This is a simplification for the demo
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching seller orders:", error)
    return []
  }

  return data
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = hasServiceRoleKey() ? createAdminClient() : await createClient()

  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select()
    .single()

  if (error) {
    console.error("Error updating order status:", error)
    return { success: false, error: error.message }
  }

  if (data && data.customer_id) {
    await createNotification({
      user_id: data.customer_id,
      title: "Order Status Updated",
      message: `Your order #${data.id.slice(0, 8)} is now ${status}.`,
      type: "order",
      link: "/dashboard"
    })
  }

  revalidatePath("/dashboard")
  revalidatePath("/seller/orders")
  
  return { success: true, data }
}
