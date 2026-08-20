<template>
  <div class="py-10 text-center text-sm text-gray-500">
    <slot>{{ message }}</slot>
  </div>
</template>

<script>
export default {
  name: 'EmptyState',
  props: {
    message: { type: String, default: '' },
  },
}
</script>
