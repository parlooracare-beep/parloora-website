/**
 * Parloora Bilingual System Automated Test Suite
 * -------------------------------------------------------------
 * Tests dictionary parity between en.json and bn.json,
 * parameter interpolation, Bengali numeral conversion,
 * and currency/date formatting.
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcMessagesDir = path.resolve(__dirname, "../src/messages")

console.log("🧪 Running Parloora Bilingual Test Suite...\n")

let passCount = 0
let failCount = 0

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`)
    passCount++
  } else {
    console.error(`  ❌ FAIL: ${message}`)
    failCount++
  }
}

// ─── TEST 1: Dictionary Loading & JSON Parsing ───────────────────────────────
const enPath = path.join(srcMessagesDir, "en.json")
const bnPath = path.join(srcMessagesDir, "bn.json")

assert(fs.existsSync(enPath), `en.json exists at ${enPath}`)
assert(fs.existsSync(bnPath), `bn.json exists at ${bnPath}`)

const en = JSON.parse(fs.readFileSync(enPath, "utf-8"))
const bn = JSON.parse(fs.readFileSync(bnPath, "utf-8"))

assert(typeof en === "object" && en !== null, "en.json parsed into valid object")
assert(typeof bn === "object" && bn !== null, "bn.json parsed into valid object")

// ─── TEST 2: Recursive Key Parity between en.json and bn.json ────────────────
function getAllLeafKeys(obj, prefix = "") {
  let keys = []
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k
    if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      keys = keys.concat(getAllLeafKeys(v, fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  return keys
}

const enKeys = getAllLeafKeys(en)
const bnKeys = getAllLeafKeys(bn)

console.log(`\n📊 Total English translation keys: ${enKeys.length}`)
console.log(`📊 Total Bangla translation keys:  ${bnKeys.length}`)

assert(enKeys.length > 100, `Rich translation dictionary coverage (found ${enKeys.length} keys)`)

const bnKeySet = new Set(bnKeys)
const missingInBn = enKeys.filter(k => !bnKeySet.has(k))

if (missingInBn.length > 0) {
  console.error("  Missing keys in bn.json:", missingInBn)
}
assert(missingInBn.length === 0, `Complete key parity: 0 missing keys in bn.json (checked ${enKeys.length} keys)`)

// ─── TEST 3: Bengali Numeral Conversion ──────────────────────────────────────
const BENGALI_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]

function toBengaliDigits(input) {
  return String(input).replace(/[0-9]/g, (d) => BENGALI_DIGITS[parseInt(d, 10)])
}

function toEnglishDigits(input) {
  return String(input).replace(/[০-৯]/g, (d) => String(BENGALI_DIGITS.indexOf(d)))
}

assert(toBengaliDigits("1250") === "১২৫০", "toBengaliDigits('1250') correctly converts to '১২৫০'")
assert(toBengaliDigits("2026-10-28") === "২০২৬-১০-২৮", "toBengaliDigits date converts correctly")
assert(toEnglishDigits("১২৫০") === "1250", "toEnglishDigits('১২৫০') correctly converts to '1250'")

// ─── TEST 4: Parameter Interpolation ─────────────────────────────────────────
function interpolate(template, params) {
  if (!params) return template
  return template.replace(/{(\w+)}/g, (_, key) => {
    return params[key] !== undefined ? String(params[key]) : `{${key}}`
  })
}

const sampleEnTemplate = en.parlours.parloursFound // "{count} parlours found"
const sampleBnTemplate = bn.parlours.parloursFound // "{count}টি পার্লার পাওয়া গেছে"

const enInterpolated = interpolate(sampleEnTemplate, { count: 15 })
const bnInterpolated = interpolate(sampleBnTemplate, { count: toBengaliDigits(15) })

assert(enInterpolated === "15 parlours found", `EN Interpolation: "${enInterpolated}"`)
assert(bnInterpolated.includes("১৫") && bnInterpolated.includes("পার্লার"), `BN Interpolation with Bengali digits: "${bnInterpolated}"`)

// ─── TEST 5: Currency Formatting ─────────────────────────────────────────────
function formatCurrency(amount, locale = "en") {
  const numeric = typeof amount === "string" ? parseFloat(amount) || 0 : amount
  if (locale === "bn") {
    const formatted = new Intl.NumberFormat("bn-BD", { maximumFractionDigits: 0 }).format(numeric)
    return `৳${formatted}`
  }
  const formatted = new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 }).format(numeric)
  return `৳${formatted}`
}

const formattedEn = formatCurrency(1250, "en")
const formattedBn = formatCurrency(1250, "bn")

assert(formattedEn.includes("৳") && formattedEn.includes("1,250"), `EN Currency formatting: "${formattedEn}"`)
assert(formattedBn.includes("৳") && (formattedBn.includes("১,২৫০") || formattedBn.includes("১২৫০")), `BN Currency formatting: "${formattedBn}"`)

// ─── TEST 6: Essential Namespaces Present ────────────────────────────────────
const REQUIRED_NAMESPACES = [
  "common", "nav", "home", "auth", "booking", "parlours",
  "shop", "customer", "seller", "admin", "locations", "footer", "notifications"
]

const missingNamespaces = REQUIRED_NAMESPACES.filter(ns => !en[ns] || !bn[ns])
assert(missingNamespaces.length === 0, `All ${REQUIRED_NAMESPACES.length} essential application namespaces present in both dictionaries`)

console.log(`\n========================================`)
console.log(`Test Results: ${passCount} Passed, ${failCount} Failed`)
console.log(`========================================\n`)

if (failCount > 0) {
  process.exit(1)
} else {
  process.exit(0)
}
