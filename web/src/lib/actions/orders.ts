"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin"
import { Database } from "@/types/supabase"
import { revalidatePath } from "next/cache"
import { createNotification } from "./notifications"
import { requireSeller, requireUser } from "@/lib/auth-guard"

type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"]

export async function createOrder(orderData: OrderInsert & { promo_code?: string }) {
  // Enforce customer authentication: must be logged in to place an order
  const { user } = await requireUser()
  const authClient = await createClient()

  const finalCustomerId = user.id || orderData.customer_id
  if (!finalCustomerId) {
    return { success: false, error: "Authentication required. Please log in or sign up to place an order." }
  }

  // Use service role client if configured to bypass RLS, otherwise fallback to server client
  const supabase = hasServiceRoleKey() ? createAdminClient() : authClient

  // 1. Validate items array
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawItems = Array.isArray(orderData.items) ? (orderData.items as any[]) : []
  if (!rawItems || rawItems.length === 0) {
    return { success: false, error: "Cannot create an order with an empty cart." }
  }

  // 2. Query products from database to revalidate authentic prices and stock
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const productIds = rawItems.map((item: any) => item.id).filter(Boolean)
  if (productIds.length !== rawItems.length) {
    return { success: false, error: "One or more items in cart have invalid product identifiers." }
  }

  const { data: dbProducts, error: prodErr } = await supabase
    .from("products")
    .select("id, name, price, stock, is_active, seller_id, image_url")
    .in("id", productIds)

  if (prodErr || !dbProducts) {
    console.error("Failed to verify cart products from database:", prodErr)
    return { success: false, error: "Failed to verify cart products. Please try again." }
  }

  const productMap = new Map(dbProducts.map((p) => [p.id, p]))

  // 3. Verify stock availability and build verified item snapshot
  let calculatedSubtotal = 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const verifiedItems: any[] = []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const item of rawItems as any[]) {
    const dbProd = productMap.get(item.id)
    if (!dbProd) {
      return { success: false, error: `Product "${item.name || item.id}" was not found or is no longer sold.` }
    }
    if (!dbProd.is_active) {
      return { success: false, error: `Product "${dbProd.name}" is currently unavailable.` }
    }
    const requestedQty = Number(item.quantity) || 1
    if (requestedQty <= 0) {
      return { success: false, error: `Invalid quantity for product "${dbProd.name}".` }
    }
    const currentStock = Number(dbProd.stock) || 0
    if (currentStock < requestedQty) {
      return {
        success: false,
        error: `Insufficient stock for "${dbProd.name}". Available: ${currentStock}, Requested: ${requestedQty}.`,
      }
    }

    const verifiedPrice = Number(dbProd.price) || 0
    calculatedSubtotal += verifiedPrice * requestedQty

    verifiedItems.push({
      id: dbProd.id,
      name: dbProd.name,
      price: verifiedPrice,
      quantity: requestedQty,
      seller_id: dbProd.seller_id,
      image_url: dbProd.image_url,
    })
  }

  // 4. Server-side promo code validation
  let discountAmount = 0
  if (orderData.promo_code) {
    const { validatePromoCode } = await import("./promo")
    const promoRes = await validatePromoCode(orderData.promo_code, "products", calculatedSubtotal)
    if (promoRes.success && promoRes.discountAmount) {
      discountAmount = promoRes.discountAmount
    }
  }

  // 5. Calculate verified total on the server (Standard Bangladesh shipping: ৳60)
  const shippingFee = 60
  const calculatedTotal = Math.max(0, calculatedSubtotal - discountAmount + shippingFee)

  // 6. Atomically decrement stock in database for purchased items
  for (const vItem of verifiedItems) {
    const dbProd = productMap.get(vItem.id)!
    const newStock = Math.max(0, (dbProd.stock || 0) - vItem.quantity)
    const { error: stockErr } = await supabase
      .from("products")
      .update({ stock: newStock })
      .eq("id", vItem.id)

    if (stockErr) {
      console.error(`Failed to decrement stock for product ${vItem.id}:`, stockErr)
    }
  }

  // 7. Insert the verified order record
  const verifiedOrderRecord = {
    customer_id: finalCustomerId,
    customer_name: orderData.customer_name || user.user_metadata?.display_name || "Valued Customer",
    phone: orderData.phone || user.user_metadata?.phone || "",
    address: orderData.address || "",
    total_amount: calculatedTotal,
    status: orderData.status || "Pending",
    payment_method: orderData.payment_method || "Cash on Delivery",
    items: verifiedItems,
    items_count: verifiedItems.reduce((acc, it) => acc + it.quantity, 0),
    delivery_method: orderData.delivery_method || "Standard Shipping",
  }

  const { data, error } = await supabase
    .from("orders")
    .insert([verifiedOrderRecord])
    .select()
    .single()

  if (error) {
    console.error("Error creating order:", error)
    return { success: false, error: error.message }
  }

  // 8. Notifications to customer and vendors
  if (data) {
    // Clear abandoned cart tracking for this customer
    try {
      const { clearCartActivity } = await import("./cart-recovery")
      await clearCartActivity()
    } catch {
      // Non-blocking
    }

    await createNotification({
      user_id: finalCustomerId,
      title: "Order Placed Successfully",
      message: `Your order #${data.id.slice(0, 8)} for ৳${calculatedTotal} has been placed.`,
      type: "order",
      link: "/dashboard",
    })

    const vendorIds = new Set(verifiedItems.map((it) => it.seller_id).filter(Boolean))
    for (const vId of vendorIds) {
      await createNotification({
        user_id: vId,
        title: "New Product Order Received",
        message: `You received a new product order #${data.id.slice(0, 8)}.`,
        type: "order",
        link: "/seller/orders",
      })
    }
  }

  revalidatePath("/dashboard")
  revalidatePath("/seller/orders")
  revalidatePath("/shop")
  
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
