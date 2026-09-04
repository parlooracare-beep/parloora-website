"use server"

import { createClient } from "@/lib/supabase/server"

/**
 * Retrieves the total earnings, commissions, and withdrawal summary for a seller.
 * Net Balance = (Accrued Earnings - Accrued Platform Commissions) - (Approved Withdrawals)
 */
export async function getSellerAccruedBalance() {
  const supabase = await createClient()

  // Get active user session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Unauthorized access. Seller profile missing.")
  }

  // 1. Fetch seller parlour and its commission rate
  const { data: parlour, error: parlourErr } = await supabase
    .from("parlours")
    .select("id, commission_rate")
    .eq("owner_id", user.id)
    .single()

  if (parlourErr || !parlour) {
    return {
      success: true,
      accruedGross: 0,
      commissionPaid: 0,
      withdrawn: 0,
      pendingPayouts: 0,
      netBalance: 0,
    }
  }

  const commissionPercent = parlour.commission_rate !== null && parlour.commission_rate !== undefined
    ? Number(parlour.commission_rate)
    : 10 // default 10%

  // 2. Fetch all successful (paid or completed) bookings for this parlour
  const { data: bookings } = await (supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("bookings" as any)
    .select("amount, status, payment_status")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .eq("parlour_id", parlour.id) as any)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const successfulBookings = (bookings as any[])?.filter(
    (b) => b.payment_status === "paid" || b.status === "completed" || b.status === "confirmed"
  ) || []

  const accruedGross = successfulBookings.reduce((sum, b) => sum + Number(b.amount || 0), 0)
  const commissionPaid = accruedGross * (commissionPercent / 100)
  const netSellerEarnings = accruedGross - commissionPaid

  // 3. Fetch all payout requests for this seller
  const { data: payouts } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("payout_requests" as any)
    .select("amount, status")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .eq("seller_id", user.id) as any

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const approvedPayoutRequests = payouts?.filter((p: any) => p.status === "approved") || []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendingPayoutRequests = payouts?.filter((p: any) => p.status === "pending") || []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const withdrawn = approvedPayoutRequests.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendingPayouts = pendingPayoutRequests.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0)

  const netBalance = Math.max(0, netSellerEarnings - withdrawn)

  return {
    success: true,
    accruedGross,
    commissionPaid,
    withdrawn,
    pendingPayouts,
    netBalance,
  }
}

/**
 * Submits a new withdrawal request for a seller.
 * Checks against their current net balance to prevent over-withdrawing.
 */
export async function createPayoutRequest(payload: {
  amount: number
  paymentMethod: 'bkash' | 'bank_transfer'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  paymentDetails: any
}) {
  const supabase = await createClient()

  // Get active user session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Authentication required to request payouts." }
  }

  // 1. Fetch parlour details
  const { data: parlour } = await supabase
    .from("parlours")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  if (!parlour) {
    return { success: false, error: "No associated parlour listing found." }
  }

  // 2. Calculate balance
  const balanceDetails = await getSellerAccruedBalance()
  if (payload.amount > balanceDetails.netBalance) {
    return {
      success: false,
      error: `Insufficient balance. Maximum withdrawable amount is ৳${balanceDetails.netBalance.toLocaleString()}.`,
    }
  }

  // 3. Insert withdrawal request
  const { data, error } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("payout_requests" as any)
    .insert({
      seller_id: user.id,
      parlour_id: parlour.id,
      amount: payload.amount,
      payment_method: payload.paymentMethod,
      payment_details: payload.paymentDetails,
      status: "pending",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    .select()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .single() as any

  if (error) {
    console.error("Error creating payout request:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

/**
 * Admin Action: Retrieves all payout requests.
 */
export async function getAdminPayoutRequests() {
  const supabase = await createClient()

  const { data, error } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("payout_requests" as any)
    .select(`
      *,
      users:seller_id (
        email,
        display_name
      ),
      parlours:parlour_id (
        name
      )
    `)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .order("created_at", { ascending: false }) as any

  if (error) {
    console.error("Error fetching payout requests:", error)
    return []
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((item: any) => ({
    id: item.id,
    sellerId: item.seller_id,
    sellerName: item.users?.display_name || "Seller",
    sellerEmail: item.users?.email,
    parlourName: item.parlours?.name || "Beauty Parlour",
    amount: Number(item.amount),
    status: item.status,
    paymentMethod: item.payment_method,
    paymentDetails: item.payment_details,
    notes: item.notes,
    createdAt: item.created_at,
  }))
}

/**
 * Admin Action: Approves or rejects a withdrawal request.
 */
export async function updatePayoutStatus(payoutId: string, status: "approved" | "rejected", notes?: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("payout_requests" as any)
    .update({
      status,
      notes,
      updated_at: new Date().toISOString(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    .eq("id", payoutId)
    .select()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .single() as any

  if (error) {
    console.error("Error updating payout request status:", error)
    return { success: false, error: error.message }
  }

  // Create notification for the seller
  if (data) {
    const { createNotification } = await import("./notifications")
    const statusLabel = status === "approved" ? "Approved ✅" : "Rejected ❌"
    
    await createNotification({
      user_id: data.seller_id,
      title: `Withdrawal Request ${statusLabel}`,
      message: `Your payout request of ৳${data.amount.toLocaleString()} has been ${status}. ${notes ? `Notes: ${notes}` : ""}`,
      type: "system",
      link: "/seller/payouts",
    })
  }

  return { success: true, data }
}
