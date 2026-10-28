/**
 * Parloora Centralized Bangladesh 64 Districts Coordinates & Geolocation Engine
 * Accurate geographic center coordinates for all 64 districts across 8 divisions.
 * Enables instant, offline-capable, 100% reliable nearest-district matching via Haversine distance.
 */

export interface DistrictCoord {
  id: string
  name: string
  bnName: string
  division: string
  lat: number
  lng: number
  isFocusMarket?: boolean
}

export interface NearestDistrictResult {
  id: string
  name: string
  bnName: string
  division: string
  lat: number
  lng: number
  distanceKm: number
  withinBangladesh: boolean
  isFocusMarket?: boolean
}

export const BANGLADESH_DISTRICT_COORDS: Record<string, DistrictCoord> = {
  // Dhaka Division (13)
  dhaka: { id: "dhaka", name: "Dhaka", bnName: "ঢাকা", division: "Dhaka", lat: 23.8103, lng: 90.4125 },
  faridpur: { id: "faridpur", name: "Faridpur", bnName: "ফরিদপুর", division: "Dhaka", lat: 23.6071, lng: 89.8429 },
  gazipur: { id: "gazipur", name: "Gazipur", bnName: "গাজীপুর", division: "Dhaka", lat: 24.0023, lng: 90.4264 },
  gopalganj: { id: "gopalganj", name: "Gopalganj", bnName: "গোপালগঞ্জ", division: "Dhaka", lat: 23.0051, lng: 89.8266 },
  kishoreganj: { id: "kishoreganj", name: "Kishoreganj", bnName: "কিশোরগঞ্জ", division: "Dhaka", lat: 24.4449, lng: 90.7766 },
  madaripur: { id: "madaripur", name: "Madaripur", bnName: "মাদারীপুর", division: "Dhaka", lat: 23.1641, lng: 90.1897 },
  manikganj: { id: "manikganj", name: "Manikganj", bnName: "মানিকগঞ্জ", division: "Dhaka", lat: 23.8644, lng: 90.0047 },
  munshiganj: { id: "munshiganj", name: "Munshiganj", bnName: "মুন্সীগঞ্জ", division: "Dhaka", lat: 23.5422, lng: 90.5305 },
  narayanganj: { id: "narayanganj", name: "Narayanganj", bnName: "নারায়ণগঞ্জ", division: "Dhaka", lat: 23.6238, lng: 90.5000 },
  narsingdi: { id: "narsingdi", name: "Narsingdi", bnName: "নরসিংদী", division: "Dhaka", lat: 23.9322, lng: 90.7154 },
  rajbari: { id: "rajbari", name: "Rajbari", bnName: "রাজবাড়ী", division: "Dhaka", lat: 23.7574, lng: 89.6445 },
  shariatpur: { id: "shariatpur", name: "Shariatpur", bnName: "শরীয়তপুর", division: "Dhaka", lat: 23.2423, lng: 90.4348 },
  tangail: { id: "tangail", name: "Tangail", bnName: "টাঙ্গাইল", division: "Dhaka", lat: 24.2513, lng: 89.9167 },

  // Chattogram Division (11)
  chattogram: { id: "chattogram", name: "Chattogram", bnName: "চট্টগ্রাম", division: "Chattogram", lat: 22.3569, lng: 91.7832 },
  "coxs-bazar": { id: "coxs-bazar", name: "Cox's Bazar", bnName: "কক্সবাজার", division: "Chattogram", lat: 21.4272, lng: 92.0058 },
  cumilla: { id: "cumilla", name: "Cumilla", bnName: "কুমিল্লা", division: "Chattogram", lat: 23.4682, lng: 91.1788 },
  feni: { id: "feni", name: "Feni", bnName: "ফেনী", division: "Chattogram", lat: 23.0159, lng: 91.3976 },
  brahmanbaria: { id: "brahmanbaria", name: "Brahmanbaria", bnName: "ব্রাহ্মণবাড়িয়া", division: "Chattogram", lat: 23.9571, lng: 91.1119 },
  chandpur: { id: "chandpur", name: "Chandpur", bnName: "চাঁদপুর", division: "Chattogram", lat: 23.2333, lng: 90.6712 },
  noakhali: { id: "noakhali", name: "Noakhali", bnName: "নোয়াখালী", division: "Chattogram", lat: 22.8696, lng: 91.0994 },
  lakshmipur: { id: "lakshmipur", name: "Lakshmipur", bnName: "লক্ষ্মীপুর", division: "Chattogram", lat: 22.9425, lng: 90.8412 },
  khagrachhari: { id: "khagrachhari", name: "Khagrachhari", bnName: "খাগড়াছড়ি", division: "Chattogram", lat: 23.1193, lng: 91.9847 },
  rangamati: { id: "rangamati", name: "Rangamati", bnName: "রাঙ্গামাটি", division: "Chattogram", lat: 22.6574, lng: 92.1733 },
  bandarban: { id: "bandarban", name: "Bandarban", bnName: "বান্দরবান", division: "Chattogram", lat: 22.1953, lng: 92.2184 },

  // Rajshahi Division (8)
  rajshahi: { id: "rajshahi", name: "Rajshahi", bnName: "রাজশাহী", division: "Rajshahi", lat: 24.3745, lng: 88.6042 },
  bogura: { id: "bogura", name: "Bogura", bnName: "বগুড়া", division: "Rajshahi", lat: 24.8465, lng: 89.3777 },
  pabna: { id: "pabna", name: "Pabna", bnName: "পাবনা", division: "Rajshahi", lat: 24.0064, lng: 89.2372 },
  sirajganj: { id: "sirajganj", name: "Sirajganj", bnName: "সিরাজগঞ্জ", division: "Rajshahi", lat: 24.4534, lng: 89.7007 },
  naogaon: { id: "naogaon", name: "Naogaon", bnName: "নওগাঁ", division: "Rajshahi", lat: 24.7936, lng: 88.9318 },
  natore: { id: "natore", name: "Natore", bnName: "নাটোর", division: "Rajshahi", lat: 24.4206, lng: 88.9320 },
  chapainawabganj: { id: "chapainawabganj", name: "Chapainawabganj", bnName: "চাঁপাইনবাবগঞ্জ", division: "Rajshahi", lat: 24.5965, lng: 88.2775 },
  joypurhat: { id: "joypurhat", name: "Joypurhat", bnName: "জয়পুরহাট", division: "Rajshahi", lat: 25.1011, lng: 89.0277 },

  // Khulna Division (10)
  khulna: { id: "khulna", name: "Khulna", bnName: "খুলনা", division: "Khulna", lat: 22.8456, lng: 89.5403 },
  jashore: { id: "jashore", name: "Jashore", bnName: "যশোর", division: "Khulna", lat: 23.1664, lng: 89.2081 },
  kushtia: { id: "kushtia", name: "Kushtia", bnName: "কুষ্টিয়া", division: "Khulna", lat: 23.9013, lng: 89.1205 },
  satkhira: { id: "satkhira", name: "Satkhira", bnName: "সাতক্ষীরা", division: "Khulna", lat: 22.7185, lng: 89.0705 },
  jhenaidah: { id: "jhenaidah", name: "Jhenaidah", bnName: "ঝিনাইদহ", division: "Khulna", lat: 23.5448, lng: 89.1539 },
  chuadanga: { id: "chuadanga", name: "Chuadanga", bnName: "চুয়াডাঙ্গা", division: "Khulna", lat: 23.6402, lng: 88.8418 },
  meherpur: { id: "meherpur", name: "Meherpur", bnName: "মেহেরপুর", division: "Khulna", lat: 23.7622, lng: 88.6318 },
  magura: { id: "magura", name: "Magura", bnName: "মাগুরা", division: "Khulna", lat: 23.4873, lng: 89.4198 },
  narail: { id: "narail", name: "Narail", bnName: "নড়াইল", division: "Khulna", lat: 23.1725, lng: 89.5127 },
  bagerhat: { id: "bagerhat", name: "Bagerhat", bnName: "বাগেরহাট", division: "Khulna", lat: 22.6516, lng: 89.7859 },

  // Sylhet Division (4) - Includes Parloora Initial Market Focus Moulvibazar
  sylhet: { id: "sylhet", name: "Sylhet", bnName: "সিলেট", division: "Sylhet", lat: 24.8949, lng: 91.8687 },
  moulvibazar: { id: "moulvibazar", name: "Moulvibazar", bnName: "মৌলভীবাজার", division: "Sylhet", lat: 24.4829, lng: 91.7774, isFocusMarket: true },
  habiganj: { id: "habiganj", name: "Habiganj", bnName: "হবিগঞ্জ", division: "Sylhet", lat: 24.3749, lng: 91.4155 },
  sunamganj: { id: "sunamganj", name: "Sunamganj", bnName: "সুনামগঞ্জ", division: "Sylhet", lat: 25.0658, lng: 91.3950 },

  // Rangpur Division (8)
  rangpur: { id: "rangpur", name: "Rangpur", bnName: "রংপুর", division: "Rangpur", lat: 25.7439, lng: 89.2752 },
  dinajpur: { id: "dinajpur", name: "Dinajpur", bnName: "দিনাজপুর", division: "Rangpur", lat: 25.6217, lng: 88.6355 },
  gaibandha: { id: "gaibandha", name: "Gaibandha", bnName: "গাইবান্ধা", division: "Rangpur", lat: 25.3288, lng: 89.5281 },
  kurigram: { id: "kurigram", name: "Kurigram", bnName: "কুড়িগ্রাম", division: "Rangpur", lat: 25.8054, lng: 89.6362 },
  lalmonirhat: { id: "lalmonirhat", name: "Lalmonirhat", bnName: "লালমনিরহাট", division: "Rangpur", lat: 25.9165, lng: 89.4532 },
  nilphamari: { id: "nilphamari", name: "Nilphamari", bnName: "নীলফামারী", division: "Rangpur", lat: 25.9318, lng: 88.8560 },
  panchagarh: { id: "panchagarh", name: "Panchagarh", bnName: "পঞ্চগড়", division: "Rangpur", lat: 26.3411, lng: 88.5542 },
  thakurgaon: { id: "thakurgaon", name: "Thakurgaon", bnName: "ঠাকুরগাঁও", division: "Rangpur", lat: 26.0337, lng: 88.4617 },

  // Mymensingh Division (4)
  mymensingh: { id: "mymensingh", name: "Mymensingh", bnName: "ময়মনসিংহ", division: "Mymensingh", lat: 24.7471, lng: 90.4203 },
  jamalpur: { id: "jamalpur", name: "Jamalpur", bnName: "জামালপুর", division: "Mymensingh", lat: 24.9375, lng: 89.9378 },
  netrokona: { id: "netrokona", name: "Netrokona", bnName: "নেত্রকোণা", division: "Mymensingh", lat: 24.8709, lng: 90.7279 },
  sherpur: { id: "sherpur", name: "Sherpur", bnName: "শেরপুর", division: "Mymensingh", lat: 25.0188, lng: 90.0175 },

  // Barishal Division (6)
  barishal: { id: "barishal", name: "Barishal", bnName: "বরিশাল", division: "Barishal", lat: 22.7010, lng: 90.3535 },
  patuakhali: { id: "patuakhali", name: "Patuakhali", bnName: "পটুয়াখালী", division: "Barishal", lat: 22.3596, lng: 90.3298 },
  bhola: { id: "bhola", name: "Bhola", bnName: "ভোলা", division: "Barishal", lat: 22.6859, lng: 90.6481 },
  pirojpur: { id: "pirojpur", name: "Pirojpur", bnName: "পিরোজপুর", division: "Barishal", lat: 22.5841, lng: 89.9720 },
  barguna: { id: "barguna", name: "Barguna", bnName: "বরগুনা", division: "Barishal", lat: 22.1570, lng: 90.1256 },
  jhalokati: { id: "jhalokati", name: "Jhalokati", bnName: "ঝালকাঠি", division: "Barishal", lat: 22.6406, lng: 90.1987 },
}

