<template>
  <div v-if="open" class="drawer-root" @keydown.esc="$emit('close')">
    <div class="drawer-backdrop" @click="$emit('close')"></div>
    <aside :class="['drawer-panel', wide ? 'is-wide' : '']" role="dialog" aria-modal="true">
      <header class="drawer-header">
        <div class="min-w-0 flex-1 text-lg font-semibold text-gray-900">
          <slot name="label"></slot>
        </div>
        <button
          type="button"
          class="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          :aria-label="closeLabel"
          @click="$emit('close')"
        >
          ×
        </button>
      </header>
      <div class="drawer-body">
        <slot></slot>
      </div>
      <footer v-if="$slots.footer" class="drawer-footer">
        <slot name="footer"></slot>
      </footer>
    </aside>
  </div>
</template>

<script>
export default {
  name: 'Drawer',
  props: {
    open: { type: Boolean, default: false },
    wide: { type: Boolean, default: false },
    closeLabel: { type: String, default: 'Close' },
  },
  mounted: function () {
    document.addEventListener('keydown', this.onKey)
  },
  beforeDestroy: function () {
    document.removeEventListener('keydown', this.onKey)
  },
  methods: {
    onKey: function (event) {
      if (this.open && event.key === 'Escape') this.$emit('close')
    },
  },
}
</script>
