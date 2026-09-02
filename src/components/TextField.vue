<template>
  <div>
    <label v-if="label" class="field-label">{{ label }}</label>
    <input
      :id="id || undefined"
      class="field-input"
      :type="type"
      :value="value"
      :maxlength="maxlength"
      :disabled="disabled"
      :required="required"
      :placeholder="placeholder"
      :aria-invalid="error ? 'true' : 'false'"
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
    id: { type: String, default: '' },
    required: { type: Boolean, default: false },
  },
  methods: {
    onInput: function (event) {
      this.$emit('input', event.target.value)
    },
  },
}
</script>
