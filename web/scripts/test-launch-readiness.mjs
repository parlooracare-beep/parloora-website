import test from "node:test"
import assert from "node:assert/strict"

// ─── 1. Business Logic: Time & 24h Decimal Parsing ────────────────────────────
function parseTimeToHours(timeStr) {
  if (!timeStr) return null
  const ampm = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (ampm) {
    let hours = parseInt(ampm[1], 10)
    const mins = parseInt(ampm[2], 10)
    const period = ampm[3].toUpperCase()
    if (period === "AM" && hours === 12) hours = 0
    if (period === "PM" && hours !== 12) hours += 12
    return hours + mins / 60
  }
  const h24 = timeStr.match(/^(\d{1,2}):(\d{2})$/)
  if (h24) {
    return parseInt(h24[1], 10) + parseInt(h24[2], 10) / 60
  }
  return null
}

test("Time Parsing handles 12h AM/PM and 24h formats accurately", () => {
  assert.equal(parseTimeToHours("10:00 AM"), 10.0)
  assert.equal(parseTimeToHours("10:30 AM"), 10.5)
  assert.equal(parseTimeToHours("12:00 PM"), 12.0)
  assert.equal(parseTimeToHours("12:00 AM"), 0.0)
  assert.equal(parseTimeToHours("02:45 PM"), 14.75)
  assert.equal(parseTimeToHours("14:30"), 14.5)
  assert.equal(parseTimeToHours("invalid"), null)
})

// ─── 2. Business Logic: 24h Advance Cancellation Policy ───────────────────────
function canCancelBooking(dateStr, timeStr, currentDateTime) {
  const timeInHours = parseTimeToHours(timeStr)
  if (timeInHours === null) return false
  const [year, month, day] = dateStr.split("-").map(Number)
  const bookingDateTime = new Date(year, month - 1, day)
  bookingDateTime.setHours(Math.floor(timeInHours), Math.round((timeInHours % 1) * 60), 0, 0)
  const diffInHours = (bookingDateTime.getTime() - currentDateTime.getTime()) / (1000 * 60 * 60)
  return diffInHours >= 24
}

test("Cancellation enforces 24-hour window requirement", () => {
  const now = new Date("2026-10-28T10:00:00Z")
  // 48 hours in the future -> allowed
  assert.equal(canCancelBooking("2026-10-30", "10:00 AM", now), true)
  // 12 hours in the future -> disallowed
  assert.equal(canCancelBooking("2026-10-28", "10:00 PM", now), false)
  // Past date -> disallowed
  assert.equal(canCancelBooking("2026-10-27", "10:00 AM", now), false)
})

// ─── 3. Business Logic: Promo Code Calculation ────────────────────────────────
function calculatePromoDiscount(subtotal, promo) {
  if (!promo || !promo.is_active) return { discount: 0, final: subtotal }
  if (promo.min_spend && subtotal < promo.min_spend) {
    return { discount: 0, final: subtotal, error: "Minimum spend requirement not met" }
  }
  let discount = 0
  if (promo.type === "percentage") {
    discount = (subtotal * promo.value) / 100
    if (promo.max_discount && discount > promo.max_discount) {
      discount = promo.max_discount
    }
  } else if (promo.type === "fixed") {
    discount = promo.value
  }
  discount = Math.min(discount, subtotal)
  return { discount, final: Math.max(0, subtotal - discount) }
}

test("Promo code discount calculates percentage, caps, and fixed amounts", () => {
  // 20% off 1000 BDT with max 150 BDT cap
  const p1 = { is_active: true, type: "percentage", value: 20, max_discount: 150, min_spend: 500 }
  const res1 = calculatePromoDiscount(1000, p1)
  assert.equal(res1.discount, 150)
  assert.equal(res1.final, 850)

  // Min spend threshold test
  const res2 = calculatePromoDiscount(400, p1)
  assert.equal(res2.discount, 0)
  assert.equal(res2.error, "Minimum spend requirement not met")

  // Fixed discount 200 BDT
  const p2 = { is_active: true, type: "fixed", value: 200, min_spend: 300 }
  const res3 = calculatePromoDiscount(500, p2)
  assert.equal(res3.discount, 200)
  assert.equal(res3.final, 300)
})

