<template>
  <div>
    <div class="mb-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div class="mb-2 flex justify-between text-sm"><p>Assigned tickets</p><p>{{ completed }} / {{ total }} done · {{ percent }}%</p></div>
      <div class="h-2 overflow-hidden rounded-full bg-gray-100"><div class="h-full bg-colliers-primary" :style="{ width: percent + '%' }"></div></div>
    </div>
    <section v-for="group in groups" :key="group.category" class="mb-3 overflow-hidden rounded-lg border shadow-sm" :class="categoryTheme(group.category).block">
      <button type="button" class="flex w-full items-center gap-3 px-4 py-3 text-left" :class="categoryTheme(group.category).heading" @click="toggleGroup(group.category)">
        <span>{{ isGroupOpen(group.category) ? '▾' : '▸' }}</span><h2 class="font-semibold">{{ group.category }}</h2><span class="ml-auto text-xs">{{ group.done }} / {{ group.count }}</span>
      </button>
      <ul v-show="isGroupOpen(group.category)" class="divide-y divide-gray-100 border-t">
        <li v-for="ticket in group.tickets" :key="ticket.id" class="flex items-start gap-3 px-4 py-2.5">
          <input type="checkbox" class="mt-1" :checked="ticket.status === 'Done'" @change="toggle(ticket.id)">
          <button type="button" class="flex min-w-0 flex-1 gap-2 text-left" @click="openTicket(ticket.id)"><span class="font-mono text-sm font-semibold text-colliers-primary">{{ ticket.id }}</span><span class="text-sm">{{ ticket.title }}</span></button>
        </li>
      </ul>
    </section>
    <section v-if="ideas.length" class="rounded-lg border border-dashed border-violet-200 bg-violet-50/40 p-4">
      <h2 class="mb-2 font-semibold text-violet-950">Ideas · {{ ideas.length }}</h2>
      <button v-for="ticket in ideas" :key="ticket.id" type="button" class="block w-full border-t border-violet-100 py-2 text-left text-sm" @click="openTicket(ticket.id)"><span class="mr-2 font-mono font-semibold text-colliers-primary">{{ ticket.id }}</span>{{ ticket.title }}</button>
    </section>
    <ticket-modal :ticket="selectedTicket" @close="closeTicket" @saved="closeTicket" @deleted="closeTicket"></ticket-modal>
  </div>
</template>

<script>
import { CATEGORIES, READY_STATUS, categoryTheme, isAssigned, sortByPriority } from '../data/devTracker'
import { getTickets, merged, setStatus } from '../board'
import TicketModal from '../components/TicketModal.vue'

export default {
  name: 'RcWebDevRoadmapPage',
  components: { TicketModal },
  data: function () { return { selectedId: '', collapsed: {} } },
  computed: {
    tickets: function () { return getTickets() },
    all: function () { return this.tickets.map(merged) },
    assigned: function () { return this.all.filter(isAssigned) },
    ideas: function () { return sortByPriority(this.all.filter((ticket) => !isAssigned(ticket))) },
    total: function () { return this.assigned.length },
    completed: function () { return this.assigned.filter((ticket) => ticket.status === 'Done').length },
    percent: function () { return this.total ? Math.round(this.completed / this.total * 100) : 0 },
    groups: function () {
      return CATEGORIES.map((category) => {
        const tickets = this.assigned.filter((ticket) => ticket.category === category)
        return { category: category, tickets: tickets, count: tickets.length, done: tickets.filter((ticket) => ticket.status === 'Done').length }
      }).filter((group) => group.count)
    },
    selectedTicket: function () {
      const ticket = this.tickets.find((item) => item.id === this.selectedId)
      return ticket ? merged(ticket) : null
    },
  },
  methods: {
    categoryTheme: categoryTheme,
    toggle: function (id) {
      const ticket = this.tickets.find((item) => item.id === id)
      const current = ticket ? merged(ticket).status : ''
      setStatus(id, current === 'Done' ? READY_STATUS : 'Done')
      this.selectedId = id
    },
    openTicket: function (id) { this.selectedId = id },
    closeTicket: function () { this.selectedId = '' },
    isGroupOpen: function (category) {
      if (Object.prototype.hasOwnProperty.call(this.collapsed, category)) return !this.collapsed[category]
      const group = this.groups.find((item) => item.category === category)
      return Boolean(group && group.done !== group.count)
    },
    toggleGroup: function (category) { this.$set(this.collapsed, category, this.isGroupOpen(category)) },
  },
}
</script>
