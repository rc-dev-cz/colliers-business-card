import { computed, ref } from 'vue'
import {
  DEFAULT_ASSIGNEE,
  LOG_LIMIT,
  READY_STATUS,
  STATUSES,
  asCriteria,
  asRelatedIds,
  relatedIdsFromRecord,
  nextCustomId,
  normalizeAssignee,
  normalizeCategory,
  normalizeCustomTicket,
  normalizeReview,
  normalizeStatus,
  relatedKey,
  reviewFromLog,
  tickets as seedTickets,
} from '../data/devTracker'
import {
  fetchRcTicketLogs,
  fetchRcTickets,
  insertRcTicketLog,
  upsertRcTicket,
  deleteRcTicket,
} from '../lib/rcTicketsApi'
import { SUPABASE_SYNC, supabase } from '../lib/supabaseClient'
import { clearTicketLocalStorage } from '../../composables/useStorage'

clearTicketLocalStorage()

const statusById = ref({})
const editsById = ref({})
const customById = ref({})
const logs = ref([])
const ticketsReady = ref(!(SUPABASE_SYNC && supabase))
const creating = ref(false)
const focusId = ref('')
const highlightId = ref('')
const persistError = ref('')
const lastSavedById = ref({})
const removedIds = ref([])
let logSeq = 0
const seedIds = new Set(seedTickets.map((ticket) => ticket.id))

function setLogs(list) {
  logs.value = list.slice(0, LOG_LIMIT)
}

const tickets = computed(() => {
  const hidden = new Set(removedIds.value)
  const custom = Object.values(customById.value).filter((ticket) => ticket?.id && !seedIds.has(ticket.id) && !hidden.has(ticket.id))
  return [...seedTickets, ...custom].filter((ticket) => !hidden.has(ticket.id))
})

function hasClearedReview(id) {
  const edits = editsById.value[id]
  if (edits && Object.prototype.hasOwnProperty.call(edits, 'review') && !normalizeReview(edits.review)) {
    return true
  }
  const custom = customById.value[id]
  if (custom && Object.prototype.hasOwnProperty.call(custom, 'review') && !normalizeReview(custom.review)) {
    return true
  }
  return false
}

function latestLogFor(id) {
  return logs.value.find((item) => item.ticketId === id) || null
}

function merged(ticket) {
  const edits = editsById.value[ticket.id] || {}
  const next = { ...ticket, id: ticket.id }
  // Skip undefined overlays so incomplete remote rows cannot wipe seed relatedIds / meta.
  for (const [key, value] of Object.entries(edits)) {
    if (value !== undefined) next[key] = value
  }
  next.status = normalizeStatus(statusById.value[ticket.id] || next.status)
  if (!STATUSES.includes(next.status)) next.status = 'Ideas'
  next.category = normalizeCategory(next.category || next.epic)
  next.assignee = normalizeAssignee(next.assignee)
  next.fresh = Boolean(next.fresh)
  next.relatedIds = relatedIdsFromRecord(next, ticket.id)
  delete next.parentId
  next.acceptanceCriteria = asCriteria(next.acceptanceCriteria)
  next.blocked = Boolean(next.blocked)
  next.blockedReason = next.blocked ? String(next.blockedReason || '') : ''
  next.notes = next.notes == null ? '' : String(next.notes)
  if (hasClearedReview(ticket.id)) {
    next.review = ''
    next.reviewedAt = ''
  } else {
    const log = latestLogFor(ticket.id)
    next.review = log ? reviewFromLog(log) : ''
    next.reviewedAt = log?.at || ''
  }
  return next
}

function findTicket(id) {
  const ticket = tickets.value.find((item) => item.id === id)
  return ticket ? merged(ticket) : null
}

const USE_SUPABASE = SUPABASE_SYNC

function captureSaved(id) {
  const ticket = findTicket(id)
  if (!ticket) return
  lastSavedById.value = {
    ...lastSavedById.value,
    [id]: { status: ticket.status, assignee: ticket.assignee || '' },
  }
}

function captureAllSaved() {
  const next = { ...lastSavedById.value }
  for (const ticket of tickets.value) {
    const current = merged(ticket)
    next[current.id] = { status: current.status, assignee: current.assignee || '' }
  }
  lastSavedById.value = next
}

