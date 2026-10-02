<template>
  <colliers-page-shell viewport-list>
    <div class="colliers-viewport-list mx-auto w-full max-w-2xl">
      <admin-page-header
        :title="t('manageTitles')"
        :subtitle="t('manageTitlesHint')"
      ></admin-page-header>

      <admin-string-list-panel
        viewport-fill
        :items="store.titles"
        :placeholder="t('newTitlePlaceholder')"
        :empty-label="t('noTitles')"
        :add-label="t('addTitle')"
        :edit-label="t('editTitle')"
        :delete-label="t('deleteTitle')"
        :confirm-delete-message="t('confirmDeleteTitle')"
        @add="onAdd"
        @update="onUpdate"
        @delete="onDelete"
      ></admin-string-list-panel>
    </div>
  </colliers-page-shell>
</template>

<script>
import ColliersPageShell from '../../layout/ColliersPageShell.vue'
import AdminPageHeader from '../../components/AdminPageHeader.vue'
import AdminStringListPanel from '../../components/AdminStringListPanel.vue'
import { store, t, loadTitles, addTitle, updateTitle, deleteTitle } from '../../store'

export default {
  name: 'ManageTitlesPage',
  components: { ColliersPageShell, AdminPageHeader, AdminStringListPanel },
  data: function () {
    return { store: store }
  },
  mounted: function () {
    loadTitles(true)
  },
  methods: {
    t: t,
    onAdd: function (value) {
      addTitle(value)
    },
    onUpdate: function (payload) {
      const index = this.store.titles.indexOf(payload.oldValue)
      if (index !== -1) updateTitle(index, payload.newValue)
    },
    onDelete: function (value) {
      const index = this.store.titles.indexOf(value)
      if (index !== -1) deleteTitle(index)
    },
  },
}
</script>
