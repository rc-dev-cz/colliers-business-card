import { computed, ref } from 'vue'
import {
  DEFAULT_ASSIGNEE,
  LOG_LIMIT,
  READY_STATUS,
  STATUSES,
  asCriteria,
  nextCustomId,
  normalizeAssignee,
  normalizeCategory,
  normalizeCustomTicket,
  normalizeReview,
  normalizeStatus,
  reviewFromLog,
  tickets as seedTickets,
} from '../data/devTracker'
import {
  fetchRcTicketLogs,
  fetchRcTickets,
  upsertRcTicket,
} from '../lib/rcTicketsApi'
import { SUPABASE_SYNC } from '../lib/supabaseClient'

try {
  localStorage.removeItem('colliers.devTrackerV4')
} catch {
  /* ignore */
}

const statusById = ref({})
const editsById = ref({})
const customById = ref({})
const logs = ref([])
const creating = ref(false)
const focusId = ref('')
const highlightId = ref('')
const persistError = ref('')
let logSeq = 0
const seedIds = new Set(seedTickets.map((ticket) => ticket.id))

const tickets = computed(() => {
  const custom = Object.values(customById.value).filter((ticket) => ticket?.id && !seedIds.has(ticket.id))
  return [...seedTickets, ...custom]
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
  const next = {
    ...ticket,
    ...edits,
    id: ticket.id,
    status: normalizeStatus(statusById.value[ticket.id] || ticket.status),
  }
  if (!STATUSES.includes(next.status)) next.status = 'Ideas'
  next.category = normalizeCategory(next.category || next.epic)
  next.assignee = normalizeAssignee(next.assignee)
  next.fresh = Boolean(next.fresh)
  next.parentId = next.parentId || null
  next.acceptanceCriteria = asCriteria(next.acceptanceCriteria)
  next.blocked = Boolean(next.blocked)
  next.blockedReason = next.blocked ? String(next.blockedReason || '') : ''
  next.estimatedHours = Number(next.estimatedHours) || 0
  next.dueDate = next.dueDate ? String(next.dueDate) : ''
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

function persistTicket(id) {
  persistError.value = ''
  if (!USE_SUPABASE) return Promise.resolve()
  const ticket = findTicket(id)
  if (!ticket) return Promise.resolve()
  return upsertRcTicket(ticket).catch((error) => {
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
      if (nextStatus[ticket.id] || nextCustom[ticket.id] || nextEdits[ticket.id]) continue
      if (seedIds.has(ticket.id)) {
        nextStatus[ticket.id] = normalizeStatus(ticket.status)
        nextEdits[ticket.id] = {
          title: ticket.title,
          description: ticket.description,
          category: ticket.category,
          notes: ticket.notes,
          origin: ticket.origin,
          assignee: ticket.assignee,
          priority: ticket.priority,
          acceptanceCriteria: ticket.acceptanceCriteria,
          parentId: ticket.parentId,
          blocked: ticket.blocked,
          blockedReason: ticket.blockedReason,
          estimatedHours: ticket.estimatedHours,
          dueDate: ticket.dueDate,
          fresh: ticket.fresh,
        }
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
    if (remoteLogs.length && !logs.value.length) logs.value = remoteLogs
  } catch (error) {
    persistError.value = error?.message || 'Could not load tickets from the database.'
    console.warn('RC Web Dev load failed', error)
  }
}

let hydrateStarted = false

export function hydrateDevBoard() {
  if (!USE_SUPABASE) return
  if (hydrateStarted) return
  hydrateStarted = true
  hydrateFromSupabase()
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
    logs.value = [item, ...logs.value].slice(0, LOG_LIMIT)
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

  function setReadyToWork(id, ready) {
    const ticket = findTicket(id)
    if (!ticket) return null
    if (ready) {
      if (ticket.status !== 'Ideas') return ticket
      patchStored(id, { assignee: ticket.assignee || DEFAULT_ASSIGNEE })
      return setStatus(id, READY_STATUS)
    }
    if (ticket.status !== READY_STATUS) return ticket
    patchStored(id, { assignee: '' })
    return setStatus(id, 'Ideas')
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
    if (fields.parentId !== undefined) patch.parentId = fields.parentId || null
    if (fields.blocked != null) patch.blocked = Boolean(fields.blocked)
    if (fields.blockedReason != null) patch.blockedReason = String(fields.blockedReason)
    if (fields.estimatedHours != null) patch.estimatedHours = Number(fields.estimatedHours) || 0
    if (fields.dueDate != null) patch.dueDate = String(fields.dueDate)
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
    }

    if (changes.length) {
      patch.review = 'updated'
      patch.reviewedAt = new Date().toISOString()
    }

    patchStored(id, patch)

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

  return {
    statusById,
    tickets,
    logs,
    creating,
    focusId,
    highlightId,
    persistError,
    merged,
    setStatus,
    setReadyToWork,
    approveTicket,
    openCreate,
    closeCreate,
    addTicket,
    updateTicket,
    setAcceptanceCriteria,
    persistTicket,
  }
}
