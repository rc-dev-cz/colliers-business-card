<template>
  <div class="flex min-h-[120px] flex-col items-center justify-center">
    <div class="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-colliers-primary"></div>
    <p class="text-sm text-gray-500">{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: 'LoadingState',
  props: {
    message: { type: String, default: '' },
  },
}
</script>
