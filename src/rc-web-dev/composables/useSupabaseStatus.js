import { computed, onMounted, ref } from 'vue'
import { SUPABASE_SYNC, pingSupabase, supabaseConfigured } from '../lib/supabaseClient'

export function useSupabaseStatus() {
  const reachable = ref(supabaseConfigured ? null : false)

  onMounted(async () => {
    if (!supabaseConfigured) {
      reachable.value = false
      return
    }
    reachable.value = await pingSupabase()
  })

  const label = computed(() => {
    if (!supabaseConfigured) return 'Supabase off'
    if (reachable.value === null) return 'Supabase…'
    if (!reachable.value) return 'Supabase down'
    if (!SUPABASE_SYNC) return 'Supabase · local'
    return 'Supabase on'
  })

  const title = computed(() => {
    if (!supabaseConfigured) return 'No VITE_SUPABASE_URL / publishable key in .env.local'
    if (reachable.value === null) return 'Checking the project…'
    if (!reachable.value) return 'Keys are set, but the project did not respond'
    if (!SUPABASE_SYNC) return 'Connected. Ticket saves still stay in the browser'
    return 'Connected. Ticket saves write to rc_tickets'
  })

  const tone = computed(() => {
    if (!supabaseConfigured) return 'bg-slate-100 text-slate-600 ring-slate-200'
    if (reachable.value === null) return 'bg-slate-100 text-slate-500 ring-slate-200'
    if (!reachable.value) return 'bg-rose-50 text-rose-800 ring-rose-200'
    if (!SUPABASE_SYNC) return 'bg-amber-50 text-amber-900 ring-amber-200'
    return 'bg-emerald-50 text-emerald-800 ring-emerald-200'
  })

  const dot = computed(() => {
    if (!supabaseConfigured) return 'bg-slate-400'
    if (reachable.value === null) return 'bg-slate-300'
    if (!reachable.value) return 'bg-rose-500'
    if (!SUPABASE_SYNC) return 'bg-amber-500'
    return 'bg-emerald-500'
  })

  return { label, title, tone, dot }
}
