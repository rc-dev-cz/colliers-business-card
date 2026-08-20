/** Ticket list from docs/devTracker.json. Helpers stay in this file. */
import trackerData from '../../../docs/devTracker.json'
export const READY_STATUS = 'Ready for development'

export const STATUSES = ['Ideas', READY_STATUS, 'In progress', 'QA', 'Done']

export const CATEGORIES = [
  'Customer Portal',
  'Admin Portal',
  'Shared UI/UX',
  'Quality Assurance',
  'Technical',
]

const CATEGORY_FROM_LEGACY = {
  User: 'Customer Portal',
  Admin: 'Admin Portal',
  Polish: 'Shared UI/UX',
  Tests: 'Quality Assurance',
  Dev: 'Technical',
  Later: 'Technical',
}

const EPIC_FROM_CATEGORY = {
  'Customer Portal': 'User',
  'Admin Portal': 'Admin',
  'Shared UI/UX': 'Polish',
  'Quality Assurance': 'Tests',
  Technical: 'Dev',
}

/** Tailwind v3 default palette. Hues avoid the column tints (violet, amber, sky, teal, green). */
export const CATEGORY_THEME = {
  'Customer Portal': {
    block: 'border-blue-200 bg-blue-50',
    heading: 'text-blue-800 hover:bg-blue-100',
    chip: 'bg-blue-100 text-blue-800',
  },
  'Admin Portal': {
    block: 'border-rose-200 bg-rose-50',
    heading: 'text-rose-800 hover:bg-rose-100',
    chip: 'bg-rose-100 text-rose-800',
  },
  'Shared UI/UX': {
    block: 'border-fuchsia-200 bg-fuchsia-50',
    heading: 'text-fuchsia-800 hover:bg-fuchsia-100',
    chip: 'bg-fuchsia-100 text-fuchsia-800',
  },
  'Quality Assurance': {
    block: 'border-lime-200 bg-lime-50',
    heading: 'text-lime-800 hover:bg-lime-100',
    chip: 'bg-lime-100 text-lime-800',
  },
  Technical: {
    block: 'border-indigo-200 bg-indigo-50',
    heading: 'text-indigo-800 hover:bg-indigo-100',
    chip: 'bg-indigo-100 text-indigo-800',
  },
}

export function categoryTheme(category) {
  return CATEGORY_THEME[category] || CATEGORY_THEME.Technical
}

export function normalizeStatus(value) {
  if (value === 'To do') return READY_STATUS
  return STATUSES.includes(value) ? value : 'Ideas'
}

export function normalizeCategory(value) {
  if (CATEGORIES.includes(value)) return value
  return CATEGORY_FROM_LEGACY[value] || 'Technical'
}

export function categoryToEpic(category) {
  return EPIC_FROM_CATEGORY[category] || 'Dev'
}

export function statusToRow(status) {
  if (status === READY_STATUS) return 'To do'
  return STATUSES.includes(status) ? status : 'Ideas'
}

export function asRelatedIds(value, selfId) {
  if (!Array.isArray(value)) return []
  const seen = new Set()
  const next = []
  for (const item of value) {
    const id = String(item || '').trim()
    if (!id || id === selfId || seen.has(id)) continue
    seen.add(id)
    next.push(id)
  }
  return next
}

/** relatedIds, plus a one-way map from old saved parentId rows. */
export function relatedIdsFromRecord(record, selfId) {
  const related = asRelatedIds(record?.relatedIds, selfId)
  const legacy = record?.parentId ? String(record.parentId).trim() : ''
  if (legacy && legacy !== selfId && !related.includes(legacy)) related.push(legacy)
  return related
}

function relatedRoot(parent, id) {
  let current = id
  while (parent.get(current) !== current) {
    parent.set(current, parent.get(parent.get(current)))
    current = parent.get(current)
  }
  return current
}

/** Group related tickets that appear in this list. Cross-column related stay on the sheet only. */
export function relatedClusters(list) {
  const byId = new Map(list.map((ticket) => [ticket.id, ticket]))
  const parent = new Map(list.map((ticket) => [ticket.id, ticket.id]))
  for (const ticket of list) {
    for (const id of asRelatedIds(ticket.relatedIds, ticket.id)) {
      if (!byId.has(id)) continue
      const left = relatedRoot(parent, ticket.id)
      const right = relatedRoot(parent, id)
      if (left !== right) parent.set(left, right)
    }
  }
  const buckets = new Map()
  for (const ticket of list) {
    const root = relatedRoot(parent, ticket.id)
    if (!buckets.has(root)) buckets.set(root, [])
    buckets.get(root).push(ticket)
  }
  const clusters = []
  const singles = []
  for (const group of buckets.values()) {
    const sorted = sortByPriority(group)
    if (sorted.length > 1) clusters.push(sorted)
    else singles.push(sorted[0])
  }
  clusters.sort((a, b) => a[0].id.localeCompare(b[0].id))
  return { clusters, singles: sortByPriority(singles) }
}

