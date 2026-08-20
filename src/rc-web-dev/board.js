import Vue from 'vue'
import {
  DEFAULT_ASSIGNEE,
  LOG_LIMIT,
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
} from './data/devTracker'
import {
  fetchRcTicketLogs,
  fetchRcTickets,
  insertRcTicketLog,
  upsertRcTicket,
  deleteRcTicket,
} from './lib/rcTicketsApi'
import { SUPABASE_SYNC, supabase } from './lib/supabaseClient'
import { clearTicketLocalStorage } from '../helpers/storage'

clearTicketLocalStorage()

export const board = Vue.observable({
  statusById: {},
  editsById: {},
  customById: {},
  logs: [],
  ticketsReady: !(SUPABASE_SYNC && supabase),
  creating: false,
  focusId: '',
  highlightId: '',
  persistError: '',
  lastSavedById: {},
  removedIds: [],
})

let logSeq = 0
const seedIds = new Set(seedTickets.map(function (ticket) {
  return ticket.id
}))

function setLogs(list) {
  board.logs = list.slice(0, LOG_LIMIT)
}

export function getTickets() {
  const hidden = new Set(board.removedIds)
  const custom = Object.values(board.customById).filter(function (ticket) {
    return ticket && ticket.id && !seedIds.has(ticket.id) && !hidden.has(ticket.id)
  })
  return seedTickets.concat(custom).filter(function (ticket) {
    return !hidden.has(ticket.id)
  })
}

function hasClearedReview(id) {
  const edits = board.editsById[id]
  if (edits && Object.prototype.hasOwnProperty.call(edits, 'review') && !normalizeReview(edits.review)) {
    return true
  }
  const custom = board.customById[id]
  if (custom && Object.prototype.hasOwnProperty.call(custom, 'review') && !normalizeReview(custom.review)) {
    return true
  }
  return false
}

function latestLogFor(id) {
  return board.logs.find(function (item) {
    return item.ticketId === id
  }) || null
}

export function merged(ticket) {
  const edits = board.editsById[ticket.id] || {}
  const next = Object.assign({}, ticket, { id: ticket.id })
  Object.keys(edits).forEach(function (key) {
    if (edits[key] !== undefined) next[key] = edits[key]
  })
  next.status = normalizeStatus(board.statusById[ticket.id] || next.status)
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
    next.reviewedAt = (log && log.at) || ''
  }
  return next
}

export function findTicket(id) {
  const ticket = getTickets().find(function (item) {
    return item.id === id
  })
  return ticket ? merged(ticket) : null
}

const USE_SUPABASE = SUPABASE_SYNC

function captureSaved(id) {
  const ticket = findTicket(id)
  if (!ticket) return
  board.lastSavedById = Object.assign({}, board.lastSavedById, {
    [id]: { status: ticket.status, assignee: ticket.assignee || '' },
  })
}

function captureAllSaved() {
  const next = Object.assign({}, board.lastSavedById)
  getTickets().forEach(function (ticket) {
    const current = merged(ticket)
    next[current.id] = { status: current.status, assignee: current.assignee || '' }
  })
  board.lastSavedById = next
}

export function hasUnsaved(id) {
  const ticket = findTicket(id)
  const saved = board.lastSavedById[id]
  if (!ticket || !saved) return false
  return ticket.status !== saved.status || (ticket.assignee || '') !== saved.assignee
}

captureAllSaved()

