<template>
  <div>
    <label v-if="label" class="field-label">{{ label }}</label>
    <input
      class="field-input"
      :type="type"
      :value="value"
      :maxlength="maxlength"
      :disabled="disabled"
      :placeholder="placeholder"
      @input="onInput"
    />
    <p v-if="hint" class="field-hint">{{ hint }}</p>
    <p v-if="error" class="field-hint text-red-600">{{ error }}</p>
  </div>
</template>

<script>
export default {
  name: 'TextField',
  props: {
    value: { type: [String, Number], default: '' },
    label: { type: String, default: '' },
    type: { type: String, default: 'text' },
    maxlength: { type: [Number, String], default: null },
    disabled: { type: Boolean, default: false },
    placeholder: { type: String, default: '' },
    hint: { type: String, default: '' },
    error: { type: String, default: '' },
  },
  methods: {
    onInput: function (event) {
      this.$emit('input', event.target.value)
    },
  },
}
</script>
