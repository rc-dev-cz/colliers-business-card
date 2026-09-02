<template>
  <div class="colliers-list-row-actions colliers-list-row-actions--hover">
    <button
      v-if="showEdit"
      type="button"
      class="rounded p-1.5 text-gray-400 transition-colors hover:text-colliers-primary"
      :title="editLabel"
      :aria-label="editLabel"
      @click="$emit('edit')"
    >
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 7.125L16.862 4.487" />
      </svg>
    </button>
    <button
      v-if="showDelete"
      type="button"
      class="rounded p-1.5 text-gray-400 transition-colors hover:text-red-500"
      :title="deleteLabel"
      :aria-label="deleteLabel"
      @click="$emit('delete')"
    >
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
      </svg>
    </button>
  </div>
</template>

<script>
export default {
  name: 'ColliersListRowActions',
  props: {
    editLabel: { type: String, default: 'Edit' },
    deleteLabel: { type: String, default: 'Delete' },
    showEdit: { type: Boolean, default: true },
    showDelete: { type: Boolean, default: true },
  },
}
</script>
