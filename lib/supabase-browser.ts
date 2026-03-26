import { createClient } from '@supabase/supabase-js'

// Böngésző-oldali kliens (valós idejű frissítéshez)
// Szükséges env var-ok Vercelben: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const supabaseBrowser = url && key ? createClient(url, key) : null
