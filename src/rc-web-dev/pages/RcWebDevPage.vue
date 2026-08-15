<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Sortable from 'sortablejs'
import { categoryTheme, STATUS_COLUMNS, showsReview, groupTicketsByCategory, sortByPriority, splitFresh } from '../data/devTracker'
import { useDevBoard } from '../composables/useDevBoard'
import TicketCard from '../components/TicketCard.vue'
import TicketModal from '../components/TicketModal.vue'

const { tickets, merged, setStatus, openCreate, focusId, highlightId } = useDevBoard()
const overStatus = ref('')
const selectedId = ref('')
const moved = ref(null)
const dirtyGroups = ref({})
const toast = ref('')
const collapsed = ref({})
const boardGen = ref(0)
const boardScroller = ref(null)
const sortableInstances = new Set()
let suppressClick = false
let movedTimer
let toastTimer

function ticketsIn(status) {
  return sortByPriority(tickets.value.map(merged).filter((ticket) => ticket.status === status))
}

const columns = computed(() =>
  STATUS_COLUMNS.map((column) => {
    const list = ticketsIn(column.id)
    if (column.id === 'Ideas') {
      const { fresh, groups } = splitFresh(list)
      return { ...column, fresh, groups, count: list.length }
    }
    return { ...column, fresh: [], groups: groupTicketsByCategory(list), count: list.length }
  }),
)

const selectedTicket = computed(() => {
  const ticket = tickets.value.find((item) => item.id === selectedId.value)
  return ticket ? merged(ticket) : null
})

function openTicket(ticket) {
  if (suppressClick) return
  selectedId.value = ticket.id
}

function closeTicket() {
  selectedId.value = ''
  focusId.value = ''
}

function onTicketDeleted() {
  toast.value = 'Deleted'
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    toast.value = ''
  }, 2200)
  closeTicket()
}

function onTicketSaved(id) {
  const ticket = tickets.value.find((item) => item.id === id)
  const current = ticket ? merged(ticket) : null
  if (current?.status && current?.category) {
    const key = groupKey(current.status, current.category)
    collapsed.value = { ...collapsed.value, [key]: false }
    dirtyGroups.value = { ...dirtyGroups.value, [key]: true }
  }
  window.clearTimeout(movedTimer)
  moved.value = { id, from: current?.status }
  movedTimer = window.setTimeout(() => {
    moved.value = null
  }, 1400)
  toast.value = 'Saved'
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    toast.value = ''
  }, 2200)
  closeTicket()
}

watch(
  focusId,
  (id) => {
    if (!id) return
    selectedId.value = id
    const ticket = tickets.value.find((item) => item.id === id)
    const current = ticket ? merged(ticket) : null
    if (current?.category && current.status) {
      collapsed.value = { ...collapsed.value, [groupKey(current.status, current.category)]: false }
      dirtyGroups.value = { ...dirtyGroups.value, [groupKey(current.status, current.category)]: true }
    }
  },
  { immediate: true },
)

watch(
  highlightId,
  (id) => {
    if (!id) return
    const ticket = tickets.value.find((item) => item.id === id)
    const current = ticket ? merged(ticket) : null
    if (current?.category && current.status) {
      const key = groupKey(current.status, current.category)
      collapsed.value = { ...collapsed.value, [key]: false }
      dirtyGroups.value = { ...dirtyGroups.value, [key]: true }
    }
    window.clearTimeout(movedTimer)
    moved.value = { id, from: current?.status }
    movedTimer = window.setTimeout(() => {
      moved.value = null
    }, 1400)
    toast.value = 'Created'
    window.clearTimeout(toastTimer)
    toastTimer = window.setTimeout(() => {
      toast.value = ''
    }, 2200)
    highlightId.value = ''
  },
  { immediate: true },
)

function groupKey(status, category) {
  return `${status}:${category}`
}

function isGroupOpen(status, category) {
  const key = groupKey(status, category)
  if (Object.prototype.hasOwnProperty.call(collapsed.value, key)) return !collapsed.value[key]
  return status !== 'Ideas' && status !== 'Done'
}

function toggleGroup(status, category) {
  const key = groupKey(status, category)
  collapsed.value = { ...collapsed.value, [key]: isGroupOpen(status, category) }
  if (dirtyGroups.value[key]) {
    const next = { ...dirtyGroups.value }
    delete next[key]
    dirtyGroups.value = next
  }
  nextTick(pruneSortables)
}

