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
      const list = [this.variant === 'outline' ? 'btn-outline' : 'btn-primary']
      if (this.block) list.push('w-full')
      return list
    },
  },
}
</script>
