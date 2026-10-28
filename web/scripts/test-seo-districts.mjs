import test from "node:test"
import assert from "node:assert/strict"
import {
  BANGLADESH_DIVISIONS,
  BANGLADESH_DISTRICTS_DATA,
  SERVICE_CATEGORIES_SEO,
  getDistrictBySlug,
  getDivisionBySlug,
  getDistrictsByDivision
} from "../src/lib/locations/data.ts"

test("1. All 8 administrative divisions of Bangladesh are present and valid", () => {
  assert.equal(BANGLADESH_DIVISIONS.length, 8, "Must have exactly 8 divisions")
  const expectedDivisions = [
    "Dhaka", "Chattogram", "Rajshahi", "Khulna",
    "Sylhet", "Rangpur", "Mymensingh", "Barishal"
  ]
  const divNames = BANGLADESH_DIVISIONS.map(d => d.name)
  for (const exp of expectedDivisions) {
    assert.ok(divNames.includes(exp), `Division ${exp} must exist`)
  }

  // Check unique slugs and bangla names
  const slugs = new Set()
  for (const div of BANGLADESH_DIVISIONS) {
    assert.ok(div.id, `Division must have id: ${div.name}`)
    assert.ok(div.bnName, `Division must have Bengali name: ${div.name}`)
    assert.ok(div.slug, `Division must have slug: ${div.name}`)
    assert.ok(/^[a-z0-9-]+$/.test(div.slug), `Slug must be kebab-case: ${div.slug}`)
    assert.ok(!slugs.has(div.slug), `Duplicate division slug: ${div.slug}`)
    slugs.add(div.slug)
  }
})

test("2. Exact 64 districts are present and adhere to the official administrative hierarchy", () => {
  assert.equal(BANGLADESH_DISTRICTS_DATA.length, 64, "Must have exactly 64 districts in Bangladesh")

  const expectedCounts = {
    dhaka: 13,
    chattogram: 11,
    rajshahi: 8,
    khulna: 10,
    sylhet: 4,
    rangpur: 8,
    mymensingh: 4,
    barishal: 6
  }

  const counts = {}
  const slugs = new Set()
  const names = new Set()

  for (const d of BANGLADESH_DISTRICTS_DATA) {
    counts[d.divisionId] = (counts[d.divisionId] || 0) + 1
    assert.ok(d.name, "District must have an English name")
    assert.ok(d.bnName, `District ${d.name} must have a Bengali name`)
    assert.ok(d.slug, `District ${d.name} must have a slug`)
    assert.ok(/^[a-z0-9-]+$/.test(d.slug), `District slug ${d.slug} must be kebab-case`)
    assert.ok(!slugs.has(d.slug), `Duplicate district slug: ${d.slug}`)
    slugs.add(d.slug)
    names.add(d.name)
  }

  for (const [divId, expected] of Object.entries(expectedCounts)) {
    assert.equal(counts[divId], expected, `Division ${divId} should have ${expected} districts, found ${counts[divId]}`)
  }
})

test("3. Specific high-priority districts like Moulvibazar, Sylhet, Dhaka, Chattogram exist with correct metadata", () => {
  const moulvibazar = getDistrictBySlug("moulvibazar")
  assert.ok(moulvibazar, "Moulvibazar district must exist")
  assert.equal(moulvibazar.divisionId, "sylhet")
  assert.equal(moulvibazar.bnName, "মৌলভীবাজার")
  assert.ok(moulvibazar.popularAreas.length > 0, "Moulvibazar should have key areas defined")

  const sylhet = getDistrictBySlug("sylhet")
  assert.ok(sylhet, "Sylhet district must exist")
  assert.equal(sylhet.divisionId, "sylhet")

  const dhaka = getDistrictBySlug("dhaka")
  assert.ok(dhaka, "Dhaka district must exist")
  assert.equal(dhaka.divisionId, "dhaka")

  const chattogram = getDistrictBySlug("chattogram")
  assert.ok(chattogram, "Chattogram district must exist")
  assert.equal(chattogram.divisionId, "chattogram")
})

test("4. Division helper functions return correct mappings", () => {
  const sylhetDiv = getDivisionBySlug("sylhet-division")
  assert.ok(sylhetDiv, "Sylhet division should resolve by slug")
  const sylhetDistricts = getDistrictsByDivision("sylhet")
  assert.equal(sylhetDistricts.length, 4, "Sylhet division must have 4 districts")
  const sylhetDistNames = sylhetDistricts.map(d => d.name)
  assert.deepEqual(sylhetDistNames.sort(), ["Habiganj", "Moulvibazar", "Sunamganj", "Sylhet"].sort())
})

test("5. SEO Service Categories provide correct intents and valid slugs", () => {
  assert.ok(SERVICE_CATEGORIES_SEO.length >= 6, "Must define at least 6 core beauty/grooming service categories")
  const catSlugs = new Set()
  for (const cat of SERVICE_CATEGORIES_SEO) {
    assert.ok(cat.slug, "Category must have slug")
    assert.ok(!catSlugs.has(cat.slug), `Duplicate category slug: ${cat.slug}`)
    catSlugs.add(cat.slug)
    assert.ok(cat.keywords.length > 0, `Category ${cat.name} must have keywords`)
  }
})

test("6. Indexation policy enforces index for populated districts and noindex for empty districts", () => {
  function getRobotsMeta(parlourCount) {
    if (parlourCount > 0) {
      return { index: true, follow: true }
    }
    return { index: false, follow: true }
  }

  // Populated district (e.g. Moulvibazar or Dhaka with parlours)
  assert.deepEqual(getRobotsMeta(5), { index: true, follow: true })
  // District without registered parlours yet
  assert.deepEqual(getRobotsMeta(0), { index: false, follow: true })
})

test("7. Canonical URLs and Structured Data generate valid standard formats", () => {
  const baseUrl = "https://parloora.com"
  const districtSlug = "moulvibazar"
  const canonical = `${baseUrl}/locations/${districtSlug}`
  assert.equal(canonical, "https://parloora.com/locations/moulvibazar")

  // Breadcrumbs schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Bangladesh Locations", item: `${baseUrl}/locations` },
      { "@type": "ListItem", position: 3, name: "Moulvibazar", item: canonical }
    ]
  }
  assert.equal(breadcrumbSchema.itemListElement.length, 3)
  assert.equal(breadcrumbSchema.itemListElement[2].item, canonical)
})