// ─── 4. Security & Role Matrix Verification ───────────────────────────────────
const PROTECTED_ROUTES = [
  { prefix: '/admin', allowedRoles: ['admin'] },
  { prefix: '/seller', allowedRoles: ['seller', 'admin'] },
  { prefix: '/checkout', allowedRoles: ['customer', 'seller', 'admin'] },
  { prefix: '/bookings', allowedRoles: ['customer', 'seller', 'admin'] },
  { prefix: '/orders', allowedRoles: ['customer', 'seller', 'admin'] },
  { prefix: '/dashboard', allowedRoles: ['customer', 'seller', 'admin'] },
]

const PUBLIC_SELLER_ROUTES = ['/seller/register', '/seller/pricing', '/seller/resources']

function canAccessRoute(pathname, userRole) {
  // Public exceptions under /seller
  if (PUBLIC_SELLER_ROUTES.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return true
  }
  if (pathname === '/seller/pending') {
    return !!userRole // Accessible to any authenticated user waiting for approval
  }
  const matched = PROTECTED_ROUTES.find(r => pathname.startsWith(r.prefix))
  if (!matched) return true // Public route
  if (!userRole) return false // Unauthenticated blocked from protected routes
  return matched.allowedRoles.includes(userRole.toLowerCase())
}

test("Role protection matrix isolates admin, seller portal, and customer areas", () => {
  // Anonymous tests
  assert.equal(canAccessRoute("/", null), true)
  assert.equal(canAccessRoute("/parlours", null), true)
  assert.equal(canAccessRoute("/about", null), true)
  assert.equal(canAccessRoute("/seller/register", null), true)
  assert.equal(canAccessRoute("/seller/pricing", null), true)
  assert.equal(canAccessRoute("/seller/resources", null), true)
  assert.equal(canAccessRoute("/admin", null), false)
  assert.equal(canAccessRoute("/seller/dashboard", null), false)
  assert.equal(canAccessRoute("/bookings", null), false)

  // Customer role tests
  assert.equal(canAccessRoute("/dashboard", "customer"), true)
  assert.equal(canAccessRoute("/bookings", "customer"), true)
  assert.equal(canAccessRoute("/seller/register", "customer"), true) // Can sign up as seller
  assert.equal(canAccessRoute("/seller/pending", "customer"), true)  // Can see pending status
  assert.equal(canAccessRoute("/seller/dashboard", "customer"), false) // Blocked from portal
  assert.equal(canAccessRoute("/admin", "customer"), false) // Blocked from admin

  // Seller role tests
  assert.equal(canAccessRoute("/seller/dashboard", "seller"), true)
  assert.equal(canAccessRoute("/seller/bookings", "seller"), true)
  assert.equal(canAccessRoute("/admin", "seller"), false) // Blocked from super admin

  // Admin role tests
  assert.equal(canAccessRoute("/admin/dashboard", "admin"), true)
  assert.equal(canAccessRoute("/seller/dashboard", "admin"), true)
  assert.equal(canAccessRoute("/dashboard", "admin"), true)
})

// ─── 5. Double Booking Conflict Detection ─────────────────────────────────────
function hasSlotConflict(existingBookings, newBooking) {
  return existingBookings.some(b => 
    b.parlour_id === newBooking.parlour_id &&
    b.date === newBooking.date &&
    b.time === newBooking.time &&
    !['cancelled', 'rejected'].includes(b.status)
  )
}

test("Double booking detection prevents concurrent conflicting reservations", () => {
  const existing = [
    { parlour_id: "p1", date: "2026-10-30", time: "10:00 AM", status: "confirmed" },
    { parlour_id: "p1", date: "2026-10-30", time: "11:00 AM", status: "cancelled" },
  ]

  // Same slot with active booking -> conflict!
  assert.equal(hasSlotConflict(existing, { parlour_id: "p1", date: "2026-10-30", time: "10:00 AM" }), true)
  // Same slot where previous was cancelled -> available!
  assert.equal(hasSlotConflict(existing, { parlour_id: "p1", date: "2026-10-30", time: "11:00 AM" }), false)
  // Different time slot -> available!
  assert.equal(hasSlotConflict(existing, { parlour_id: "p1", date: "2026-10-30", time: "12:00 PM" }), false)
  // Different parlour -> available!
  assert.equal(hasSlotConflict(existing, { parlour_id: "p2", date: "2026-10-30", time: "10:00 AM" }), false)
})

