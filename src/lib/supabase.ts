import { createClient } from '@supabase/supabase-js'
import type { Database } from './database'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !key) {
  throw new Error(
    'Не заданы VITE_SUPABASE_URL и VITE_SUPABASE_PUBLISHABLE_KEY. Скопируйте .env.example в .env.local.',
  )
}

export const supabase = createClient<Database>(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export function authRedirectUrl(): string {
  return `${window.location.origin}${window.location.pathname}`
}