function isDirty(status, category) {
  return Boolean(dirtyGroups.value[groupKey(status, category)])
}

function pruneSortables() {
  sortableInstances.forEach((instance) => {
    if (instance.el?.isConnected) return
    try {
      instance.destroy()
    } catch {
      /* already gone */
    }
    sortableInstances.delete(instance)
  })
}

function groupPending(group) {
  return group.tickets.some(showsReview)
}

function clearDragLeftovers() {
  document.querySelectorAll('.sortable-fallback, .sortable-drag').forEach((node) => node.remove())
}

function destroySortables() {
  sortableInstances.forEach((instance) => {
    try {
      instance.destroy()
    } catch {
      /* already gone */
    }
  })
  sortableInstances.clear()
}

function finishDrag(id, fromStatus, toStatus, toCategory) {
  clearDragLeftovers()
  overStatus.value = ''

  const current = id ? tickets.value.find((item) => item.id === id) : null
  const before = current ? merged(current) : null
  const category = before?.category || ''
  const statusChanged = Boolean(before && toStatus && fromStatus !== toStatus)
  const droppedWrongSection = Boolean(toCategory && category && toCategory !== category)

  if (id && toStatus) {
    setStatus(id, toStatus)
  }

  destroySortables()
  boardGen.value += 1

  if (category && toStatus) {
    collapsed.value = { ...collapsed.value, [groupKey(toStatus, category)]: false }
  }

  if (statusChanged || droppedWrongSection) {
    window.clearTimeout(movedTimer)
    moved.value = { id, from: fromStatus }
    if (category) {
      dirtyGroups.value = { ...dirtyGroups.value, [groupKey(toStatus, category)]: true }
    }
    movedTimer = window.setTimeout(() => {
      moved.value = null
    }, 1400)
  }

  window.setTimeout(() => {
    suppressClick = false
    if (statusChanged && id) selectedId.value = id
  }, 50)
}

function setupColumn(el) {
  if (!el || el.__sortable) return
  const instance = Sortable.create(el, {
    group: 'rc-web-dev-tickets',
    animation: 180,
    easing: 'cubic-bezier(0.2, 0, 0, 1)',
    draggable: '[data-ticket-id]',
    filter: '.js-epic-heading',
    preventOnFilter: false,
    direction: 'vertical',
    forceFallback: true,
    fallbackOnBody: true,
    fallbackTolerance: 4,
    emptyInsertThreshold: 48,
    swapThreshold: 0.65,
    scroll: true,
    bubbleScroll: true,
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
    fallbackClass: 'sortable-fallback',
    onStart() {
      suppressClick = true
    },
    onMove(evt) {
      overStatus.value = evt.to.dataset.status || ''
      return true
    },
    onEnd(evt) {
      const id = evt.item?.dataset?.ticketId
      const fromStatus = evt.from?.dataset?.status
      const toStatus = evt.to?.dataset?.status
      const toCategory = evt.to?.dataset?.category
      window.setTimeout(() => finishDrag(id, fromStatus, toStatus, toCategory), 0)
    },
    onCancel() {
      clearDragLeftovers()
      overStatus.value = ''
      window.setTimeout(() => {
        suppressClick = false
      }, 50)
    },
  })
  el.__sortable = instance
  sortableInstances.add(instance)
}

function cardStyle(ticket, column) {
  const fromColumn =
    moved.value?.id === ticket.id
      ? STATUS_COLUMNS.find((item) => item.id === moved.value.from)
      : null
  return {
    '--ticket-accent': column.accent,
    '--ticket-from': fromColumn?.accent || column.accent,
  }
}

