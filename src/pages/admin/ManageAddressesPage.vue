<template>
  <colliers-page-shell viewport-list>
    <div class="colliers-viewport-list mx-auto w-full max-w-2xl">
      <admin-page-header
        :title="t('manageAddresses')"
        :subtitle="t('manageColliersOfficesHint')"
      ></admin-page-header>

      <loading-state v-if="store.officesLoading" :message="t('loading')"></loading-state>
      <error-state v-else-if="store.officesError" :message="store.officesError"></error-state>
      <div v-else class="colliers-list-panel colliers-list-panel--viewport">
        <div class="mb-4 flex gap-2">
          <label class="sr-only" for="quick-office-address">{{ t('enterNewOfficeAddress') }}</label>
          <input
            id="quick-office-address"
            v-model="quickAdd"
            type="text"
            class="flex-1 rounded-[4px] border border-gray-300 bg-white px-3 py-2 text-[14px] focus:border-colliers-primary focus:outline-none focus:ring-1 focus:ring-colliers-primary"
            :placeholder="t('enterNewOfficeAddress')"
            @keydown.enter.prevent="openNewFromQuick"
          />
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-[4px] bg-colliers-primary px-4 py-2 text-white transition-colors hover:bg-colliers-primary-hover"
            :aria-label="t('addOfficeAddress')"
            @click="openNew"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>

        <div v-if="filteredOffices.length" class="colliers-list-panel-scroll">
          <ul class="space-y-2">
          <li
            v-for="row in filteredOffices"
            :key="row.id"
            class="colliers-list-row group"
          >
            <span class="colliers-list-row-body text-sm text-gray-800">{{ officeListLabel(row) }}</span>
            <colliers-list-row-actions
              :edit-label="t('editOfficeAddress')"
              :delete-label="t('removeOfficeAddress')"
              @edit="openEdit(row.id)"
              @delete="confirmDelete(row.id)"
            ></colliers-list-row-actions>
          </li>
          </ul>
        </div>
        <p v-else class="py-8 text-center text-sm italic text-gray-500">
          {{ t('noOfficeAddresses') }}
        </p>
      </div>
    </div>

    <office-address-form-modal
      :open="formOpen"
      :editing-id="editingId"
      :initial-form="form"
      :saving="saving"
      @close="closeForm"
      @save="saveForm"
    ></office-address-form-modal>
  </colliers-page-shell>
</template>

<script>
import ColliersPageShell from '../../layout/ColliersPageShell.vue'
import AdminPageHeader from '../../components/AdminPageHeader.vue'
import LoadingState from '../../components/LoadingState.vue'
import ErrorState from '../../components/ErrorState.vue'
import OfficeAddressFormModal from '../../components/OfficeAddressFormModal.vue'
import ColliersListRowActions from '../../components/ColliersListRowActions.vue'
import {
  store,
  t,
  loadOffices,
  addOffice,
  updateOffice,
  deleteOffice,
  getOffice,
} from '../../store'
import { emptyOffice } from '../../helpers/officeAdmin'
import { formatAddressLine } from '../../helpers/addressBook'

export default {
  name: 'ManageAddressesPage',
  components: { ColliersPageShell, AdminPageHeader, LoadingState, ErrorState, OfficeAddressFormModal, ColliersListRowActions },
  data: function () {
    return {
      store: store,
      quickAdd: '',
      formOpen: false,
      editingId: null,
      form: emptyOffice(),
      saving: false,
    }
  },
  computed: {
    filteredOffices: function () {
      return this.store.offices
    },
  },
  mounted: function () {
    loadOffices(true)
  },
  methods: {
    t: t,
    formatAddressLine: formatAddressLine,
    officeListLabel: function (row) {
      const line = formatAddressLine(row)
      const name = String(row.addressName || '').trim()
      if (name && name !== line) return name + ' — ' + line
      return line || name
    },
    resetForm: function () {
      this.form = emptyOffice()
      this.editingId = null
    },
    openNew: function () {
      this.resetForm()
      this.prefillFromQuick()
      this.formOpen = true
    },
    openNewFromQuick: function () {
      this.openNew()
    },
    prefillFromQuick: function () {
      const text = String(this.quickAdd || '').trim()
      if (!text) return
      this.form.addressStreet = text
    },
    openEdit: function (id) {
      const row = getOffice(id)
      if (!row) return
      this.resetForm()
      this.form = Object.assign(emptyOffice(), row)
      this.editingId = id
      this.formOpen = true
    },
    closeForm: function () {
      if (this.saving) return
      this.formOpen = false
      this.resetForm()
    },
    saveForm: function (payload) {
      const self = this
      this.saving = true
      setTimeout(function () {
        if (self.editingId) updateOffice(self.editingId, payload)
        else addOffice(payload)
        self.saving = false
        self.quickAdd = ''
        self.closeForm()
      }, 400)
    },
    confirmDelete: function (id) {
      if (window.confirm(t('confirmDeleteOffice'))) deleteOffice(id)
    },
  },
}
</script>
