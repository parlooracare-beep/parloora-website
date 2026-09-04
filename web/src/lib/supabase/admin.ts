import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

/**
 * Returns true if SUPABASE_SERVICE_ROLE_KEY is provided in the environment.
 */
export function hasServiceRoleKey(): boolean {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return typeof key === 'string' && key.trim().length > 20
}

/**
 * Creates an administrative Supabase client using SUPABASE_SERVICE_ROLE_KEY.
 * If the service role key is not set, it safely falls back to NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (serviceKey && serviceKey.trim().length > 20) {
    return createClient<Database>(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }

  // Fallback to anon key if service role key is not yet set in environment
  return createClient<Database>(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
