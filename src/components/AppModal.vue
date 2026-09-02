<template>
  <div
    v-if="open"
    class="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="titleId"
    @click.self="onBackdrop"
  >
    <div
      class="max-h-[92vh] w-full overflow-y-auto rounded-t-lg bg-white shadow-xl sm:rounded-lg"
      :class="panelClass"
    >
      <div class="border-b border-gray-200 bg-[#f8f9fa] px-5 py-5 sm:px-6 sm:py-6">
        <h2 :id="titleId" class="text-xl font-bold text-[#0a1a3a] sm:text-2xl">{{ title }}</h2>
        <p v-if="subtitle" class="mt-2 text-sm text-gray-500">{{ subtitle }}</p>
      </div>
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { t } from '../store'

let modalCount = 0

export default {
  name: 'AppModal',
  props: {
    open: { type: Boolean, default: false },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    size: {
      type: String,
      default: 'lg',
      validator: function (value) {
        return ['md', 'lg', 'xl', '2xl', 'wide'].indexOf(value) !== -1
      },
    },
    closeOnBackdrop: { type: Boolean, default: true },
  },
  data: function () {
    modalCount += 1
    return {
      titleId: 'app-modal-title-' + modalCount,
    }
  },
  computed: {
    panelClass: function () {
      if (this.size === 'md') return 'max-w-lg'
      if (this.size === 'xl') return 'max-w-xl'
      if (this.size === '2xl') return 'max-w-2xl'
      if (this.size === 'wide') return 'max-w-[800px]'
      return 'max-w-lg sm:max-w-2xl'
    },
  },
  methods: {
    t: t,
    onClose: function () {
      this.$emit('close')
    },
    onBackdrop: function () {
      if (this.closeOnBackdrop) this.onClose()
    },
  },
}
</script>
