import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

/**
 * Creates a stateless public Supabase client using NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * Does not read or write cookies, preventing Next.js from bailing out of static/ISR caching
 * on public queries (theme settings, categories, public content, etc.).
 */
export function createPublicClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
