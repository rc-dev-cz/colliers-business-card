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
            $route.name === tab.name
              ? 'bg-colliers-primary text-white'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          "
        >
          {{ tab.label }}
        </router-link>
      </div>
    </div>
    <button
      v-if="$route.name === 'rc-web-dev-board'"
      type="button"
      class="inline-flex items-center rounded-md bg-colliers-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-colliers-primary-hover"
      @click="onCreate"
    >
      Create ticket
    </button>
  </nav>
</template>

<script>
import { openCreate } from '../board'

export default {
  name: 'RcWebDevNav',
  data: function () {
    return {
      tabs: [
        { name: 'rc-web-dev-board', label: 'Board', to: { name: 'rc-web-dev-board' } },
        { name: 'rc-web-dev-roadmap', label: 'Roadmap', to: { name: 'rc-web-dev-roadmap' } },
        { name: 'rc-web-dev-logs', label: 'Logs', to: { name: 'rc-web-dev-logs' } },
        { name: 'rc-web-dev-architecture', label: 'Delivery', to: { name: 'rc-web-dev-architecture' } },
      ],
    }
  },
  methods: {
    onCreate: function () {
      openCreate()
    },
  },
}
</script>
