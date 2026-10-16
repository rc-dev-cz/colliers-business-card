<template>
  <div>
    <label v-if="label" class="field-label">
      {{ label }}<span v-if="required" class="field-required" aria-hidden="true">*</span>
    </label>
    <input
      :id="id || undefined"
      class="field-input"
      :type="type"
      :name="name || undefined"
      :autocomplete="autocomplete || undefined"
      :value="value"
      :maxlength="maxlength"
      :disabled="disabled"
      :required="required"
      :placeholder="placeholder"
      :aria-invalid="error ? 'true' : 'false'"
      @input="onInput"
      @blur="$emit('blur', $event)"
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
    name: { type: String, default: '' },
    /** Browser autofill token; use "off" for non-address free-text fields. */
    autocomplete: { type: String, default: '' },
    required: { type: Boolean, default: false },
  },
  methods: {
    onInput: function (event) {
      var input = event.target
      this.$emit('input', input.value, event)
      // Parent may clean the value (e.g. strip emoji). If the cleaned value equals the
      // old one, Vue skips the re-render, so put the cleaned text back in the box.
      var self = this
      this.$nextTick(function () {
        var next = self.value == null ? '' : String(self.value)
        if (input.value !== next) input.value = next
      })
    },
  },
}
</script>
