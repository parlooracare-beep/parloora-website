"use server"

import { createClient } from "@/lib/supabase/server"

/**
 * Fetch all staff members for a parlour along with their assigned service IDs
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getStaffByParlour(parlourId: string): Promise<any[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("staff" as any)
    .select("*, staff_services:staff_services(service_id)")
    .eq("parlour_id", parlourId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching staff:", error)
    return []
  }

  // Format the assigned service IDs into a flat array for easier UI handling
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((member: any) => ({
    ...member,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assignedServices: (member.staff_services || []).map((s: any) => s.service_id),
  }))
}

/**
 * Register a new staff member and assign services to them
 */
export async function createStaff(payload: {
  parlour_id: string
  name: string
  title: string
  bio?: string
  avatar_url?: string
  is_active?: boolean
  serviceIds?: string[]
}) {
  const supabase = await createClient()
  const { serviceIds, ...staffData } = payload

  // 1. Create staff profile
  const { data: staff, error: staffError } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("staff" as any)
    .insert([staffData])
    .select()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .single() as any

  if (staffError) {
    console.error("Error creating staff profile:", staffError)
    return { success: false, error: staffError.message }
  }

  // 2. Map services if provided
  if (serviceIds && serviceIds.length > 0) {
    const mappings = serviceIds.map((serviceId) => ({
      staff_id: staff.id,
      service_id: serviceId,
    }))

    const { error: mappingError } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from("staff_services" as any)
      .insert(mappings)

    if (mappingError) {
      console.error("Error mapping staff services:", mappingError)
      return { success: false, error: "Profile created, but failed to assign services." }
    }
  }

  return { success: true, data: staff }
}

/**
 * Update staff details and service mappings
 */
export async function updateStaff(
  staffId: string,
  payload: {
    name?: string
    title?: string
    bio?: string
    avatar_url?: string
    is_active?: boolean
    serviceIds?: string[]
  }
) {
  const supabase = await createClient()
  const { serviceIds, ...staffData } = payload

  // 1. Update staff profile fields
  const { data: staff, error: staffError } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("staff" as any)
    .update({ ...staffData, updated_at: new Date().toISOString() })
    .eq("id", staffId)
    .select()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .single() as any

  if (staffError) {
    console.error("Error updating staff profile:", staffError)
    return { success: false, error: staffError.message }
  }

  // 2. Update service mappings if provided
  if (serviceIds !== undefined) {
    // Delete existing mappings
    const { error: deleteError } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from("staff_services" as any)
      .delete()
      .eq("staff_id", staffId)

    if (deleteError) {
      console.error("Error removing old staff service mappings:", deleteError)
      return { success: false, error: "Failed to update service mappings." }
    }

    // Insert new mappings
    if (serviceIds.length > 0) {
      const mappings = serviceIds.map((serviceId) => ({
        staff_id: staffId,
        service_id: serviceId,
      }))

      const { error: insertError } = await supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from("staff_services" as any)
        .insert(mappings)

      if (insertError) {
        console.error("Error inserting new staff service mappings:", insertError)
        return { success: false, error: "Profile updated, but failed to map new services." }
      }
    }
  }

  return { success: true, data: staff }
}

/**
 * Delete a staff member profile (cascade will clean up mappings)
 */
export async function deleteStaff(staffId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("staff" as any)
    .delete()
    .eq("id", staffId)

  if (error) {
    console.error("Error deleting staff member:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Fetch all active staff members assigned to a specific service
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getStaffForService(serviceId: string): Promise<any[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("staff" as any)
    .select("*, staff_services!inner(service_id)")
    .eq("is_active", true)
    .eq("staff_services.service_id", serviceId)

  if (error) {
    console.error("Error fetching staff for service:", error)
    return []
  }

  return data || []
}
