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
const { persistError, ticketsReady } = useDevBoard()

onMounted(() => {
  hydrateDevBoard()
})
</script>

<template>
  <div class="rc-web-dev-page">
    <RcWebDevHeader />
    <div
      class="rc-web-dev-body"
      :class="isBoard ? 'rc-web-dev-body--board' : 'rc-web-dev-body--scroll'"
    >
      <div class="rc-web-dev-chrome">
        <RcWebDevNav />
        <p
          v-if="persistError"
          class="mb-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800 ring-1 ring-rose-200"
        >
          {{ persistError }}
        </p>
      </div>
      <div class="rc-web-dev-main" :class="isBoard ? 'rc-web-dev-main--board' : 'rc-web-dev-chrome'">
        <div
          v-if="!ticketsReady"
          class="flex h-full min-h-[12rem] items-center justify-center text-sm text-slate-500"
        >
          Loading tickets…
        </div>
        <router-view v-else />
      </div>
      <div class="rc-web-dev-chrome">
        <RcWebDevFooter />
      </div>
    </div>
    <TicketCreateModal />
  </div>
</template>
