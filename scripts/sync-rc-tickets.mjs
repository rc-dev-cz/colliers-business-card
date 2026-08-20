/**
 * Push docs/devTracker.json tickets into Supabase rc_tickets (incl. relatedIds in source).
 * Usage: node scripts/sync-rc-tickets.mjs
 */
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function loadEnvLocal() {
  const raw = readFileSync(resolve(root, '.env.local'), 'utf8')
  const env = {}
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const i = trimmed.indexOf('=')
    if (i === -1) continue
    env[trimmed.slice(0, i).trim()] = trimmed.slice(i + 1).trim()
  }
  return env
}

const EPIC_FROM_CATEGORY = {
  'Customer Portal': 'User',
  'Admin Portal': 'Admin',
  'Shared UI/UX': 'Polish',
  'Quality Assurance': 'Tests',
  Technical: 'Dev',
}

const READY_STATUS = 'Ready for development'
const STATUSES = ['Ideas', READY_STATUS, 'In progress', 'QA', 'Done']

function asCriteria(value) {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (item && typeof item === 'object') {
        const text = String(item.text || '').trim()
        return text ? { text, done: Boolean(item.done) } : null
      }
      const text = String(item || '').trim()
      return text ? { text, done: false } : null
    })
    .filter(Boolean)
}

function encodeSource(ticket) {
  const notes = ticket.notes || ''
  const acceptanceCriteria = asCriteria(ticket.acceptanceCriteria)
  const relatedIds = Array.isArray(ticket.relatedIds) ? ticket.relatedIds.filter(Boolean) : []
  const blocked = Boolean(ticket.blocked)
  const blockedReason = blocked ? String(ticket.blockedReason || '') : ''
  const needsPack = acceptanceCriteria.length || relatedIds.length || blocked
  if (!needsPack) return notes
  return JSON.stringify({
    notes,
    acceptanceCriteria,
    relatedIds,
    blocked,
    blockedReason,
  })
}

function statusToRow(status) {
  if (status === READY_STATUS) return 'To do'
  return STATUSES.includes(status) ? status : 'Ideas'
}

function ticketToRow(ticket) {
  return {
    code: ticket.id,
    title: ticket.title,
    description: ticket.description || '',
    status: statusToRow(ticket.status),
    epic: EPIC_FROM_CATEGORY[ticket.category] || 'Dev',
    source: encodeSource(ticket),
    origin: ticket.origin || 'docs',
    assignee: ticket.assignee || '',
    priority: ticket.priority || 'medium',
    fresh: Boolean(ticket.fresh),
    review: ['new', 'updated', 'in-progress'].includes(ticket.review) ? ticket.review : '',
    updated_at: new Date().toISOString(),
  }
}

const env = loadEnvLocal()
const url = env.VITE_SUPABASE_URL
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY
if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env.local')
  process.exit(1)
}

const tracker = JSON.parse(readFileSync(resolve(root, 'docs/devTracker.json'), 'utf8'))
const tickets = tracker.tickets || []
const withRelated = tickets.filter((t) => Array.isArray(t.relatedIds) && t.relatedIds.length).length

const supabase = createClient(url, key)
const rows = tickets.map(ticketToRow)

const chunkSize = 50
let ok = 0
for (let i = 0; i < rows.length; i += chunkSize) {
  const chunk = rows.slice(i, i + chunkSize)
  const { error } = await supabase.from('rc_tickets').upsert(chunk, { onConflict: 'code' })
  if (error) {
    console.error('Upsert failed at', i, error.message)
    process.exit(1)
  }
  ok += chunk.length
  console.log(`Upserted ${ok}/${rows.length}`)
}

console.log(`Done. ${rows.length} tickets synced (${withRelated} with relatedIds).`)
