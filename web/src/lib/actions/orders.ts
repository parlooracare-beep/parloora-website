"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin"
import { Database } from "@/types/supabase"
import { revalidatePath } from "next/cache"
import { createNotification } from "./notifications"
import { requireSeller, requireUser } from "@/lib/auth-guard"

type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"]

export async function createOrder(orderData: OrderInsert) {
  // Enforce customer authentication: must be logged in to place an order
  const { user } = await requireUser()
  const authClient = await createClient()

  const finalCustomerId = user.id || orderData.customer_id
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

export async function getSellerOrders(sellerId: string) {
  // Enforce seller or admin authentication
  const { user, role } = await requireSeller()
  const targetSellerId = role === "admin" && sellerId ? sellerId : user.id

  const supabase = hasServiceRoleKey() ? createAdminClient() : await createClient()

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching seller orders:", error)
    return []
  }

  if (!data) return []

  // If super admin viewing without specific filter, return all
  if (role === "admin" && !sellerId) {
    return data
  }

  interface CartOrderItem {
    id?: string
    seller_id?: string
    price?: number
    quantity?: number
    [key: string]: unknown
  }

  interface RawOrderRecord {
    id: string
    items: unknown
    [key: string]: unknown
  }

  // Vendor isolation: Filter orders that contain products belonging to targetSellerId
  const filteredOrders = (data as unknown as RawOrderRecord[]).filter((order) => {
    if (!Array.isArray(order.items)) return false
    return (order.items as CartOrderItem[]).some((item) => item?.seller_id === targetSellerId)
  }).map((order) => {
    const rawItems = (order.items as CartOrderItem[])
    const sellerItems = rawItems.filter((item) => item?.seller_id === targetSellerId)
    const sellerSubtotal = sellerItems.reduce(
      (sum: number, item) => sum + Number(item.price || 0) * (item.quantity || 1),
      0
    )
    return {
      ...order,
      items: sellerItems,
      seller_subtotal: sellerSubtotal,
    }
  })

  return filteredOrders
}

export async function updateOrderStatus(orderId: string, status: string) {
  const { user, role } = await requireSeller()
  const supabase = hasServiceRoleKey() ? createAdminClient() : await createClient()

  // Verify the order exists and caller has authority over it
  const { data: existingOrder, error: fetchError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle()

  if (fetchError || !existingOrder) {
    return { success: false, error: "Order not found." }
  }

  if (role !== "admin") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = Array.isArray(existingOrder.items) ? (existingOrder.items as any[]) : []
    const isOwnerOfItem = items.some((item) => item?.seller_id === user.id)
    if (!isOwnerOfItem) {
      return { success: false, error: "Forbidden: You are not authorized to update this order." }
    }
  }

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