function onBoardWheel(event) {
  const el = boardScroller.value
  if (!el || el.scrollWidth <= el.clientWidth) return
  const delta = event.shiftKey ? event.deltaY : event.deltaX
  if (!event.shiftKey && Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return
  if (!delta) return
  el.scrollLeft += delta
  event.preventDefault()
}

onMounted(() => {
  boardScroller.value?.addEventListener('wheel', onBoardWheel, { passive: false })
})

onBeforeUnmount(() => {
  boardScroller.value?.removeEventListener('wheel', onBoardWheel)
  window.clearTimeout(movedTimer)
  window.clearTimeout(toastTimer)
  destroySortables()
  clearDragLeftovers()
})
</script>

<template>
  <div ref="boardScroller" class="board-scroller h-full min-h-0 w-full overflow-x-auto">
    <div :key="boardGen" class="flex h-full min-h-0 w-full items-stretch gap-3">
    <section
      v-for="column in columns"
      :key="column.id"
      class="board-column flex flex-col rounded-lg border"
      :class="[
        column.lane,
        column.id === 'Ideas' ? 'board-column-ideas' : '',
        overStatus === column.id ? 'ring-2 ring-colliers-primary' : '',
      ]"
    >
      <header class="flex items-center justify-between gap-2 px-3 py-2" :class="column.header">
        <h2 class="text-sm font-semibold">{{ column.label || column.id }}</h2>
        <div class="flex items-center gap-1">
          <span class="rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold tabular-nums">
            {{ column.count }}
          </span>
          <button
            v-if="column.id === 'Ideas'"
            type="button"
            title="Add to Ideas"
            class="inline-flex h-6 w-6 items-center justify-center rounded text-lg font-semibold leading-none hover:bg-black/10"
            aria-label="Add ticket to Ideas"
            @click.stop="openCreate()"
          >
            +
          </button>
        </div>
      </header>
      <div
        :ref="setupColumn"
        :data-status="column.id"
        class="board-column-body flex min-h-0 flex-1 flex-col gap-2 p-2"
        :class="column.id === 'Ideas' ? 'overflow-hidden' : 'overflow-y-auto'"
      >
        <div v-if="column.fresh?.length" class="flex min-w-0 shrink-0 flex-col gap-2">
          <div
            v-for="ticket in column.fresh"
            :key="ticket.id"
            :data-ticket-id="ticket.id"
            class="min-w-0"
            :class="{ 'ticket-child': ticket.parentId }"
            @click="openTicket(ticket)"
          >
            <TicketCard
              :ticket="ticket"
              :moved="moved?.id === ticket.id"
              :vars="cardStyle(ticket, column)"
            />
          </div>
        </div>
        <div
          v-for="group in column.groups"
          :key="group.category"
          class="epic-block flex min-w-0 flex-col overflow-hidden rounded-md border"
          :class="[
            categoryTheme(group.category).block,
            column.id === 'Ideas' && isGroupOpen(column.id, group.category)
              ? 'epic-block-open'
              : 'shrink-0',
          ]"
        >
          <button
            type="button"
            class="js-epic-heading flex w-full shrink-0 items-center justify-between px-2 py-1 text-left text-[11px] font-semibold uppercase tracking-wide"
            :class="categoryTheme(group.category).heading"
            @click="toggleGroup(column.id, group.category)"
          >
            <span class="flex items-center gap-1.5">
              {{ group.category }}
              <span
                v-if="isDirty(column.id, group.category) || groupPending(group)"
                class="review-bounce h-1.5 w-1.5 rounded-full bg-sky-500"
                aria-hidden="true"
              />
            </span>
            <span class="tabular-nums font-medium normal-case tracking-normal">
              {{ group.tickets.length }}
              <span class="ml-1 opacity-60">{{ isGroupOpen(column.id, group.category) ? '▾' : '▸' }}</span>
            </span>
          </button>
          <div
            v-if="isGroupOpen(column.id, group.category)"
            :ref="setupColumn"
            :data-status="column.id"
            :data-category="group.category"
            class="epic-list flex min-w-0 flex-col gap-2 p-1.5"
          >
            <div
              v-for="ticket in group.tickets"
              :key="ticket.id"
              :data-ticket-id="ticket.id"
              class="min-w-0"
              :class="{ 'ticket-child': ticket.parentId }"
              @click="openTicket(ticket)"
            >
              <TicketCard
                :ticket="ticket"
                :moved="moved?.id === ticket.id"
                :vars="cardStyle(ticket, column)"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
    </div>
  </div>

  <TicketModal :ticket="selectedTicket" @close="closeTicket" @open="selectedId = $event" @saved="onTicketSaved" @deleted="onTicketDeleted" />

  <Teleport to="body">
    <p
      v-if="toast"
      class="pointer-events-none fixed bottom-6 left-1/2 z-[1200] -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg"
    >
      {{ toast }}
    </p>
  </Teleport>
</template>
