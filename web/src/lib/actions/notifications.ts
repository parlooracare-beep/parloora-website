"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getNotifications() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching notifications:", error)
    return []
  }

  return data
}

export async function createNotification(data: {
  user_id: string
  title: string
  message: string
  type: "booking" | "system" | "offer" | "order"
  link?: string
}) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("notifications")
    .insert([
      {
        ...data,
        status: "unread",
      },
    ])

  if (error) {
    console.error("Error creating notification:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function markAsRead(notificationId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("notifications")
    .update({ status: "read" })
    .eq("id", notificationId)

  if (error) {
    console.error("Error marking notification as read:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/")
  return { success: true }
}

export async function markAllAsRead() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false }

  const { error } = await supabase
    .from("notifications")
    .update({ status: "read" })
    .eq("user_id", user.id)

  if (error) {
    console.error("Error marking all as read:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/")
  return { success: true }
}

export async function deleteNotification(notificationId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)

  if (error) {
    console.error("Error deleting notification:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/")
  return { success: true }
}

export async function clearAllNotifications() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false }

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("user_id", user.id)

  if (error) {
    console.error("Error clearing all notifications:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/")
  return { success: true }
}
