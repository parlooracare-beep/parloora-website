import assert from "node:assert/strict"
import {
  BANGLADESH_DISTRICT_COORDS,
  findNearestDistrict,
  haversineDistanceKm,
  normalizeDistrictName,
} from "../src/lib/locations/district-coords.ts"
import { BANGLADESH_DISTRICTS_DATA } from "../src/lib/locations/data.ts"

console.log("=== Testing Parloora GPS Geolocation & 64 Districts Engine ===")

// 1. Check all 64 districts exist in coordinates dataset
const coordKeys = Object.keys(BANGLADESH_DISTRICT_COORDS)
assert.equal(coordKeys.length, 64, "Must contain exact 64 districts of Bangladesh")
console.log("✔ 64 districts in coordinates dataset verified.")

// 2. Check every district has valid coordinates within Bangladesh geographic bounds
// Bangladesh lies roughly between latitude 20.5° to 26.7° N and longitude 88.0° to 92.7° E
for (const [id, d] of Object.entries(BANGLADESH_DISTRICT_COORDS)) {
  assert.ok(d.lat >= 20.0 && d.lat <= 27.0, `District ${id} latitude ${d.lat} out of Bangladesh bounds`)
  assert.ok(d.lng >= 87.5 && d.lng <= 93.5, `District ${id} longitude ${d.lng} out of Bangladesh bounds`)
  assert.ok(d.name && d.name.length > 0, `District ${id} must have a name`)
  assert.ok(d.bnName && d.bnName.length > 0, `District ${id} must have a Bangla name`)
  assert.ok(d.division && d.division.length > 0, `District ${id} must have a division`)
}
console.log("✔ All 64 district coordinates are within Bangladesh geographic boundaries.")

// 3. Test Haversine distance calculation
const distanceDhakaToSylhet = haversineDistanceKm(23.8103, 90.4125, 24.8949, 91.8687)
assert.ok(distanceDhakaToSylhet > 180 && distanceDhakaToSylhet < 220, "Distance Dhaka to Sylhet should be ~195km")
console.log(`✔ Haversine distance Dhaka to Sylhet: ${Math.round(distanceDhakaToSylhet)}km (accurate).`)

// 4. Test Nearest District matching for key test locations
// Test A: Sreemangal tea garden coordinates (should match Moulvibazar)
const sreemangalMatch = findNearestDistrict(24.3065, 91.7296)
assert.equal(sreemangalMatch.name, "Moulvibazar")
assert.ok(sreemangalMatch.withinBangladesh)
assert.ok(sreemangalMatch.distanceKm < 30)
console.log("✔ Sreemangal coordinates correctly mapped to nearest district: Moulvibazar.")

// Test B: Gulshan 2, Dhaka coordinates
const gulshanMatch = findNearestDistrict(23.7937, 90.4043)
assert.equal(gulshanMatch.name, "Dhaka")
assert.ok(gulshanMatch.withinBangladesh)
assert.ok(gulshanMatch.distanceKm < 5)
console.log("✔ Gulshan coordinates correctly mapped to nearest district: Dhaka.")

// Test C: Zindabazar, Sylhet coordinates
const zindabazarMatch = findNearestDistrict(24.8967, 91.8687)
assert.equal(zindabazarMatch.name, "Sylhet")
assert.ok(zindabazarMatch.withinBangladesh)
assert.ok(zindabazarMatch.distanceKm < 2)
console.log("✔ Zindabazar coordinates correctly mapped to nearest district: Sylhet.")

// Test D: Agrabad, Chattogram coordinates
const agrabadMatch = findNearestDistrict(22.3248, 91.8122)
assert.equal(agrabadMatch.name, "Chattogram")
assert.ok(agrabadMatch.withinBangladesh)
console.log("✔ Agrabad coordinates correctly mapped to nearest district: Chattogram.")

// 5. Test text normalization and aliases
assert.equal(normalizeDistrictName("Moulvibazar Sadar Upazila"), "Moulvibazar")
assert.equal(normalizeDistrictName("Moulvi Bazar"), "Moulvibazar")
assert.equal(normalizeDistrictName("মৌলভীবাজার জেলা"), "Moulvibazar")
assert.equal(normalizeDistrictName("Dacca"), "Dhaka")
assert.equal(normalizeDistrictName("Dhaka District"), "Dhaka")
assert.equal(normalizeDistrictName("Chittagong"), "Chattogram")
assert.equal(normalizeDistrictName("B.Baria"), "Brahmanbaria")
assert.equal(normalizeDistrictName("Coxs Bazar"), "Cox's Bazar")
assert.equal(normalizeDistrictName("Barisal"), "Barishal")
assert.equal(normalizeDistrictName("Bogra"), "Bogura")
assert.equal(normalizeDistrictName("Jessore"), "Jashore")
assert.equal(normalizeDistrictName("Cumilla District"), "Cumilla")
console.log("✔ District aliases and fuzzy normalization verified.")

// 6. Test 100% parity between BANGLADESH_DISTRICTS_DATA and BANGLADESH_DISTRICT_COORDS
for (const dist of BANGLADESH_DISTRICTS_DATA) {
  const coord = BANGLADESH_DISTRICT_COORDS[dist.id]
  assert.ok(coord, `District data ID ${dist.id} missing in coordinates map`)
  assert.equal(coord.name, dist.name, `Name mismatch for ${dist.id}`)
}
console.log("✔ 100% parity between location metadata and coordinates map verified.")

console.log("\nALL GEOLOCATION & DISTRICT ENGINE TESTS PASSED SUCCESSFULLY! 🎉")