export function orderTicketsWithRelated(list) {
  const { clusters, singles } = relatedClusters(list)
  const rows = []
  for (const cluster of clusters) {
    cluster.forEach((ticket, index) => {
      rows.push({
        ticket,
        clustered: true,
        clusterStart: index === 0,
        clusterEnd: index === cluster.length - 1,
      })
    })
  }
  for (const ticket of singles) {
    rows.push({ ticket, clustered: false, clusterStart: false, clusterEnd: false })
  }
  return rows
}

export function relatedKey(ids) {
  return asRelatedIds(ids).slice().sort().join(',')
}

/** CZ = Carlos Zabaleta. KC = Kevin Collins. MS = Mayank Shail. */
export const DEFAULT_ASSIGNEE = 'CZ'

export const ASSIGNEES = ['CZ', 'KC', 'MS']

export const ASSIGNEE_LABEL = {
  CZ: 'Carlos Zabaleta',
  KC: 'Kevin Collins',
  MS: 'Mayank Shail',
}

export const ASSIGNEE_AVATAR = {
  CZ: 'bg-colliers-primary text-white',
  KC: 'bg-teal-600 text-white',
  MS: 'bg-amber-600 text-white',
}

export function normalizeAssignee(value) {
  if (ASSIGNEES.includes(value)) return value
  return value ? 'CZ' : ''
}

export function assigneeAvatarClass(assignee) {
  return ASSIGNEE_AVATAR[assignee] || 'bg-slate-200 text-slate-500'
}

export function normalizeReview(value) {
  if (value === 'new' || value === 'updated' || value === 'in-progress') return value
  return ''
}

export const REVIEW_LABEL = { new: 'New', updated: 'Updated', 'in-progress': 'In progress' }

export const REVIEW_PILL = {
  new: 'bg-sky-100 text-sky-800',
  updated: 'bg-sky-100 text-sky-800',
  'in-progress': 'bg-sky-200 text-sky-950',
}

export function reviewFromLog(log) {
  if (!log) return ''
  if (log.type === 'created') return 'new'
  if (log.type === 'moved' && log.to === 'In progress') return 'in-progress'
  return 'updated'
}

export function showsReview(ticket) {
  return Boolean(ticket?.review)
}

export const STATUS_COLUMNS = [
  {
    id: 'Ideas',
    header: 'bg-violet-100 text-violet-950',
    lane: 'bg-violet-50 border-violet-200',
    accent: '#a78bfa',
  },
  {
    id: READY_STATUS,
    label: 'Ready',
    header: 'bg-amber-100 text-amber-950',
    lane: 'bg-amber-50 border-amber-200',
    accent: '#fbbf24',
  },
  {
    id: 'In progress',
    header: 'bg-sky-100 text-sky-950',
    lane: 'bg-sky-50 border-sky-200',
    accent: '#0ea5e9',
  },
  {
    id: 'QA',
    header: 'bg-teal-100 text-teal-950',
    lane: 'bg-teal-50 border-teal-200',
    accent: '#14b8a6',
  },
  {
    id: 'Done',
    header: 'bg-green-700 text-white',
    lane: 'bg-green-50 border-green-300',
    accent: '#15803d',
  },
]

export const PRIORITY_LABEL = { high: 'High', medium: 'Medium', low: 'Low' }

export const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

export const PRIORITY_PILL = {
  high: 'bg-rose-100 text-rose-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-slate-100 text-slate-600',
}

export function sortByPriority(list) {
  return [...list].sort((a, b) => {
    const rank = (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1)
    return rank || a.id.localeCompare(b.id)
  })
}

export function groupTicketsByCategory(list) {
  const buckets = new Map(CATEGORIES.map((category) => [category, []]))
  for (const ticket of list) {
    const category = CATEGORIES.includes(ticket.category) ? ticket.category : 'Technical'
    buckets.get(category).push(ticket)
  }
  return CATEGORIES.map((category) => {
    const tickets = sortByPriority(buckets.get(category))
    const { clusters, singles } = relatedClusters(tickets)
    return { category, tickets, clusters, singles, rows: orderTicketsWithRelated(tickets) }
  }).filter((group) => group.tickets.length)
}

export function splitFresh(list) {
  const fresh = []
  const rest = []
  for (const ticket of list) {
    if (ticket.fresh) fresh.push(ticket)
    else rest.push(ticket)
  }
  fresh.sort((a, b) => b.id.localeCompare(a.id))
  return { fresh, groups: groupTicketsByCategory(rest) }
}

