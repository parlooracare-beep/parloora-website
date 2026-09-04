"use server"

import { createClient } from "@/lib/supabase/server"

export async function getAdminMetrics() {
  const supabase = await createClient()

  // 1. Total Revenue (sum of confirmed bookings)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("amount, status")
    
  const confirmedBookings = bookings?.filter(b => b.status?.toLowerCase() === 'confirmed' || b.status?.toLowerCase() === 'completed') || []
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.amount || 0), 0) || 0

  const { data: parloursData } = await supabase
    .from("parlours")
    .select("status")

  const activeParloursCount = parloursData?.filter(p => p.status?.toLowerCase() === 'active').length || 0
  const pendingParloursCount = parloursData?.filter(p => p.status?.toLowerCase() === 'pending').length || 0

  // 4. Recent Transactions
  const { data: recentTransactions } = await supabase
    .from("bookings")
    .select("id, parlour_name, created_at, amount, status")
    .order("created_at", { ascending: false })
    .limit(5)

  // 5. Registered Users
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { count: userCount, error: userCountError } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })

  return {
    totalRevenue,
    activeParloursCount: activeParloursCount || 0,
    pendingParloursCount: pendingParloursCount || 0,
    registeredUsersCount: userCount || 0,
    recentTransactions: recentTransactions || []
  }
}

export async function getAdminUsers() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching admin users:", error)
    return []
  }

  return data.map(u => ({
    id: u.id,
    name: u.display_name || "Unknown",
    email: u.email,
    phone: u.phone || "N/A",
    role: u.role,
    joined_at: u.created_at
  }))
}

export async function getAdminTransactions() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching transactions:", error)
    return []
  }

  return data
}

export async function getAdminParlours() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("parlours")
    .select(`
      *,
      users:owner_id (
        email,
        display_name,
        phone
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching parlours:", error)
    return []
  }

  return data.map(p => ({
    ...p,
    owner_email: p.users?.email,
    owner_name: p.users?.display_name,
    owner_phone: p.users?.phone
  }))
}

export async function getAdminServices() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("services")
    .select(`
      *,
      parlours (
        name,
        city
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching admin services:", error)
    return []
  }

  return data
}

export async function getAdminProducts() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      parlours (
        name,
        city
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching admin products:", error)
    return []
  }

  return data
}

export async function getAdminOrders() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      users (
        display_name,
        email
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching admin orders:", error)
    return []
  }

  return data
}

export async function updateParlourStatus(parlourId: string, status: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("parlours").update({ status }).eq("id", parlourId).select().single()
  if (error) return { success: false, error: error.message }
  
  // Update embedding
  try {
    const { updateParlourEmbedding } = await import("@/lib/embeddings")
    await updateParlourEmbedding(parlourId)
  } catch (embedError) {
    console.error("Error generating embedding after status update:", embedError)
  }

  return { success: true, data }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateAdminEntity(table: string, id: string, payload: any) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await supabase.from(table as any).update(payload).eq("id", id).select().single()
  if (error) return { success: false, error: error.message }
  
  // If it's a parlour update, update the embedding
  if (table === "parlours") {
    try {
      const { updateParlourEmbedding } = await import("@/lib/embeddings")
      await updateParlourEmbedding(id)
    } catch (embedError) {
      console.error("Error generating embedding after entity update:", embedError)
    }
  }

  return { success: true, data }
}