async function persistLog(id, ticket, saved) {
  const local = board.logs.find(function (item) {
    return item.ticketId === id
  })
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

export function persistTicket(id) {
  board.persistError = ''
  const ticket = findTicket(id)
  if (!ticket) return Promise.resolve()
  const saved = board.lastSavedById[id]
  if (!USE_SUPABASE) {
    captureSaved(id)
    return Promise.resolve()
  }
  return upsertRcTicket(ticket)
    .then(async function () {
      try {
        await persistLog(id, ticket, saved)
      } catch (error) {
        console.warn('RC Web Dev log save failed', error)
      }
      captureSaved(id)
    })
    .catch(function (error) {
      const message = (error && error.message) || 'Could not save to the database.'
      board.persistError = message
      console.warn('RC Web Dev save failed', error)
      throw error
    })
}

async function hydrateFromSupabase() {
  try {
    const results = await Promise.all([fetchRcTickets(), fetchRcTicketLogs(LOG_LIMIT)])
    const remoteTickets = results[0]
    const remoteLogs = results[1]
    const nextCustom = Object.assign({}, board.customById)
    const nextStatus = Object.assign({}, board.statusById)
    const nextEdits = Object.assign({}, board.editsById)

    remoteTickets.forEach(function (ticket) {
      if (board.removedIds.indexOf(ticket.id) !== -1) return
      if (nextStatus[ticket.id] || nextCustom[ticket.id] || nextEdits[ticket.id]) return
      if (seedIds.has(ticket.id)) {
        nextStatus[ticket.id] = normalizeStatus(ticket.status)
        const edit = {
          origin: ticket.origin,
          assignee: ticket.assignee,
          priority: ticket.priority,
          fresh: ticket.fresh,
        }
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
    })

    board.customById = nextCustom
    board.statusById = nextStatus
    board.editsById = nextEdits
    if (remoteLogs.length) setLogs(remoteLogs)
    captureAllSaved()
  } catch (error) {
    board.persistError = (error && error.message) || 'Could not load tickets from the database.'
    console.warn('RC Web Dev load failed', error)
  }
}

let hydrateStarted = false

export async function hydrateDevBoard() {
  if (hydrateStarted) return
  hydrateStarted = true
  if (!USE_SUPABASE || !supabase) {
    board.ticketsReady = true
    return
  }
  try {
    await hydrateFromSupabase()
  } finally {
    board.ticketsReady = true
  }
}

function addLog(entry) {
  logSeq += 1
  const ticket = entry.ticketId ? findTicket(entry.ticketId) : null
  const item = Object.assign(
    {
      id: 'L-' + Date.now() + '-' + logSeq,
      at: new Date().toISOString(),
      title: '',
      from: '',
      to: '',
      changes: [],
      assignee: (ticket && ticket.assignee) || '',
    },
    entry,
  )
  if (!item.assignee) item.assignee = (ticket && ticket.assignee) || ''
  setLogs([item].concat(board.logs))
}

function syncRelatedLinks(id, previousIds, nextIds) {
  const previous = new Set(previousIds)
  const next = new Set(nextIds)
  next.forEach(function (otherId) {
    if (previous.has(otherId)) return
    const other = findTicket(otherId)
    if (!other) return
    const ids = asRelatedIds(other.relatedIds, otherId)
    if (ids.indexOf(id) === -1) patchStored(otherId, { relatedIds: ids.concat([id]) })
  })
  previous.forEach(function (otherId) {
    if (next.has(otherId)) return
    const other = findTicket(otherId)
    if (!other) return
    patchStored(otherId, {
      relatedIds: asRelatedIds(other.relatedIds, otherId).filter(function (item) {
        return item !== id
      }),
    })
  })
}

function patchStored(id, patch) {
  if (board.customById[id]) {
    board.customById = Object.assign({}, board.customById, {
      [id]: Object.assign({}, board.customById[id], patch, { id: id }),
    })
    return
  }
  board.editsById = Object.assign({}, board.editsById, {
    [id]: Object.assign({}, board.editsById[id] || {}, patch),
  })
}

export function revertUnsaved(id) {
  const saved = board.lastSavedById[id]
  if (!saved) return
  board.statusById = Object.assign({}, board.statusById, { [id]: saved.status })
  patchStored(id, { assignee: saved.assignee })
  const idx = board.logs.findIndex(function (item) {
    return item.ticketId === id && item.type === 'moved'
  })
  if (idx !== -1) {
    setLogs(
      board.logs.filter(function (_, index) {
        return index !== idx
      }),
    )
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

export function approveTicket(id) {
  setReview(id, '')
}

function clearFresh(id) {
  if (board.customById[id] && board.customById[id].fresh) {
    board.customById = Object.assign({}, board.customById, {
      [id]: Object.assign({}, board.customById[id], { fresh: false }),
    })
  }
  if (board.editsById[id] && board.editsById[id].fresh) {
    board.editsById = Object.assign({}, board.editsById, {
      [id]: Object.assign({}, board.editsById[id], { fresh: false }),
    })
  }
}

export function setStatus(id, toStatus) {
  if (!id || !STATUSES.includes(toStatus)) return null
  const ticket = findTicket(id)
  const fromStatus = board.statusById[id] || (ticket && ticket.status)
  if (!fromStatus || fromStatus === toStatus) return ticket
  if (toStatus === 'Ideas') {
    patchStored(id, { assignee: '' })
  } else if (!normalizeAssignee(ticket && ticket.assignee)) {
    patchStored(id, { assignee: DEFAULT_ASSIGNEE })
  }
  board.statusById = Object.assign({}, board.statusById, { [id]: toStatus })
  clearFresh(id)
  setReview(id, toStatus === 'In progress' ? 'in-progress' : 'updated')
  addLog({
    type: 'moved',
    ticketId: id,
    title: (ticket && ticket.title) || id,
    from: fromStatus,
    to: toStatus,
  })
  return findTicket(id)
}

export function openCreate() {
  board.creating = true
}

export function closeCreate() {
  board.creating = false
}

export function addTicket(fields) {
  const id = nextCustomId(
    getTickets().map(function (ticket) {
      return ticket.id
    }),
  )
  const ticket = normalizeCustomTicket(
    Object.assign({}, fields, {
      status: 'Ideas',
      category: fields.category || 'Technical',
      id: id,
      fresh: true,
      review: 'new',
      reviewedAt: new Date().toISOString(),
    }),
    id,
  )
  board.customById = Object.assign({}, board.customById, { [id]: ticket })
  board.statusById = Object.assign({}, board.statusById, { [id]: ticket.status })
  addLog({
    type: 'created',
    ticketId: id,
    title: ticket.title,
    to: ticket.status,
  })
  board.highlightId = id
  closeCreate()
  persistTicket(id)
  return ticket
}

export function updateTicket(id, fields) {
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
        .map(function (item) {
          return item.text
        })
        .join('\n')
      const to = asCriteria(patch.acceptanceCriteria)
        .map(function (item) {
          return item.text
        })
        .join('\n')
      if (from !== to) {
        changes.push({ field: 'acceptanceCriteria', from: from, to: to })
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
      title: patch.title || (current && current.title) || id,
      changes: changes,
    })
  }

  return findTicket(id)
}

export function setAcceptanceCriteria(id, list) {
  if (!id) return
  patchStored(id, { acceptanceCriteria: asCriteria(list) })
}

export async function removeTicket(id) {
  if (!id) return
  board.persistError = ''
  const current = findTicket(id)
  const related = current ? asRelatedIds(current.relatedIds, id) : []
  if (current) syncRelatedLinks(id, related, [])
  if (USE_SUPABASE) {
    for (let i = 0; i < related.length; i += 1) {
      try {
        await persistTicket(related[i])
      } catch (error) {
        /* keep going */
      }
    }
    await deleteRcTicket(id)
  }
  if (board.removedIds.indexOf(id) === -1) {
    board.removedIds = board.removedIds.concat([id])
  }
  if (board.customById[id]) {
    const next = Object.assign({}, board.customById)
    delete next[id]
    board.customById = next
  }
  if (board.editsById[id]) {
    const next = Object.assign({}, board.editsById)
    delete next[id]
    board.editsById = next
  }
  if (board.statusById[id]) {
    const next = Object.assign({}, board.statusById)
    delete next[id]
    board.statusById = next
  }
  if (board.lastSavedById[id]) {
    const next = Object.assign({}, board.lastSavedById)
    delete next[id]
    board.lastSavedById = next
  }
  setLogs(
    board.logs.filter(function (item) {
      return item.ticketId !== id
    }),
  )
}