// ─── 6. Inventory Stock Validation & Overselling Prevention ───────────────────
function validateAndCalculateOrder(items, catalogProducts, shippingFee = 60) {
  if (!items || items.length === 0) {
    return { success: false, error: "Empty cart" }
  }
  const prodMap = new Map(catalogProducts.map(p => [p.id, p]))
  let subtotal = 0
  const verifiedItems = []

  for (const item of items) {
    const prod = prodMap.get(item.id)
    if (!prod || !prod.is_active) {
      return { success: false, error: `Product unavailable: ${item.id}` }
    }
    const qty = Number(item.quantity) || 1
    if (qty <= 0) {
      return { success: false, error: `Invalid quantity for ${prod.name}` }
    }
    if ((prod.stock || 0) < qty) {
      return { success: false, error: `Insufficient stock for ${prod.name}. Available: ${prod.stock}, Requested: ${qty}` }
    }
    // Calculate using genuine database price, disregarding any client-manipulated price
    const verifiedPrice = Number(prod.price)
    subtotal += verifiedPrice * qty
    verifiedItems.push({ id: prod.id, name: prod.name, price: verifiedPrice, quantity: qty })
  }

  const total = subtotal + shippingFee
  return { success: true, subtotal, total, items: verifiedItems }
}

test("Inventory stock validation calculates server-side totals and prevents overselling", () => {
  const catalog = [
    { id: "prod-1", name: "Organic Argan Hair Oil", price: 1200, stock: 5, is_active: true },
    { id: "prod-2", name: "Rose Water Hydrating Toner", price: 650, stock: 2, is_active: true },
    { id: "prod-3", name: "Vitamin C Serum", price: 950, stock: 0, is_active: false }, // out of stock / inactive
  ]

  // Valid order within stock bounds
  const res1 = validateAndCalculateOrder(
    [{ id: "prod-1", quantity: 2, price: 1 }], // Client claims price is 1 BDT
    catalog
  )
  assert.equal(res1.success, true)
  assert.equal(res1.subtotal, 2400) // Revalidated database price: 1200 * 2 = 2400 BDT
  assert.equal(res1.total, 2460) // 2400 + 60 shipping = 2460 BDT

  // Overselling attempt: requesting 5 when only 2 available
  const res2 = validateAndCalculateOrder(
    [{ id: "prod-2", quantity: 5 }],
    catalog
  )
  assert.equal(res2.success, false)
  assert.match(res2.error, /Insufficient stock/)

  // Inactive / zero-stock product attempt
  const res3 = validateAndCalculateOrder(
    [{ id: "prod-3", quantity: 1 }],
    catalog
  )
  assert.equal(res3.success, false)
  assert.match(res3.error, /Product unavailable/)
})

// ─── 7. Review Eligibility & Duplicate Prevention ────────────────────────────
function validateReviewSubmission(userId, parlourId, rating, comment, completedBookings, existingReviews) {
  const roundedRating = Math.round(Number(rating))
  if (isNaN(roundedRating) || roundedRating < 1 || roundedRating > 5) {
    return { success: false, error: "Rating must be between 1 and 5 stars" }
  }

  // Check 1: User must have completed appointment at parlour
  const hasCompleted = completedBookings.some(
    b => b.customer_id === userId && b.parlour_id === parlourId && b.status === "completed"
  )
  if (!hasCompleted) {
    return { success: false, error: "Only verified customers with completed appointments can review" }
  }

  // Check 2: Prevent duplicate reviews for same parlour
  const hasAlreadyReviewed = existingReviews.some(
    r => r.customer_id === userId && r.parlour_id === parlourId
  )
  if (hasAlreadyReviewed) {
    return { success: false, error: "Duplicate review: Customer already reviewed this parlour" }
  }

  return { success: true, rating: roundedRating }
}

