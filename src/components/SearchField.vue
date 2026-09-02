<template>
  <div class="colliers-search-field">
    <svg
      class="colliers-search-field__icon"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
    <input
      :id="id"
      class="colliers-search-field__input"
      type="search"
      :value="value"
      :placeholder="placeholder"
      :aria-label="ariaLabel || placeholder"
      @input="onInput"
    />
  </div>
</template>

<script>
export default {
  name: 'SearchField',
  props: {
    value: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    id: { type: String, default: '' },
    ariaLabel: { type: String, default: '' },
  },
  methods: {
    onInput: function (event) {
      this.$emit('input', event.target.value)
    },
  },
}
</script>
