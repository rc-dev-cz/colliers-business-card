<template>
  <button
    :type="htmlType"
    :class="classes"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'AppButton',
  props: {
    variant: { type: String, default: 'primary' },
    disabled: { type: Boolean, default: false },
    block: { type: Boolean, default: false },
    htmlType: { type: String, default: 'button' },
  },
  computed: {
    classes: function () {
      var variantClass = 'btn-primary'
      if (this.variant === 'outline') variantClass = 'btn-outline'
      if (this.variant === 'outline-soft') variantClass = 'btn-outline-soft'
      const list = [variantClass]
      if (this.block) list.push('w-full')
      return list
    },
  },
}
</script>
