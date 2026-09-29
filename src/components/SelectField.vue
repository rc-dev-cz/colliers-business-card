<template>
  <div>
    <label v-if="label" class="field-label">
      {{ label }}<span v-if="required" class="field-required" aria-hidden="true">*</span>
    </label>
    <select
      class="field-input"
      :value="value"
      :disabled="disabled"
      :required="required"
      @change="onChange"
    >
      <option v-if="placeholder" value="">{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="optionValue(option)"
        :value="optionValue(option)"
      >
        {{ optionLabel(option) }}
      </option>
    </select>
    <p v-if="hint" class="field-hint">{{ hint }}</p>
    <p v-if="error" class="field-hint text-red-600">{{ error }}</p>
  </div>
</template>

<script>
export default {
  name: 'SelectField',
  props: {
    value: { type: [String, Number], default: '' },
    label: { type: String, default: '' },
    options: { type: Array, default: function () { return [] } },
    optionValueKey: { type: String, default: 'value' },
    optionLabelKey: { type: String, default: 'label' },
    placeholder: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    hint: { type: String, default: '' },
    error: { type: String, default: '' },
  },
  methods: {
    optionValue: function (option) {
      if (option && typeof option === 'object') return option[this.optionValueKey]
      return option
    },
    optionLabel: function (option) {
      if (option && typeof option === 'object') return option[this.optionLabelKey]
      return option
    },
    onChange: function (event) {
      this.$emit('input', event.target.value)
    },
  },
}
</script>
