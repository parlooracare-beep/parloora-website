"use server"

import { createClient } from "@/lib/supabase/server"
import { Database } from "@/types/supabase"

type ServiceInsert = Database["public"]["Tables"]["services"]["Insert"]
type ServiceUpdate = Database["public"]["Tables"]["services"]["Update"]

export async function getSellerServices(parlourId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("parlour_id", parlourId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching services:", error)
    return []
  }

  return data
}

export async function createService(serviceData: ServiceInsert) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("services")
    .insert([serviceData])
    .select()
    .single()

  if (error) {
    console.error("Error creating service:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function updateService(serviceId: string, serviceData: ServiceUpdate) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("services")
    .update(serviceData)
    .eq("id", serviceId)
    .select()
    .single()

  if (error) {
    console.error("Error updating service:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function deleteService(serviceId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", serviceId)

  if (error) {
    console.error("Error deleting service:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
