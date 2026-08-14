import { createClient } from '@supabase/supabase-js'

const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim()
const supabasePublishableKey = String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim()

const urlLooksReal = /^https:\/\/[a-z0-9]+\.supabase\.co/i.test(supabaseUrl)
const keyLooksReal =
  supabasePublishableKey.startsWith('sb_publishable_') || supabasePublishableKey.startsWith('eyJ')

export const supabaseConfigured = Boolean(urlLooksReal && keyLooksReal)

/** Ticket create/edit Save writes to rc_tickets when true. */
export const SUPABASE_SYNC = true

export const supabase =
  supabaseConfigured ? createClient(supabaseUrl, supabasePublishableKey) : null

export async function pingSupabase() {
  if (!supabaseConfigured) return false
  try {
    const res = await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/health`, {
      headers: { apikey: supabasePublishableKey },
    })
    return res.ok
  } catch {
    return false
  }
}