export function asCriteria(value) {
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

export function criteriaKey(list) {
  return asCriteria(list)
    .map((item) => `${item.done ? '1' : '0'}:${item.text}`)
    .join('\n')
}

function fromJsonTicket(ticket) {
  const status = normalizeStatus(ticket.status)
  const blocked = Boolean(ticket.blocked)
  const relatedIds = relatedIdsFromRecord(ticket, ticket.id)
  return {
    id: ticket.id,
    title: String(ticket.title || 'Untitled').trim() || 'Untitled',
    description: String(ticket.description || ''),
    status,
    category: normalizeCategory(ticket.category || ticket.epic),
    priority: ['high', 'medium', 'low'].includes(ticket.priority) ? ticket.priority : 'medium',
    assignee: normalizeAssignee(ticket.assignee),
    acceptanceCriteria: asCriteria(ticket.acceptanceCriteria),
    relatedIds,
    blocked,
    blockedReason: blocked ? String(ticket.blockedReason || '') : '',
    notes: String(ticket.notes || ticket.source || ''),
    origin: ticket.origin || 'docs',
    fresh: Boolean(ticket.fresh),
    review: normalizeReview(ticket.review),
    reviewedAt: ticket.reviewedAt ? String(ticket.reviewedAt) : '',
  }
}

export const tickets = trackerData.tickets.map(fromJsonTicket)


export function isAssigned(ticket) {
  return Boolean(ticket.assignee)
}

const ticketDefaults = Object.fromEntries(
  tickets.map((ticket) => [ticket.id, ticket.status]),
)

function migrateStatus(saved) {
  const next = { ...ticketDefaults, ...(saved || {}) }
  for (const [id, status] of Object.entries(next)) {
    next[id] = normalizeStatus(status)
  }
  return next
}

export const LOG_LIMIT = 400

export function loadBoard(raw) {
  if (raw && typeof raw === 'object' && raw.statusById) {
    return {
      statusById: migrateStatus(raw.statusById),
      editsById: raw.editsById && typeof raw.editsById === 'object' ? raw.editsById : {},
      customById: asTicketMap(raw.customById),
      logs: asLogs(raw.logs),
    }
  }
  return {
    statusById: migrateStatus(raw),
    editsById: {},
    customById: asTicketMap(raw && typeof raw === 'object' ? raw.customById : null),
    logs: asLogs(raw && typeof raw === 'object' ? raw.logs : null),
  }
}

function asLogs(value) {
  if (!Array.isArray(value)) return []
  const next = []
  for (const item of value) {
    const log = normalizeLog(item)
    if (log) next.push(log)
  }
  return next.slice(0, LOG_LIMIT)
}

export function normalizeLog(item) {
  if (!item || typeof item !== 'object') return null
  const type = item.type === 'created' || item.type === 'moved' || item.type === 'updated' ? item.type : ''
  if (!type || !item.ticketId || !item.at) return null
  const changes = Array.isArray(item.changes)
    ? item.changes
        .filter((change) => change && change.field)
        .map((change) => ({
          field: String(change.field),
          from: change.from == null ? '' : String(change.from),
          to: change.to == null ? '' : String(change.to),
        }))
    : []
  return {
    id: String(item.id || `L-${item.at}-${item.ticketId}`),
    at: String(item.at),
    type,
    ticketId: String(item.ticketId),
    title: String(item.title || ''),
    from: item.from ? String(item.from) : '',
    to: item.to ? String(item.to) : '',
    changes,
  }
}

function asTicketMap(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const next = {}
  for (const [id, ticket] of Object.entries(value)) {
    if (!id || !ticket || typeof ticket !== 'object') continue
    next[id] = normalizeCustomTicket(ticket, id)
  }
  return next
}

export function normalizeCustomTicket(ticket, id) {
  const status = normalizeStatus(ticket.status)
  const blocked = Boolean(ticket.blocked)
  const category = normalizeCategory(ticket.category || ticket.epic)
  return {
    id,
    title: String(ticket.title || 'Untitled').trim() || 'Untitled',
    description: String(ticket.description || ''),
    status,
    category,
    priority: ['high', 'medium', 'low'].includes(ticket.priority) ? ticket.priority : 'medium',
    assignee: normalizeAssignee(ticket.assignee),
    acceptanceCriteria: asCriteria(ticket.acceptanceCriteria),
    relatedIds: relatedIdsFromRecord(ticket, id),
    blocked,
    blockedReason: blocked ? String(ticket.blockedReason || '') : '',
    notes: String(ticket.notes || ''),
    origin: ticket.origin || 'now',
    fresh: Boolean(ticket.fresh),
    review: normalizeReview(ticket.review),
    reviewedAt: ticket.reviewedAt ? String(ticket.reviewedAt) : '',
  }
}

export function nextCustomId(ids) {
  let max = 0
  for (const id of ids) {
    const match = /^RC-(\d+)$/i.exec(id)
    if (match) max = Math.max(max, Number(match[1]))
  }
  return `RC-${String(max + 1).padStart(2, '0')}`
}
