import test from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, "..")

test("Parloora Official Contact Information Audit", async (t) => {
  await t.test("Centralized contact configuration matches official specifications", async () => {
    const contactFile = fs.readFileSync(path.join(root, "src/config/contact.ts"), "utf-8")
    
    // Check official website
    assert.match(contactFile, /website:\s*"https:\/\/parloora\.com"/, "Website must be https://parloora.com")
    
    // Check official tagline
    assert.match(contactFile, /tagline:\s*"Book Your Self Care Services In Seconds"/, "Official tagline must match")
    
    // Check office location
    assert.match(contactFile, /office:\s*"Dhaka, Bangladesh"/, "Office must be Dhaka, Bangladesh")
    
    // Check Customer Care & WhatsApp numbers
    assert.match(contactFile, /customerCare:\s*"01884599271"/, "Customer Care phone must be 01884599271")
    assert.match(contactFile, /customerCareTel:\s*"tel:01884599271"/, "Tel protocol must be tel:01884599271")
    assert.match(contactFile, /whatsappDisplay:\s*"01884599271"/, "WhatsApp display must be 01884599271")
    assert.match(contactFile, /whatsappInternational:\s*"8801884599271"/, "International number must not have leading zero")
    assert.match(contactFile, /whatsappUrl:\s*"https:\/\/wa\.me\/8801884599271"/, "WhatsApp URL must be https://wa.me/8801884599271")
    
    // Check official social media accounts
    assert.match(contactFile, /facebook:\s*"https:\/\/www\.facebook\.com\/parloora"/, "Facebook must match")
    assert.match(contactFile, /instagram:\s*"https:\/\/www\.instagram\.com\/parloora"/, "Instagram must match")
    assert.match(contactFile, /youtube:\s*"https:\/\/www\.youtube\.com\/@Parloora"/, "YouTube must match")
  })

  await t.test("Translations en.json and bn.json include contact dictionary", () => {
    const en = JSON.parse(fs.readFileSync(path.join(root, "src/messages/en.json"), "utf-8"))
    const bn = JSON.parse(fs.readFileSync(path.join(root, "src/messages/bn.json"), "utf-8"))

    assert.ok(en.contact, "en.json must contain contact dictionary")
    assert.ok(bn.contact, "bn.json must contain contact dictionary")

    assert.equal(en.contact.customerCare, "Customer Care")
    assert.equal(bn.contact.customerCare, "কাস্টমার কেয়ার")

    assert.equal(en.contact.whatsappSupport, "WhatsApp Support")
    assert.equal(bn.contact.whatsappSupport, "হোয়াটসঅ্যাপ সাপোর্ট")

    assert.equal(en.contact.office, "Office")
    assert.equal(bn.contact.office, "অফিস")

    assert.equal(en.contact.officeLocation, "Dhaka, Bangladesh")
    assert.equal(bn.contact.officeLocation, "ঢাকা, বাংলাদেশ")
  })

  await t.test("No old outdated email addresses or phone placeholders exist in app code", () => {
    const forbiddenPatterns = [
      "parlooracare@gmail.com",
      "support@parloora.com",
      "sales@parloora.com",
      "privacy@parloora.com",
      "123 Beauty Avenue",
      "+880 1234 567 890"
    ]

    function scanDir(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          if (entry.name !== "node_modules" && entry.name !== ".next" && entry.name !== ".git") {
            scanDir(fullPath)
          }
        } else if (entry.isFile() && /\.(tsx|ts|js|mjs)$/.test(entry.name)) {
          const content = fs.readFileSync(fullPath, "utf-8")
          for (const pattern of forbiddenPatterns) {
            assert.ok(
              !content.includes(pattern),
              `File ${path.relative(root, fullPath)} contains forbidden outdated text: "${pattern}"`
            )
          }
        }
      }
    }

    scanDir(path.join(root, "src"))
  })

  await t.test("Floating WhatsApp button and Contact page exist", () => {
    assert.ok(fs.existsSync(path.join(root, "src/components/shared/WhatsAppButton.tsx")), "WhatsAppButton.tsx must exist")
    assert.ok(fs.existsSync(path.join(root, "src/app/(customer)/contact/page.tsx")), "contact/page.tsx must exist")
    assert.ok(fs.existsSync(path.join(root, "src/app/(customer)/contact/ContactContent.tsx")), "ContactContent.tsx must exist")
  })
})
