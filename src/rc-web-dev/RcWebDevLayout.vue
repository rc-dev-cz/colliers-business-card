<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { hydrateDevBoard, useDevBoard } from './composables/useDevBoard'
import RcWebDevHeader from './RcWebDevHeader.vue'
import RcWebDevNav from './components/RcWebDevNav.vue'
import RcWebDevFooter from './components/RcWebDevFooter.vue'
import TicketCreateModal from './components/TicketCreateModal.vue'
import './styles.css'

const route = useRoute()
const isBoard = computed(() => route.name === 'rc-web-dev-board')
const { persistError } = useDevBoard()

onMounted(() => {
  hydrateDevBoard()
})
</script>

<template>
  <div class="rc-web-dev-page">
    <RcWebDevHeader />
    <div class="rc-web-dev-body">
      <div
        class="flex min-h-0 h-full flex-1 flex-col"
        :class="isBoard ? '' : 'mx-auto w-full max-w-6xl'"
      >
        <RcWebDevNav />
        <p
          v-if="persistError"
          class="mx-4 mb-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800 ring-1 ring-rose-200"
        >
          {{ persistError }}
        </p>
        <div
          class="min-h-0 flex-1"
          :class="isBoard ? 'overflow-hidden' : 'overflow-y-auto'"
        >
          <router-view />
        </div>
        <RcWebDevFooter />
      </div>
    </div>
    <TicketCreateModal />
  </div>
</template>
