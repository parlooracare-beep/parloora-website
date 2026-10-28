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

console.log("All launch readiness automated tests executed.")
