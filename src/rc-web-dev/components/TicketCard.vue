<template>
  <div
    class="ticket-card min-w-0 cursor-grab rounded-md border border-gray-200 bg-white px-3 py-2 shadow-sm select-none hover:shadow-md active:cursor-grabbing"
    :class="{ 'ticket-moved': moved, 'ticket-review': showsReview(ticket), 'ring-1 ring-rose-300': ticket.blocked }"
    :style="vars"
  >
    <div class="flex items-start justify-between gap-2">
      <div class="flex min-w-0 items-center gap-1.5">
        <p class="font-mono text-xs font-semibold text-colliers-primary">{{ ticket.id }}</p>
        <span
          v-if="ticket.blocked"
          class="rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-semibold leading-none text-rose-800"
        >
          Blocked
        </span>
        <span
          v-if="showsReview(ticket)"
          class="review-bounce h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500"
          aria-hidden="true"
        />
      </div>
      <span
        class="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none"
        :class="pill"
      >
        {{ label }}
      </span>
    </div>
    <p class="mt-0.5 line-clamp-2 break-words text-sm font-medium text-gray-900">{{ ticket.title }}</p>
    <div class="mt-1.5 flex justify-end">
      <span
        class="inline-flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold"
        :class="avatarClass"
        :title="ticket.assignee || 'Unassigned'"
      >
        {{ initials }}
      </span>
    </div>
  </div>
</template>

<script>
import { PRIORITY_LABEL, PRIORITY_PILL, showsReview, assigneeAvatarClass } from '../data/devTracker'

export default {
  name: 'TicketCard',
  props: {
    ticket: { type: Object, required: true },
    moved: { type: Boolean, default: false },
    vars: { type: Object, default: function () { return {} } },
  },
  computed: {
    label: function () {
      return PRIORITY_LABEL[this.ticket.priority] || 'Medium'
    },
    pill: function () {
      return PRIORITY_PILL[this.ticket.priority] || PRIORITY_PILL.medium
    },
    initials: function () {
      return this.ticket.assignee || '?'
    },
    avatarClass: function () {
      return assigneeAvatarClass(this.ticket.assignee)
    },
  },
  methods: {
    showsReview: showsReview,
  },
}
</script>
