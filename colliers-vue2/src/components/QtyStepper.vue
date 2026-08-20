<template>
  <input
    :value="value"
    type="number"
    min="1"
    :class="inputClass"
    @input="onInput"
  />
</template>

<script>
export default {
  name: 'QtyStepper',
  props: {
    value: { type: [Number, String], default: 1 },
    compact: { type: Boolean, default: false },
  },
  computed: {
    inputClass: function () {
      return this.compact
        ? 'w-16 rounded border border-gray-300 px-2 py-1 text-sm'
        : 'w-20 rounded border border-gray-300 px-2 py-2 text-sm'
    },
  },
  methods: {
    onInput: function (event) {
      const next = Math.max(1, Number(event.target.value) || 1)
      this.$emit('input', next)
    },
  },
}
</script>
