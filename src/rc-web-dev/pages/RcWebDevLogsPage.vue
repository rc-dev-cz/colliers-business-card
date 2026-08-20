<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <p class="text-sm text-gray-500">{{ filtered.length }} events</p>
      <div class="inline-flex rounded-lg border border-gray-200 bg-white p-1">
        <button v-for="item in filters" :key="item.id" class="rounded-md px-3 py-1.5 text-sm" :class="filter === item.id ? 'bg-colliers-primary text-white' : 'text-gray-600'" @click="filter = item.id">{{ item.label }}</button>
      </div>
    </div>
    <p v-if="!filtered.length" class="rounded-lg border border-dashed bg-white px-4 py-10 text-center text-sm text-gray-500">Nothing logged yet.</p>
    <section v-for="group in groups" :key="group.key" class="mb-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <h2 class="border-b bg-slate-50 px-4 py-2.5 text-sm font-semibold">{{ group.label }}</h2>
      <button v-for="log in group.items" :key="log.id" type="button" class="flex w-full items-start gap-3 border-b px-4 py-3 text-left hover:bg-slate-50" @click="openTicket(log.ticketId)">
        <span class="font-mono text-sm font-semibold text-colliers-primary">{{ log.ticketId }}</span>
        <span class="min-w-0 flex-1"><strong class="text-sm">{{ log.title || 'Untitled' }}</strong><span class="ml-2 text-sm text-gray-500">{{ summary(log) }}</span></span>
      </button>
    </section>
    <ticket-modal :ticket="selectedTicket" @close="closeTicket" @saved="closeTicket" @deleted="closeTicket"></ticket-modal>
  </div>
</template>

<script>
import { board, getTickets, merged } from '../board'
import TicketModal from '../components/TicketModal.vue'

export default {
  name: 'RcWebDevLogsPage',
  components: { TicketModal },
  data: function () {
    return {
      board: board, filter: 'all', selectedId: '',
      filters: [{ id: 'all', label: 'All' }, { id: 'moved', label: 'Moves' }, { id: 'created', label: 'Created' }, { id: 'updated', label: 'Edits' }],
    }
  },
  computed: {
    tickets: function () { return getTickets() },
    filtered: function () { return this.filter === 'all' ? board.logs : board.logs.filter((log) => log.type === this.filter) },
    groups: function () {
      const result = []
      this.filtered.forEach((log) => {
        const date = new Date(log.at)
        const key = date.toDateString()
        let group = result.find((item) => item.key === key)
        if (!group) {
          group = { key: key, label: date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }), items: [] }
          result.push(group)
        }
        group.items.push(log)
      })
      return result
    },
    selectedTicket: function () {
      const ticket = this.tickets.find((item) => item.id === this.selectedId)
      return ticket ? merged(ticket) : null
    },
  },
  methods: {
    summary: function (log) {
      if (log.type === 'moved') return 'Moved ' + log.from + ' → ' + log.to
      if (log.type === 'created') return 'Created in ' + (log.to || 'Ideas')
      return 'Updated'
    },
    openTicket: function (id) { if (this.tickets.some((ticket) => ticket.id === id)) this.selectedId = id },
    closeTicket: function () { this.selectedId = '' },
  },
}
</script>
