<template>
  <input
    :value="display"
    type="number"
    :min="min"
    :step="step"
    :class="inputClass"
    @input="onInput"
  />
</template>

<script>
import { CARDS_PER_BOX, boxesFromCards, cardsFromBoxes } from '../helpers/cart'

export default {
  name: 'QtyStepper',
  props: {
    value: { type: [Number, String], default: 1 },
    compact: { type: Boolean, default: false },
    /** Show and step printed cards (250, 500, …). Stored value stays boxes. */
    cards: { type: Boolean, default: false },
  },
  computed: {
    min: function () {
      return this.cards ? CARDS_PER_BOX : 1
    },
    step: function () {
      return this.cards ? CARDS_PER_BOX : 1
    },
    display: function () {
      return this.cards ? cardsFromBoxes(this.value) : this.value
    },
    inputClass: function () {
      return this.compact
        ? 'w-20 rounded border border-gray-300 px-2 py-1 text-sm'
        : 'w-24 rounded border border-gray-300 px-2 py-2 text-sm'
    },
  },
  methods: {
    onInput: function (event) {
      var raw = Number(event.target.value) || 0
      if (this.cards) {
        this.$emit('input', boxesFromCards(raw))
        return
      }
      this.$emit('input', Math.max(1, raw || 1))
    },
  },
}
</script>
