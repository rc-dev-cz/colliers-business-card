<template>
  <div ref="boardScroller" class="board-scroller h-full min-h-0 w-full overflow-x-auto">
    <div class="flex h-full min-h-0 w-full items-stretch gap-3">
      <section v-for="column in columns" :key="column.id" class="board-column flex flex-col rounded-lg border" :class="column.lane">
        <header class="flex items-center justify-between px-3 py-2" :class="column.header">
          <h2 class="text-sm font-semibold">{{ column.label || column.id }}</h2>
          <span class="rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold">{{ column.count }}</span>
        </header>
        <div :ref="registerColumn" :data-status="column.id" class="board-column-body flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2">
          <template v-for="group in column.groups">
            <button :key="'h-' + group.category" class="js-epic-heading flex justify-between rounded-md px-2 py-1 text-xs font-semibold" :class="categoryTheme(group.category).heading" @click="toggleGroup(column.id, group.category)">
              <span>{{ group.category }}</span><span>{{ group.tickets.length }} {{ isGroupOpen(column.id, group.category) ? '▾' : '▸' }}</span>
            </button>
            <div v-if="isGroupOpen(column.id, group.category)" :key="group.category" :ref="registerColumn" :data-status="column.id" :data-category="group.category" class="flex flex-col gap-2">
              <div v-for="ticket in group.tickets" :key="ticket.id" :data-ticket-id="ticket.id" @click="openTicket(ticket)">
                <ticket-card :ticket="ticket"></ticket-card>
              </div>
            </div>
          </template>
        </div>
      </section>
    </div>
    <ticket-modal :ticket="selectedTicket" @close="closeTicket" @open="selectedId = $event" @saved="closeTicket" @deleted="closeTicket"></ticket-modal>
  </div>
</template>

<script>
import Sortable from 'sortablejs'
import { STATUS_COLUMNS, categoryTheme, groupTicketsByCategory, sortByPriority } from '../data/devTracker'
import { board, getTickets, merged, setStatus } from '../board'
import TicketCard from '../components/TicketCard.vue'
import TicketModal from '../components/TicketModal.vue'

export default {
  name: 'RcWebDevPage',
  components: { TicketCard, TicketModal },
  data: function () {
    return { board: board, selectedId: '', collapsed: {}, sortables: [] }
  },
  computed: {
    tickets: function () { return getTickets() },
    columns: function () {
      return STATUS_COLUMNS.map((column) => {
        const list = sortByPriority(this.tickets.map(merged).filter((ticket) => ticket.status === column.id))
        return Object.assign({}, column, { groups: groupTicketsByCategory(list), count: list.length })
      })
    },
    selectedTicket: function () {
      const ticket = this.tickets.find((item) => item.id === this.selectedId)
      return ticket ? merged(ticket) : null
    },
  },
  watch: {
    'board.focusId': function (id) { if (id) this.selectedId = id },
    'board.highlightId': function (id) {
      if (id) {
        this.selectedId = id
        board.highlightId = ''
      }
    },
  },
  updated: function () { this.pruneSortables() },
  beforeDestroy: function () { this.destroySortables() },
  methods: {
    categoryTheme: categoryTheme,
    openTicket: function (ticket) { this.selectedId = ticket.id },
    closeTicket: function () { this.selectedId = ''; board.focusId = '' },
    groupKey: function (status, category) { return status + ':' + category },
    isGroupOpen: function (status, category) {
      const key = this.groupKey(status, category)
      return Object.prototype.hasOwnProperty.call(this.collapsed, key) ? !this.collapsed[key] : status !== 'Ideas' && status !== 'Done'
    },
    toggleGroup: function (status, category) {
      this.$set(this.collapsed, this.groupKey(status, category), this.isGroupOpen(status, category))
      this.$nextTick(this.pruneSortables)
    },
    registerColumn: function (el) {
      if (!el || el.__sortable) return
      const instance = Sortable.create(el, {
        group: 'rc-web-dev-tickets',
        animation: 180,
        draggable: '[data-ticket-id]',
        filter: '.js-epic-heading',
        forceFallback: true,
        onEnd: (event) => {
          const id = event.item && event.item.dataset.ticketId
          const status = event.to && event.to.dataset.status
          if (id && status) setStatus(id, status)
        },
      })
      el.__sortable = instance
      this.sortables.push(instance)
    },
    pruneSortables: function () {
      this.sortables = this.sortables.filter((instance) => {
        if (instance.el && instance.el.isConnected) return true
        instance.destroy()
        return false
      })
    },
    destroySortables: function () {
      this.sortables.forEach((instance) => instance.destroy())
      this.sortables = []
    },
  },
}
</script>
