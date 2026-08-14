<script setup>
import { useRoute } from 'vue-router'
import { useDevBoard } from '../composables/useDevBoard'
import { useSupabaseStatus } from '../composables/useSupabaseStatus'

const route = useRoute()
const { openCreate } = useDevBoard()
const { label, title, tone, dot } = useSupabaseStatus()

const tabs = [
  { name: 'rc-web-dev-board', label: 'Board', to: { name: 'rc-web-dev-board' } },
  { name: 'rc-web-dev-roadmap', label: 'Roadmap', to: { name: 'rc-web-dev-roadmap' } },
  { name: 'rc-web-dev-logs', label: 'Logs', to: { name: 'rc-web-dev-logs' } },
]
</script>

<template>
  <nav class="mb-2 flex shrink-0 items-center justify-between gap-3" aria-label="RC Web Dev">
    <div class="flex min-w-0 items-center gap-2">
      <div class="inline-flex rounded-lg border border-gray-200 bg-white p-1">
        <router-link
          v-for="tab in tabs"
          :key="tab.name"
          :to="tab.to"
          class="rounded-md px-3 py-1.5 text-sm font-medium"
          :class="
            route.name === tab.name
              ? 'bg-colliers-primary text-white'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          "
        >
          {{ tab.label }}
        </router-link>
      </div>
      <span
        class="hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 sm:inline-flex"
        :class="tone"
        :title="title"
      >
        <span class="h-1.5 w-1.5 rounded-full" :class="dot" aria-hidden="true" />
        {{ label }}
      </span>
    </div>
    <button type="button" class="btn-primary" @click="openCreate()">
      Create ticket
    </button>
  </nav>
</template>
