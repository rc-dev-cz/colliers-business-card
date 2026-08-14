import { supabase } from './supabaseClient'
import { categoryToEpic, asCriteria, normalizeCategory, statusToRow } from '../data/devTracker'

function encodeSource(ticket) {
  const notes = ticket.notes || ''
  const acceptanceCriteria = asCriteria(ticket.acceptanceCriteria)
  if (!acceptanceCriteria.length) return notes
  return JSON.stringify({ notes, acceptanceCriteria })
}

function decodeSource(raw) {
  const source = String(raw || '')
  if (source.startsWith('{')) {
    try {
      const parsed = JSON.parse(source)
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.acceptanceCriteria)) {
        return {
          notes: String(parsed.notes || ''),
          acceptanceCriteria: asCriteria(parsed.acceptanceCriteria),
        }
      }
    } catch {
      /* plain notes */
    }
  }
  return { notes: source, acceptanceCriteria: [] }
}

function ticketToRow(ticket) {
  return {
    code: ticket.id,
    title: ticket.title,
    description: ticket.description || '',
    status: statusToRow(ticket.status),
    epic: categoryToEpic(ticket.category),
    source: encodeSource(ticket),
    origin: ticket.origin || 'now',
    assignee: ticket.assignee || '',
    priority: ticket.priority || 'medium',
    fresh: Boolean(ticket.fresh),
    review: ticket.review || '',
    updated_at: new Date().toISOString(),
  }
}

export function rowToTicket(row) {
  const packed = decodeSource(row.notes || row.source || '')
  return {
    id: row.code,
    title: row.title,
    description: row.description || '',
    status: row.status,
    category: normalizeCategory(row.category || row.epic),
    notes: packed.notes,
    acceptanceCriteria: packed.acceptanceCriteria,
    origin: row.origin || 'now',
    assignee: row.assignee || '',
    priority: row.priority || 'medium',
    fresh: Boolean(row.fresh),
    review: row.review || '',
    reviewedAt: row.updated_at || '',
  }
}

export function rowToLog(row) {
  return {
    id: `L-${row.id}`,
    at: row.created_at,
    type: row.type,
    ticketId: row.ticket_code,
    title: row.title || '',
    assignee: row.assignee || '',
    from: row.from_status || '',
    to: row.to_status || '',
    changes: Array.isArray(row.changes) ? row.changes : [],
  }
}

export async function fetchRcTickets() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('rc_tickets')
    .select('*')
    .order('code')
  if (error) throw error
  return (data || []).map(rowToTicket)
}

export async function fetchRcTicketLogs(limit) {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('rc_ticket_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data || []).map(rowToLog)
}

export async function upsertRcTicket(ticket) {
  if (!supabase) return
  const { error } = await supabase
    .from('rc_tickets')
    .upsert(ticketToRow(ticket), { onConflict: 'code' })
  if (error) throw error
}

export async function insertRcTicketLog(entry) {
  if (!supabase) return
  const { error } = await supabase.from('rc_ticket_logs').insert({
    ticket_code: entry.ticketId,
    type: entry.type,
    title: entry.title || '',
    from_status: entry.from || '',
    to_status: entry.to || '',
    changes: entry.changes || [],
  })
  if (error) throw error
}
