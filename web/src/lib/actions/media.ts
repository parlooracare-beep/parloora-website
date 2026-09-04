"use server"

import { createClient } from "@/lib/supabase/server"
import { logActivity } from "./site"

export async function getMediaFiles() {
  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from("parloora-media")
    .list("", {
      limit: 100,
      sortBy: { column: "created_at", order: "desc" }
    })

  if (error) {
    console.error("Error listing media files:", error)
    return []
  }

  // Generate public URLs for each file
  const filesWithUrls = (data || []).map(file => {
    const { data: publicUrlData } = supabase.storage
      .from("parloora-media")
      .getPublicUrl(file.name)

    return {
      name: file.name,
      id: file.id,
      metadata: file.metadata,
      created_at: file.created_at,
      url: publicUrlData?.publicUrl || ""
    }
  })

  return filesWithUrls
}

export async function uploadMediaFile(fileName: string, base64Data: string, mimeType: string) {
  try {
    const supabase = await createClient()

    // Authenticate user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Not authenticated" }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    const userRole = profile?.role?.toLowerCase()
    if (userRole !== "admin" && userRole !== "editor") {
      return { success: false, error: "Unauthorized. Admin or Editor role required." }
    }

    // Clean filename
    const cleanFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`
    const buffer = Buffer.from(base64Data, "base64")

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data, error } = await supabase.storage
      .from("parloora-media")
      .upload(cleanFileName, buffer, {
        contentType: mimeType,
        upsert: true
      })

    if (error) {
      console.error("Error uploading to Supabase storage:", error)
      return { success: false, error: error.message }
    }

    const { data: publicUrlData } = supabase.storage
      .from("parloora-media")
      .getPublicUrl(cleanFileName)

    await logActivity("MEDIA_UPLOAD", `Uploaded file: ${cleanFileName}`)

    return {
      success: true,
      data: {
        name: cleanFileName,
        url: publicUrlData?.publicUrl || ""
      }
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Exception in uploadMediaFile:", err)
    return { success: false, error: err.message || "Failed to upload file" }
  }
}

export async function deleteMediaFile(fileName: string) {
  const supabase = await createClient()

  // Authenticate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Not authenticated" }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  const userRole = profile?.role?.toLowerCase()
  if (userRole !== "admin" && userRole !== "editor") {
    return { success: false, error: "Unauthorized. Admin or Editor role required." }
  }

  const { error } = await supabase.storage
    .from("parloora-media")
    .remove([fileName])

  if (error) {
    console.error("Error deleting from Supabase storage:", error)
    return { success: false, error: error.message }
  }

  await logActivity("MEDIA_DELETE", `Deleted media asset: ${fileName}`)
  return { success: true }
}
