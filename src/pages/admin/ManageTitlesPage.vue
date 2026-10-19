<template>
  <colliers-page-shell viewport-list>
    <div class="colliers-viewport-list mx-auto w-full max-w-2xl">
      <admin-page-header :title="t('manageTitles')"></admin-page-header>

      <admin-string-list-panel
        :key="activeTab"
        viewport-fill
        :items="items"
        :placeholder="t(activeTab === 'FR' ? 'newTitlePlaceholderFr' : 'newTitlePlaceholderEn')"
        :empty-label="t(activeTab === 'FR' ? 'noTitlesFr' : 'noTitlesEn')"
        :add-label="t('addTitle')"
        :edit-label="t('editTitle')"
        :delete-label="t('deleteTitle')"
        :confirm-delete-message="t('confirmDeleteTitle')"
        @add="onAdd"
        @update="onUpdate"
        @delete="onDelete"
      >
        <template #header>
          <nav class="colliers-tab-nav -mx-6 -mt-6 mb-4" :aria-label="t('manageTitles')">
            <button
              v-for="tab in tabs"
              :key="tab.language"
              type="button"
              class="colliers-tab"
              :class="{ 'colliers-tab--active': activeTab === tab.language }"
              @click="activeTab = tab.language"
            >
              {{ t(tab.label) }} ({{ tab.count }})
            </button>
          </nav>
        </template>
      </admin-string-list-panel>
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
    return { store: store, activeTab: 'EN' }
  },
  computed: {
    /** English titles are for English + bilingual cards; French titles for French cards. */
    items: function () {
      return this.activeTab === 'FR' ? this.store.titlesFr : this.store.titles
    },
    tabs: function () {
      return [
        { language: 'EN', label: 'englishTitles', count: this.store.titles.length },
        { language: 'FR', label: 'frenchTitles', count: this.store.titlesFr.length },
      ]
    },
  },
  mounted: function () {
    loadTitles()
  },
  methods: {
    t: t,
    onAdd: function (value) {
      addTitle(value, this.activeTab)
    },
    onUpdate: function (payload) {
      const index = this.items.indexOf(payload.oldValue)
      if (index !== -1) updateTitle(index, payload.newValue, this.activeTab)
    },
    onDelete: function (value) {
      const index = this.items.indexOf(value)
      if (index !== -1) deleteTitle(index, this.activeTab)
    },
  },
}
</script>
