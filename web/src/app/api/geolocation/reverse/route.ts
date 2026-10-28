import { NextResponse } from "next/server"
import {
  findNearestDistrict,
  normalizeDistrictName,
  BANGLADESH_DISTRICT_COORDS,
} from "@/lib/locations/district-coords"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const latParam = searchParams.get("lat")
    const lngParam = searchParams.get("lng")

    if (!latParam || !lngParam) {
      return NextResponse.json(
        { success: false, error: "Latitude and longitude query parameters are required." },
        { status: 400 }
      )
    }

    const lat = parseFloat(latParam)
    const lng = parseFloat(lngParam)

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { success: false, error: "Invalid coordinate values provided." },
        { status: 400 }
      )
    }

    // 1. Instant mathematical nearest-district resolution (never fails)
    const nearest = findNearestDistrict(lat, lng)

    let finalDistrictName = nearest.name
    let detectedArea: string | null = null

    // 2. Attempt reverse geocoding to resolve micro-locality (suburb/upazila/area)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3500)

      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en&addressdetails=1`
      const res = await fetch(nominatimUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Parloora-Bangladesh-SelfCare/1.0 (support: 01884599271, https://parloora.com)",
          "Accept": "application/json",
        },
      })
      clearTimeout(timeoutId)

      if (res.ok) {
        const geo = await res.json()
        const address = geo?.address || {}

        // Check if any address field gives a more specific verified district name
        const candidates = [
          address.state_district,
          address.county,
          address.city,
          address.town,
          address.state,
        ]

        for (const candidate of candidates) {
          const normalized = normalizeDistrictName(candidate)
          if (normalized) {
            finalDistrictName = normalized
            break
          }
        }

        // Extract localized area / neighborhood / sub-district
        const rawArea =
          address.suburb ||
          address.neighbourhood ||
          address.residential ||
          address.town ||
          address.village ||
          address.county ||
          null

        if (rawArea) {
          detectedArea = String(rawArea)
            .replace(/ Upazila| Sadar| Thana| Municipality/gi, "")
            .trim()
        }
      }
    } catch {
      // Gracefully fall back to the Haversine result
    }

    const matchedCoord =
      Object.values(BANGLADESH_DISTRICT_COORDS).find(
        (d) => d.name.toLowerCase() === finalDistrictName.toLowerCase()
      ) || nearest

    return NextResponse.json({
      success: true,
      district: matchedCoord.name,
      bnDistrict: matchedCoord.bnName,
      division: matchedCoord.division,
      area: detectedArea,
      distanceKm: nearest.distanceKm,
      withinBangladesh: nearest.withinBangladesh,
      coords: { lat, lng },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