/**
 * Calculates Great-Circle Distance between two coordinates in Kilometers using Haversine formula.
 */
export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Finds the nearest Bangladesh district to any given coordinate.
 * Operates entirely client-side/offline with zero external API dependencies.
 */
export function findNearestDistrict(lat: number, lng: number): NearestDistrictResult {
  let nearest: DistrictCoord = BANGLADESH_DISTRICT_COORDS.dhaka
  let minDistance = Infinity

  for (const item of Object.values(BANGLADESH_DISTRICT_COORDS)) {
    const dist = haversineDistanceKm(lat, lng, item.lat, item.lng)
    if (dist < minDistance) {
      minDistance = dist
      nearest = item
    }
  }

  const roundedDistance = Math.round(minDistance * 10) / 10
  // Bangladesh maximum radius from any center is ~140km. If further than 160km, user is outside BD.
  const withinBangladesh = roundedDistance <= 160

  return {
    ...nearest,
    distanceKm: roundedDistance,
    withinBangladesh,
  }
}

/**
 * Known common district alias map to handle varied spellings from geocoding providers or user input.
 */
const DISTRICT_ALIASES: Record<string, string> = {
  dacca: "Dhaka",
  dhaka: "Dhaka",
  chittagong: "Chattogram",
  ctg: "Chattogram",
  chattogram: "Chattogram",
  comilla: "Cumilla",
  cumilla: "Cumilla",
  barisal: "Barishal",
  barishal: "Barishal",
  bogra: "Bogura",
  bogura: "Bogura",
  jessore: "Jashore",
  jashore: "Jashore",
  "moulvi bazar": "Moulvibazar",
  moulvibazar: "Moulvibazar",
  maulvibazar: "Moulvibazar",
  "b.baria": "Brahmanbaria",
  brahmanbaria: "Brahmanbaria",
  "cox's bazar": "Cox's Bazar",
  "coxs bazar": "Cox's Bazar",
  coxsbazar: "Cox's Bazar",
  netrakona: "Netrokona",
  netrokona: "Netrokona",
  nawabganj: "Chapainawabganj",
  chapainawabganj: "Chapainawabganj",
}

/**
 * Normalizes any free-form district or location text to one of the 64 official district names.
 */
export function normalizeDistrictName(rawInput: string | null | undefined): string | null {
  if (!rawInput) return null
  const cleaned = rawInput.trim().toLowerCase().replace(/ district| zila| জেলা| upazila| sadar/gi, "").trim()

  if (DISTRICT_ALIASES[cleaned]) {
    return DISTRICT_ALIASES[cleaned]
  }

  for (const coord of Object.values(BANGLADESH_DISTRICT_COORDS)) {
    if (
      coord.name.toLowerCase() === cleaned ||
      coord.id.toLowerCase() === cleaned ||
      coord.bnName === cleaned ||
      cleaned.includes(coord.name.toLowerCase()) ||
      cleaned.includes(coord.bnName)
    ) {
      return coord.name
    }
  }

  return null
}
