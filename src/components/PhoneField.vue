<template>
  <div>
    <label v-if="label" class="field-label">
      {{ label }}<span v-if="required" class="field-required" aria-hidden="true">*</span>
    </label>
    <input
      :value="display"
      type="tel"
      inputmode="numeric"
      autocomplete="tel-national"
      class="field-input"
      :placeholder="placeholder"
      :required="required"
      maxlength="12"
      @input="onInput"
    />
    <p v-if="hint" class="field-hint">{{ hint }}</p>
  </div>
</template>

<script>
import { digitsOnly, formatCanadianLocal } from '../helpers/validate'

export default {
  name: 'PhoneField',
  props: {
    value: { type: String, default: '' },
    label: { type: String, default: '' },
    hint: { type: String, default: '' },
    required: { type: Boolean, default: false },
    placeholder: { type: String, default: '416 555-1234' },
  },
  computed: {
    display: function () {
      var cleaned = String(this.value || '').replace(/\D/g, '')
      if (cleaned.length === 11 && cleaned.charAt(0) === '1') cleaned = cleaned.slice(1)
      return formatCanadianLocal(digitsOnly(cleaned))
    },
  },
  methods: {
    onInput: function (event) {
      const digits = digitsOnly(event.target.value)
      this.$emit('input', digits ? formatCanadianLocal(digits) : '')
    },
  },
}
</script>
