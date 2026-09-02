<template>
  <colliers-page-shell viewport-list>
    <div class="colliers-viewport-list mx-auto w-full max-w-2xl">
      <admin-page-header
        :title="t('manageDegrees')"
        :subtitle="t('manageDegreesHint')"
      ></admin-page-header>

      <admin-string-list-panel
        viewport-fill
        :items="store.degrees"
        :placeholder="t('newDegreePlaceholder')"
        :empty-label="t('noDegrees')"
        :add-label="t('addDegree')"
        :edit-label="t('editDegree')"
        :delete-label="t('deleteDegree')"
        :confirm-delete-message="t('confirmDeleteDegree')"
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
import { store, t, loadDegrees, addDegree, updateDegree, deleteDegree } from '../../store'

export default {
  name: 'ManageDegreesPage',
  components: { ColliersPageShell, AdminPageHeader, AdminStringListPanel },
  data: function () {
    return { store: store }
  },
  mounted: function () {
    loadDegrees(true)
  },
  methods: {
    t: t,
    onAdd: function (value) {
      addDegree(value)
    },
    onUpdate: function (payload) {
      updateDegree(payload.oldValue, payload.newValue)
    },
    onDelete: function (value) {
      deleteDegree(value)
    },
  },
}
</script>
