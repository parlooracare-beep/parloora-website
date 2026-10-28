import { create } from "zustand"
import { persist } from "zustand/middleware"
import { findNearestDistrict } from "@/lib/locations/district-coords"

export interface LocationStore {
  selectedDistrict: string
  detectedArea: string | null
  coords: { lat: number; lng: number } | null
  isDetecting: boolean
  detectError: string | null
  isModalOpen: boolean
  openModal: () => void
  closeModal: () => void
  setDistrict: (district: string, area?: string | null) => void
  detectLocation: () => Promise<{ success: boolean; district?: string; message?: string }>
}

export const useLocationStore = create<LocationStore>()(
  persist(
    (set) => ({
      selectedDistrict: "Dhaka",
      detectedArea: null,
      coords: null,
      isDetecting: false,
      detectError: null,
      isModalOpen: false,

      openModal: () => set({ isModalOpen: true, detectError: null }),
      closeModal: () => set({ isModalOpen: false, detectError: null }),

      setDistrict: (district: string, area?: string | null) =>
        set({
          selectedDistrict: district,
          detectedArea: area !== undefined ? area : null,
          detectError: null,
          isModalOpen: false,
        }),

      detectLocation: async () => {
        if (typeof window === "undefined" || !("geolocation" in navigator)) {
          const errorMsg = "Geolocation is not supported by your browser."
          set({ detectError: errorMsg, isDetecting: false })
          return { success: false, message: errorMsg }
        }

        set({ isDetecting: true, detectError: null })

        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              try {
                const { latitude, longitude } = pos.coords

                // Try our dedicated server reverse geocoding route
                const res = await fetch(`/api/geolocation/reverse?lat=${latitude}&lng=${longitude}`)
                if (res.ok) {
                  const data = await res.json()
                  if (data.success && data.district) {
                    set({
                      selectedDistrict: data.district,
                      detectedArea: data.area || null,
                      coords: { lat: latitude, lng: longitude },
                      isDetecting: false,
                      detectError: null,
                      isModalOpen: false,
                    })
                    resolve({
                      success: true,
                      district: data.district,
                      message: `Location set to ${data.district}${data.area ? ` (${data.area})` : ""}`,
                    })
                    return
                  }
                }

                // Mathematical Haversine fallback to 64 districts
                const nearest = findNearestDistrict(latitude, longitude)
                set({
                  selectedDistrict: nearest.name,
                  detectedArea: null,
                  coords: { lat: latitude, lng: longitude },
                  isDetecting: false,
                  detectError: null,
                  isModalOpen: false,
                })
                resolve({
                  success: true,
                  district: nearest.name,
                  message: `Location set to ${nearest.name}`,
                })
              } catch {
                // If network is offline, client-side calculation never fails
                const nearest = findNearestDistrict(pos.coords.latitude, pos.coords.longitude)
                set({
                  selectedDistrict: nearest.name,
                  detectedArea: null,
                  coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
                  isDetecting: false,
                  detectError: null,
                  isModalOpen: false,
                })
                resolve({
                  success: true,
                  district: nearest.name,
                  message: `Location set to ${nearest.name}`,
                })
              }
            },
            (err) => {
              let msg = "Unable to retrieve your location."
              if (err.code === 1) {
                msg = "Location permission denied. Please allow location access or select manually below."
              } else if (err.code === 2) {
                msg = "GPS signal unavailable. Please select your district manually below."
              } else if (err.code === 3) {
                msg = "Location request timed out. Please try again or select manually."
              }
              set({ detectError: msg, isDetecting: false })
              resolve({ success: false, message: msg })
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000,
            }
          )
        })
      },
    }),
    {
      name: "parloora-user-location",
      partialize: (state) => ({
        selectedDistrict: state.selectedDistrict,
        detectedArea: state.detectedArea,
        coords: state.coords,
      }),
    }
  )
)