function hasUnsaved(id) {
  const ticket = findTicket(id)
  const saved = lastSavedById.value[id]
  if (!ticket || !saved) return false
  return ticket.status !== saved.status || (ticket.assignee || '') !== saved.assignee
}

captureAllSaved()

async function persistLog(id, ticket, saved) {
  const local = logs.value.find((item) => item.ticketId === id)
  const entry =
    local ||
    (saved && saved.status !== ticket.status
      ? {
          type: 'moved',
          ticketId: id,
          title: ticket.title,
          from: saved.status,
          to: ticket.status,
          assignee: ticket.assignee || '',
        }
      : null)
  if (!entry) return
  await insertRcTicketLog(entry)
  const remoteLogs = await fetchRcTicketLogs(LOG_LIMIT)
  if (remoteLogs.length) setLogs(remoteLogs)
}

function persistTicket(id) {
  persistError.value = ''
  const ticket = findTicket(id)
  if (!ticket) return Promise.resolve()
  const saved = lastSavedById.value[id]
  if (!USE_SUPABASE) {
    captureSaved(id)
    return Promise.resolve()
  }
  return upsertRcTicket(ticket)
    .then(async () => {
      try {
        await persistLog(id, ticket, saved)
      } catch (error) {
        console.warn('RC Web Dev log save failed', error)
      }
      captureSaved(id)
    })
    .catch((error) => {
      const message = error?.message || 'Could not save to the database.'
      persistError.value = message
      console.warn('RC Web Dev save failed', error)
      throw error
    })
}

async function hydrateFromSupabase() {
  try {
    const [remoteTickets, remoteLogs] = await Promise.all([
      fetchRcTickets(),
      fetchRcTicketLogs(LOG_LIMIT),
    ])
    const nextCustom = { ...customById.value }
    const nextStatus = { ...statusById.value }
    const nextEdits = { ...editsById.value }

    for (const ticket of remoteTickets) {
      if (removedIds.value.includes(ticket.id)) continue
      if (nextStatus[ticket.id] || nextCustom[ticket.id] || nextEdits[ticket.id]) continue
      if (seedIds.has(ticket.id)) {
        nextStatus[ticket.id] = normalizeStatus(ticket.status)
        const edit = {
          origin: ticket.origin,
          assignee: ticket.assignee,
          priority: ticket.priority,
          fresh: ticket.fresh,
        }
        // Git seed owns relatedIds for known tickets. Remote parentId rows must not hide it.
        if (ticket.blocked !== undefined) edit.blocked = ticket.blocked
        if (ticket.blockedReason !== undefined) edit.blockedReason = ticket.blockedReason
        nextEdits[ticket.id] = edit
        if (ticket.review === '') {
          nextEdits[ticket.id].review = ''
          nextEdits[ticket.id].reviewedAt = ''
        }
      } else {
        nextCustom[ticket.id] = normalizeCustomTicket(ticket, ticket.id)
        nextStatus[ticket.id] = nextCustom[ticket.id].status
      }
    }

    customById.value = nextCustom
    statusById.value = nextStatus
    editsById.value = nextEdits
    if (remoteLogs.length) setLogs(remoteLogs)
    captureAllSaved()
  } catch (error) {
    persistError.value = error?.message || 'Could not load tickets from the database.'
    console.warn('RC Web Dev load failed', error)
  }
}

let hydrateStarted = false

export async function hydrateDevBoard() {
  if (hydrateStarted) return
  hydrateStarted = true
  if (!USE_SUPABASE || !supabase) {
    ticketsReady.value = true
    return
  }
  try {
    await hydrateFromSupabase()
  } finally {
    ticketsReady.value = true
  }
}

