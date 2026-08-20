<template>
  <div class="rc-web-dev-page">
    <rc-web-dev-header></rc-web-dev-header>
    <div
      class="rc-web-dev-body"
      :class="isBoard ? 'rc-web-dev-body--board' : 'rc-web-dev-body--scroll'"
    >
      <div class="rc-web-dev-chrome">
        <rc-web-dev-nav></rc-web-dev-nav>
        <p
          v-if="board.persistError"
          class="mb-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800 ring-1 ring-rose-200"
        >
          {{ board.persistError }}
        </p>
      </div>
      <div class="rc-web-dev-main" :class="isBoard ? 'rc-web-dev-main--board' : 'rc-web-dev-chrome'">
        <div
          v-if="!board.ticketsReady"
          class="flex h-full min-h-[12rem] items-center justify-center text-sm text-slate-500"
        >
          Loading tickets…
        </div>
        <router-view v-else></router-view>
      </div>
      <div class="rc-web-dev-chrome">
        <rc-web-dev-footer></rc-web-dev-footer>
      </div>
    </div>
    <ticket-create-modal></ticket-create-modal>
  </div>
</template>

<script>
import { board, hydrateDevBoard } from './board'
import RcWebDevHeader from './RcWebDevHeader.vue'
import RcWebDevNav from './components/RcWebDevNav.vue'
import RcWebDevFooter from './components/RcWebDevFooter.vue'
import TicketCreateModal from './components/TicketCreateModal.vue'
import './styles.css'

export default {
  name: 'RcWebDevLayout',
  components: { RcWebDevHeader, RcWebDevNav, RcWebDevFooter, TicketCreateModal },
  data: function () {
    return { board: board }
  },
  computed: {
    isBoard: function () {
      return this.$route.name === 'rc-web-dev-board'
    },
  },
  mounted: function () {
    hydrateDevBoard()
  },
}
</script>
