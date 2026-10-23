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
      :aria-invalid="error ? 'true' : 'false'"
      :placeholder="placeholder"
      :required="required"
      @input="onInput"
    />
    <p v-if="hint" class="field-hint">{{ hint }}</p>
    <p v-if="error" class="field-hint text-red-600">{{ error }}</p>
  </div>
</template>

<script>
import { formatCanadianLocal, localPhoneDigits } from '../helpers/validate'

export default {
  name: 'PhoneField',
  props: {
    value: { type: String, default: '' },
    label: { type: String, default: '' },
    hint: { type: String, default: '' },
    error: { type: String, default: '' },
    required: { type: Boolean, default: false },
    placeholder: { type: String, default: '416 555 1234' },
  },
  computed: {
    display: function () {
      return formatCanadianLocal(localPhoneDigits(this.value))
    },
  },
  methods: {
    onInput: function (event) {
      // No maxlength on the input: a pasted "(416) 555-0199" is longer than the formatted number.
      const digits = localPhoneDigits(event.target.value)
      this.$emit('input', digits ? formatCanadianLocal(digits) : '')
    },
  },
}
</script>