export function useDevBoard() {
  function addLog(entry) {
    logSeq += 1
    const ticket = entry.ticketId ? findTicket(entry.ticketId) : null
    const item = {
      id: `L-${Date.now()}-${logSeq}`,
      at: new Date().toISOString(),
      title: '',
      from: '',
      to: '',
      changes: [],
      assignee: ticket?.assignee || '',
      ...entry,
    }
    if (!item.assignee) item.assignee = ticket?.assignee || ''
    setLogs([item, ...logs.value])
  }

  function syncRelatedLinks(id, previousIds, nextIds) {
    const previous = new Set(previousIds)
    const next = new Set(nextIds)
    for (const otherId of next) {
      if (previous.has(otherId)) continue
      const other = findTicket(otherId)
      if (!other) continue
      const ids = asRelatedIds(other.relatedIds, otherId)
      if (!ids.includes(id)) patchStored(otherId, { relatedIds: [...ids, id] })
    }
    for (const otherId of previous) {
      if (next.has(otherId)) continue
      const other = findTicket(otherId)
      if (!other) continue
      patchStored(otherId, { relatedIds: asRelatedIds(other.relatedIds, otherId).filter((item) => item !== id) })
    }
  }

  function patchStored(id, patch) {
    if (customById.value[id]) {
      customById.value = {
        ...customById.value,
        [id]: { ...customById.value[id], ...patch, id },
      }
      return
    }
    editsById.value = {
      ...editsById.value,
      [id]: { ...(editsById.value[id] || {}), ...patch },
    }
  }

  function revertUnsaved(id) {
    const saved = lastSavedById.value[id]
    if (!saved) return
    statusById.value = { ...statusById.value, [id]: saved.status }
    patchStored(id, { assignee: saved.assignee })
    const idx = logs.value.findIndex((item) => item.ticketId === id && item.type === 'moved')
    if (idx !== -1) {
      setLogs(logs.value.filter((_, index) => index !== idx))
    }
  }

  function setReview(id, review) {
    if (!id) return
    const next = normalizeReview(review)
    patchStored(id, {
      review: next,
      reviewedAt: next ? new Date().toISOString() : '',
    })
  }

  function approveTicket(id) {
    setReview(id, '')
  }

  function clearFresh(id) {
    if (customById.value[id]?.fresh) {
      customById.value = {
        ...customById.value,
        [id]: { ...customById.value[id], fresh: false },
      }
    }
    if (editsById.value[id]?.fresh) {
      editsById.value = {
        ...editsById.value,
        [id]: { ...editsById.value[id], fresh: false },
      }
    }
  }

  function setStatus(id, toStatus) {
    if (!id || !STATUSES.includes(toStatus)) return null
    const ticket = findTicket(id)
    const fromStatus = statusById.value[id] || ticket?.status
    if (!fromStatus || fromStatus === toStatus) return ticket
    if (toStatus === 'Ideas') {
      patchStored(id, { assignee: '' })
    } else if (!normalizeAssignee(ticket?.assignee)) {
      patchStored(id, { assignee: DEFAULT_ASSIGNEE })
    }
    statusById.value = { ...statusById.value, [id]: toStatus }
    clearFresh(id)
    setReview(id, toStatus === 'In progress' ? 'in-progress' : 'updated')
    addLog({
      type: 'moved',
      ticketId: id,
      title: ticket?.title || id,
      from: fromStatus,
      to: toStatus,
    })
    return findTicket(id)
  }

  function openCreate() {
    creating.value = true
  }

  function closeCreate() {
    creating.value = false
  }

  function addTicket(fields) {
    const id = nextCustomId(tickets.value.map((ticket) => ticket.id))
    const ticket = normalizeCustomTicket(
      {
        ...fields,
        status: 'Ideas',
        category: fields.category || 'Technical',
        id,
        fresh: true,
        review: 'new',
        reviewedAt: new Date().toISOString(),
      },
      id,
    )
    customById.value = { ...customById.value, [id]: ticket }
    statusById.value = { ...statusById.value, [id]: ticket.status }
    addLog({
      type: 'created',
      ticketId: id,
      title: ticket.title,
      to: ticket.status,
    })
    highlightId.value = id
    closeCreate()
    persistTicket(id)
    return ticket
  }

  function updateTicket(id, fields) {
    if (!id) return null
    const current = findTicket(id)
    const patch = {}
    if (fields.title != null) patch.title = String(fields.title).trim() || 'Untitled'
    if (fields.description != null) patch.description = String(fields.description)
    if (fields.priority != null) patch.priority = fields.priority
    if (fields.assignee != null) patch.assignee = fields.assignee
    if (fields.category != null) patch.category = normalizeCategory(fields.category)
    if (fields.acceptanceCriteria != null) patch.acceptanceCriteria = asCriteria(fields.acceptanceCriteria)
    if (fields.relatedIds !== undefined) patch.relatedIds = asRelatedIds(fields.relatedIds, id)
    if (fields.blocked != null) patch.blocked = Boolean(fields.blocked)
    if (fields.blockedReason != null) patch.blockedReason = String(fields.blockedReason)
    if (fields.notes != null) patch.notes = String(fields.notes)
    if (fields.origin != null) patch.origin = fields.origin
    if (fields.fresh != null) patch.fresh = Boolean(fields.fresh)

    if (patch.blocked === false) patch.blockedReason = ''

    const changes = []
    if (current) {
      if (patch.title != null && patch.title !== current.title) {
        changes.push({ field: 'title', from: current.title, to: patch.title })
      }
      if (patch.description != null && patch.description !== current.description) {
        changes.push({ field: 'description', from: current.description, to: patch.description })
      }
      if (patch.priority != null && patch.priority !== current.priority) {
        changes.push({ field: 'priority', from: current.priority, to: patch.priority })
      }
      if (patch.assignee != null && normalizeAssignee(patch.assignee) !== current.assignee) {
        changes.push({
          field: 'assignee',
          from: current.assignee || 'Unassigned',
          to: normalizeAssignee(patch.assignee) || 'Unassigned',
        })
      }
      if (patch.category != null && patch.category !== current.category) {
        changes.push({ field: 'category', from: current.category, to: patch.category })
      }
      if (patch.blocked != null && patch.blocked !== current.blocked) {
        changes.push({ field: 'blocked', from: current.blocked ? 'Yes' : 'No', to: patch.blocked ? 'Yes' : 'No' })
      }
      if (patch.notes != null && patch.notes !== current.notes) {
        changes.push({ field: 'notes', from: current.notes, to: patch.notes })
      }
      if (patch.acceptanceCriteria != null) {
        const from = asCriteria(current.acceptanceCriteria)
          .map((item) => item.text)
          .join('\n')
        const to = asCriteria(patch.acceptanceCriteria)
          .map((item) => item.text)
          .join('\n')
        if (from !== to) {
          changes.push({ field: 'acceptanceCriteria', from, to })
        }
      }
      if (patch.relatedIds !== undefined && relatedKey(patch.relatedIds) !== relatedKey(current.relatedIds)) {
        changes.push({
          field: 'relatedIds',
          from: relatedKey(current.relatedIds) || 'None',
          to: relatedKey(patch.relatedIds) || 'None',
        })
      }
    }

    if (changes.length) {
      patch.review = 'updated'
      patch.reviewedAt = new Date().toISOString()
    }

    const previousRelated = current ? asRelatedIds(current.relatedIds, id) : []
    patchStored(id, patch)
    if (patch.relatedIds) {
      syncRelatedLinks(id, previousRelated, patch.relatedIds)
    }

    if (changes.length) {
      addLog({
        type: 'updated',
        ticketId: id,
        title: patch.title || current?.title || id,
        changes,
      })
    }

    return findTicket(id)
  }

  function setAcceptanceCriteria(id, list) {
    if (!id) return
    patchStored(id, { acceptanceCriteria: asCriteria(list) })
  }

  async function removeTicket(id) {
    if (!id) return
    persistError.value = ''
    const current = findTicket(id)
    const related = current ? asRelatedIds(current.relatedIds, id) : []
    if (current) syncRelatedLinks(id, related, [])
    if (USE_SUPABASE) {
      for (const otherId of related) {
        try {
          await persistTicket(otherId)
        } catch {
          /* keep going so the ticket can still be removed */
        }
      }
      await deleteRcTicket(id)
    }
    if (!removedIds.value.includes(id)) {
      removedIds.value = [...removedIds.value, id]
    }
    if (customById.value[id]) {
      const next = { ...customById.value }
      delete next[id]
      customById.value = next
    }
    if (editsById.value[id]) {
      const next = { ...editsById.value }
      delete next[id]
      editsById.value = next
    }
    if (statusById.value[id]) {
      const next = { ...statusById.value }
      delete next[id]
      statusById.value = next
    }
    if (lastSavedById.value[id]) {
      const next = { ...lastSavedById.value }
      delete next[id]
      lastSavedById.value = next
    }
    setLogs(logs.value.filter((item) => item.ticketId !== id))
  }

  return {
    statusById,
    tickets,
    logs,
    ticketsReady,
    creating,
    focusId,
    highlightId,
    persistError,
    merged,
    setStatus,
    approveTicket,
    openCreate,
    closeCreate,
    addTicket,
    updateTicket,
    setAcceptanceCriteria,
    persistTicket,
    hasUnsaved,
    revertUnsaved,
    removeTicket,
  }
}