export async function deleteAdminEntity(table: string, id: string) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase.from(table as any).delete().eq("id", id)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function deleteAdminUser(id: string) {
  return deleteAdminEntity("users", id)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateAdminUser(id: string, payload: any) {
  const supabase = await createClient()
  const { error } = await supabase.from("users").update(payload).eq("id", id)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateAdminParlour(id: string, payload: any) {
  const supabase = await createClient()
  const { error } = await supabase.from("parlours").update(payload).eq("id", id)
  if (error) return { success: false, error: error.message }
  
  // Update embedding
  try {
    const { updateParlourEmbedding } = await import("@/lib/embeddings")
    await updateParlourEmbedding(id)
  } catch (embedError) {
    console.error("Error generating embedding after admin update:", embedError)
  }

  return { success: true }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateAdminService(id: string, payload: any) {
  const supabase = await createClient()
  const { error } = await supabase.from("services").update(payload).eq("id", id)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createAdminService(payload: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("services")
    .insert(payload)
    .select()
    .single()
  
  if (error) {
    console.error("Error creating admin service:", error)
    return { success: false, error: error.message }
  }
  return { success: true, data }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateAdminProduct(id: string, payload: any) {
  const supabase = await createClient()
  const { error } = await supabase.from("products").update(payload).eq("id", id)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createAdminProduct(payload: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .insert(payload)
    .select()
    .single()
  
  if (error) {
    console.error("Error creating admin product:", error)
    return { success: false, error: error.message }
  }
  return { success: true, data }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateAdminBooking(id: string, payload: any) {
  const supabase = await createClient()
  const { error } = await supabase.from("bookings").update(payload).eq("id", id)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateAdminOrder(id: string, payload: any) {
  const supabase = await createClient()
  const { error } = await supabase.from("orders").update(payload).eq("id", id)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function getAdminReportsData() {
  const supabase = await createClient()

  // Basic Counts
  const { count: users } = await supabase.from("users").select("*", { count: "exact", head: true })
  const { count: parlours } = await supabase.from("parlours").select("*", { count: "exact", head: true })
  const { count: bookings } = await supabase.from("bookings").select("*", { count: "exact", head: true })

  // Total Revenue & Monthly Data
  const { data: allBookings } = await supabase
    .from("bookings")
    .select("amount, created_at, status")
  
  const confirmedBookings = allBookings?.filter(b => b.status === "confirmed" || b.status === "completed") || []
  const revenue = confirmedBookings.reduce((sum, b) => sum + (b.amount || 0), 0)

  // Monthly breakdown
  const monthlyDataMap: Record<string, { revenue: number, bookings: number }> = {}
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  
  confirmedBookings.forEach(b => {
    const d = new Date(b.created_at)
    const m = months[d.getMonth()]
    if (!monthlyDataMap[m]) monthlyDataMap[m] = { revenue: 0, bookings: 0 }
    monthlyDataMap[m].revenue += (b.amount || 0)
    monthlyDataMap[m].bookings += 1
  })

  // Format array for chart, keeping last 7 months relative to current date (or just all 12 if data is sparse)
  const currentMonthIdx = new Date().getMonth()
  const REVENUE_DATA = []
  for (let i = 6; i >= 0; i--) {
    let mIdx = currentMonthIdx - i
    if (mIdx < 0) mIdx += 12
    const mName = months[mIdx]
    REVENUE_DATA.push({
      name: mName,
      revenue: monthlyDataMap[mName]?.revenue || 0,
      bookings: monthlyDataMap[mName]?.bookings || 0
    })
  }

  // Categories Distribution (mocked if no services, otherwise counting services by category)
  const { data: services } = await supabase.from("services").select("category")
  const categoryMap: Record<string, number> = {}
  services?.forEach(s => {
    const category = s.category || "Uncategorized"
    if (!categoryMap[category]) categoryMap[category] = 0
    categoryMap[category] += 1
  })
  
  const colors = ["#4B1E6D", "#E6B7A9", "#D4A373", "#C8A2D6", "#9D4EDD"]
  const CATEGORY_DATA = Object.keys(categoryMap).map((k, i) => ({
    name: k,
    value: categoryMap[k],
    color: colors[i % colors.length]
  }))

  if (CATEGORY_DATA.length === 0) {
    CATEGORY_DATA.push(
      { name: "Hair Care", value: 45, color: "#4B1E6D" },
      { name: "Skin Care", value: 30, color: "#E6B7A9" }
    )
  }

  // Top Parlours
  const { data: topParloursData } = await supabase
    .from("parlours")
    .select("name, city, rating, total_bookings")
    .order("total_bookings", { ascending: false })
    .limit(4)

  const topParlours = topParloursData?.map(p => ({
    name: p.name,
    city: p.city,
    bookings: p.total_bookings || 0,
    revenue: `$${((p.total_bookings || 0) * 50).toLocaleString()}`, // rough estimation
    rating: p.rating || 0,
    avatar: p.name.substring(0, 2).toUpperCase()
  })) || []

  // Recent Activity
  const { data: recent } = await supabase
    .from("bookings")
    .select("customer_name, parlour_name, amount, status, created_at")
    .order("created_at", { ascending: false })
    .limit(4)

  const recentActivity = recent?.map(r => ({
    type: "Booking",
    user: r.customer_name || "Unknown",
    target: r.parlour_name || "Platform",
    amount: `৳${r.amount?.toLocaleString() || 0}`,
    status: r.status === "confirmed" ? "Success" : r.status === "pending" ? "Pending" : "Failed",
    time: new Date(r.created_at).toLocaleDateString()
  })) || []

  return {
    stats: {
      users: users || 0,
      parlours: parlours || 0,
      bookings: bookings || 0,
      revenue
    },
    revenueData: REVENUE_DATA,
    categoryData: CATEGORY_DATA,
    topParlours,
    recentActivity
  }
}

export async function getAdminActivityLogs() {
  const supabase = await createClient()

  // Authenticate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role?.toLowerCase() !== "admin") {
    return []
  }

  const { data, error } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("activity_logs" as any)
    .select(`
      *,
      users:user_id (
        email,
        display_name
      )
    `)
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) {
    console.error("Error fetching activity logs:", error)
    return []
  }

  return data
}