test("Review integrity enforces verified booking and prevents duplicate reviews", () => {
  const completed = [
    { customer_id: "user-1", parlour_id: "parlour-a", status: "completed" },
    { customer_id: "user-2", parlour_id: "parlour-a", status: "confirmed" }, // not completed
  ]
  const existingReviews = [
    { id: "rev-1", customer_id: "user-1", parlour_id: "parlour-a", rating: 5 },
  ]

  // User with completed booking submits first review -> allowed
  assert.deepEqual(
    validateReviewSubmission("user-1", "parlour-b", 5, "Great service!", [{ customer_id: "user-1", parlour_id: "parlour-b", status: "completed" }], []),
    { success: true, rating: 5 }
  )

  // Uncompleted customer attempt -> rejected
  const resUncompleted = validateReviewSubmission("user-2", "parlour-a", 5, "Nice", completed, existingReviews)
  assert.equal(resUncompleted.success, false)
  assert.match(resUncompleted.error, /Only verified customers/)

  // Duplicate review attempt -> rejected
  const resDuplicate = validateReviewSubmission("user-1", "parlour-a", 4, "Updated", completed, existingReviews)
  assert.equal(resDuplicate.success, false)
  assert.match(resDuplicate.error, /Duplicate review/)

  // Invalid rating (< 1 or > 5) -> rejected
  const resBadRating = validateReviewSubmission("user-1", "parlour-b", 6, "Super", [{ customer_id: "user-1", parlour_id: "parlour-b", status: "completed" }], [])
  assert.equal(resBadRating.success, false)
  assert.match(resBadRating.error, /between 1 and 5/)
})

// ─── 8. Admin Entity Table Whitelisting ───────────────────────────────────────
const ALLOWED_ADMIN_ENTITIES = new Set([
  "parlours",
  "services",
  "products",
  "promo_codes",
  "blog_posts",
  "service_categories",
  "theme_settings",
  "orders",
  "bookings",
  "reviews",
  "users",
  "footer_settings",
  "homepage_content",
])

function isPermittedAdminTable(table) {
  return ALLOWED_ADMIN_ENTITIES.has(table)
}

test("Admin entity whitelist permits authorized tables and blocks arbitrary tables", () => {
  // Allowed core entities
  assert.equal(isPermittedAdminTable("parlours"), true)
  assert.equal(isPermittedAdminTable("services"), true)
  assert.equal(isPermittedAdminTable("products"), true)
  assert.equal(isPermittedAdminTable("orders"), true)

  // Blocked unauthorized or sensitive tables
  assert.equal(isPermittedAdminTable("auth.users"), false)
  assert.equal(isPermittedAdminTable("pg_catalog"), false)
  assert.equal(isPermittedAdminTable("arbitrary_table"), false)
  assert.equal(isPermittedAdminTable(""), false)
})

// ─── 9. Booking Reminder Time Parsing Fix (No NaN values) ──────────────────────
function parseBookingReminderTime(timeStr) {
  if (!timeStr) return null
  const ampm = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (ampm) {
    let hours = parseInt(ampm[1], 10)
    const minutes = parseInt(ampm[2], 10)
    const period = ampm[3].toUpperCase()
    if (period === "AM" && hours === 12) hours = 0
    if (period === "PM" && hours !== 12) hours += 12
    return { hours, minutes }
  }
  const h24 = timeStr.match(/^(\d{1,2}):(\d{2})$/)
  if (h24) {
    return { hours: parseInt(h24[1], 10), minutes: parseInt(h24[2], 10) }
  }
  return null
}

test("Booking Reminder Time parsing accurately extracts hours/minutes for 12h AM/PM without NaN", () => {
  assert.deepEqual(parseBookingReminderTime("10:00 AM"), { hours: 10, minutes: 0 })
  assert.deepEqual(parseBookingReminderTime("02:30 PM"), { hours: 14, minutes: 30 })
  assert.deepEqual(parseBookingReminderTime("12:00 PM"), { hours: 12, minutes: 0 })
  assert.deepEqual(parseBookingReminderTime("12:00 AM"), { hours: 0, minutes: 0 })
  assert.deepEqual(parseBookingReminderTime("15:45"), { hours: 15, minutes: 45 })
  assert.equal(parseBookingReminderTime("invalid"), null)
})

console.log("All launch readiness automated tests executed.")

