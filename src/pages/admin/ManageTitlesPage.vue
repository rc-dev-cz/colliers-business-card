<template>
  <colliers-page-shell>
    <div class="mx-auto w-full max-w-3xl">
      <h1 class="mb-6 text-3xl font-bold text-gray-900 sm:mb-8 sm:text-4xl">{{ t('manageTitles') }}</h1>

      <form class="mb-6 flex flex-col gap-3 sm:flex-row" @submit.prevent="onAdd">
        <text-field
          class="flex-1"
          :value="newTitle"
          :placeholder="t('newTitlePlaceholder')"
          @input="newTitle = $event"
        ></text-field>
        <app-button html-type="submit" class="sm:w-auto">{{ t('add') }}</app-button>
      </form>

      <div class="overflow-hidden rounded-md border border-gray-200 bg-white">
        <ul class="divide-y divide-gray-100">
          <li v-if="!store.titles.length" class="px-4 py-10 text-center text-sm text-gray-500">
            {{ t('noTitles') }}
          </li>
          <li
            v-for="(title, index) in store.titles"
            :key="title + '-' + index"
            class="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <text-field
              v-if="editingIndex === index"
              class="flex-1"
              :value="editValue"
              @input="editValue = $event"
            ></text-field>
            <span v-else class="text-sm font-medium text-gray-900">{{ title }}</span>
            <div class="flex shrink-0 gap-3">
              <template v-if="editingIndex === index">
                <button type="button" class="text-colliers-primary hover:underline" @click="saveEdit(index)">
                  {{ t('save') }}
                </button>
                <button type="button" class="text-gray-500 hover:underline" @click="cancelEdit">
                  {{ t('cancel') }}
                </button>
              </template>
              <template v-else>
                <button type="button" class="text-colliers-primary hover:underline" @click="startEdit(index, title)">
                  {{ t('edit') }}
                </button>
                <button type="button" class="text-red-600 hover:underline" @click="confirmDelete(index)">
                  {{ t('delete') }}
                </button>
              </template>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </colliers-page-shell>
</template>

<script>
import ColliersPageShell from '../../layout/ColliersPageShell.vue'
import AppButton from '../../components/AppButton.vue'
import TextField from '../../components/TextField.vue'
import { store, t, loadTitles, addTitle, updateTitle, deleteTitle } from '../../store'

export default {
  name: 'ManageTitlesPage',
  components: { ColliersPageShell, AppButton, TextField },
  data: function () {
    return {
      store: store,
      newTitle: '',
      editingIndex: -1,
      editValue: '',
    }
  },
  mounted: function () {
    loadTitles(true)
  },
  methods: {
    t: t,
    onAdd: function () {
      if (addTitle(this.newTitle)) this.newTitle = ''
    },
    startEdit: function (index, title) {
      this.editingIndex = index
      this.editValue = title
    },
    cancelEdit: function () {
      this.editingIndex = -1
      this.editValue = ''
    },
    saveEdit: function (index) {
      if (updateTitle(index, this.editValue)) this.cancelEdit()
    },
    confirmDelete: function (index) {
      if (window.confirm(t('confirmDeleteTitle'))) deleteTitle(index)
    },
  },
}
</script>
