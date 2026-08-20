<template>
  <p class="text-sm text-red-600">
    <slot>{{ message }}</slot>
  </p>
</template>

<script>
export default {
  name: 'ErrorState',
  props: {
    message: { type: String, default: '' },
  },
}
</script>
