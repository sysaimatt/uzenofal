import { createClient } from '@supabase/supabase-js'

// Szerver-oldali kliens (API route-okhoz)
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Message = {
  id: number
  content: string
  author: string
  created_at: string
  like_count: number
}
