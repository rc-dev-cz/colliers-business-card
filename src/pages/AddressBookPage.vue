<template>
  <colliers-page-shell viewport-list>
    <div class="colliers-viewport-list mx-auto w-full max-w-5xl">
      <div class="colliers-page-header">
        <h1 class="colliers-page-title">{{ t('addressBook') }}</h1>
        <app-button v-if="activeTab === 'personal'" class="w-full sm:w-auto" @click="openNew">{{ t('newAddress') }}</app-button>
      </div>

      <p
        v-if="statusMessageKey"
        role="status"
        class="mb-5 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
      >
        {{ t(statusMessageKey) }}
      </p>

      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <nav class="flex gap-6 border-b border-gray-200 px-5 pt-4" :aria-label="t('addressBookTabsAria')">
          <button
            type="button"
            class="border-b-[3px] px-1 pb-3 text-sm font-medium transition-colors sm:text-base"
            :class="activeTab === 'personal' ? 'border-colliers-primary text-colliers-primary' : 'border-transparent text-gray-500 hover:text-gray-800'"
            @click="setTab('personal')"
          >
            {{ t('myAddressBook') }}
          </button>
          <button
            type="button"
            class="border-b-[3px] px-1 pb-3 text-sm font-medium transition-colors sm:text-base"
            :class="activeTab === 'offices' ? 'border-colliers-primary text-colliers-primary' : 'border-transparent text-gray-500 hover:text-gray-800'"
            @click="setTab('offices')"
          >
            {{ t('officeAddresses') }}
          </button>
        </nav>

        <div class="border-b border-gray-100 p-4 sm:p-5">
          <label class="sr-only" for="address-search">{{ t('searchAddresses') }}</label>
          <search-field
            id="address-search"
            :value="search"
            :placeholder="t('searchAddressesPlaceholder')"
            @input="search = $event"
          ></search-field>
        </div>

        <loading-state v-if="activeTab === 'offices' && store.officesLoading" :message="t('loading')"></loading-state>
        <error-state v-else-if="activeTab === 'offices' && store.officesError" :message="store.officesError"></error-state>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full text-left text-sm">
            <thead class="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
              <tr>
                <th class="w-48 px-4 py-3 sm:w-56">{{ t('locationName') }}</th>
                <th class="px-4 py-3">{{ t('officeLocation') }}</th>
                <th class="w-40 px-4 py-3 text-right">{{ t('action') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!activeRows.length">
                <td colspan="3" class="px-4 py-10 text-center text-sm italic text-gray-500">{{ emptyListLabel }}</td>
              </tr>
              <tr
                v-for="row in activeRows"
                :key="row.id"
                class="border-b border-gray-100 last:border-0"
              >
                <td class="px-4 py-3 font-semibold text-gray-900">{{ row.addressName }}</td>
                <td class="px-4 py-3 text-gray-700">{{ formatAddressLine(row) }}</td>
                <td class="whitespace-nowrap px-4 py-3 text-right">
                  <div v-if="activeTab === 'personal'" class="inline-flex items-center justify-end gap-2">
                    <button
                      type="button"
                      class="inline-flex items-center gap-1.5 rounded bg-colliers-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-colliers-primary-hover"
                      :aria-label="t('edit')"
                      @click="openEdit(row.id)"
                    >
                      <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 7.125L16.862 4.487" />
                      </svg>
                      {{ t('edit') }}
                    </button>
                    <button
                      type="button"
                      class="inline-flex items-center justify-center rounded border border-gray-300 bg-white p-1.5 text-gray-500 transition-colors hover:border-red-300 hover:text-red-500"
                      :aria-label="t('delete')"
                      @click="confirmDelete(row.id)"
                    >
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <app-modal
      :open="formOpen"
      :title="editingId ? t('editAddress') : t('addAddress')"
      size="xl"
      @close="closeForm"
    >
      <form @submit="saveForm">
        <div class="space-y-4 px-5 py-5">
          <p
            v-if="formError"
            role="alert"
            class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {{ formError }}
          </p>
          <div>
            <label class="field-label" for="addr-nickname">{{ t('locationNickname') }}</label>
            <text-field
              id="addr-nickname"
              :value="form.addressName"
              :error="fieldErrors.addressName"
              required
              @input="onFieldInput('addressName', $event)"
            ></text-field>
          </div>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label class="field-label" for="addr-street">{{ t('addressLine1') }}</label>
              <text-field
                id="addr-street"
                :value="form.addressStreet"
                :error="fieldErrors.addressStreet"
                required
                @input="onFieldInput('addressStreet', $event)"
              ></text-field>
            </div>
            <div>
              <label class="field-label" for="addr-city">{{ t('city') }}</label>
              <text-field
                id="addr-city"
                :value="form.addressCity"
                :error="fieldErrors.addressCity"
                required
                @input="onFieldInput('addressCity', $event)"
              ></text-field>
            </div>
          </div>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label class="field-label" for="addr-province">{{ t('province') }}</label>
              <text-field id="addr-province" :value="form.addressProvince" @input="onFieldInput('addressProvince', $event)"></text-field>
            </div>
            <div>
              <label class="field-label" for="addr-postal">{{ t('postalCode') }}</label>
              <text-field id="addr-postal" :value="form.addressPostalZip" @input="onFieldInput('addressPostalZip', $event)"></text-field>
            </div>
            <div>
              <label class="field-label" for="addr-country">{{ t('country') }}</label>
              <text-field id="addr-country" :value="form.addressCountry" @input="onFieldInput('addressCountry', $event)"></text-field>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <app-button variant="outline" class="sm:w-auto" @click="closeForm">{{ t('cancel') }}</app-button>
          <div class="modal-footer-actions">
            <app-button html-type="submit" class="sm:w-auto">{{ t('save') }}</app-button>
          </div>
        </div>
      </form>
    </app-modal>
  </colliers-page-shell>
</template>

<script>
import ColliersPageShell from '../layout/ColliersPageShell.vue'
import AppButton from '../components/AppButton.vue'
import AppModal from '../components/AppModal.vue'
import TextField from '../components/TextField.vue'
import SearchField from '../components/SearchField.vue'
import LoadingState from '../components/LoadingState.vue'
import ErrorState from '../components/ErrorState.vue'
import { store, t, loadOffices, addPersonal, updatePersonal, deletePersonal, getPersonal } from '../store'
import { emptyPersonal, matchesSearch, formatAddressLine } from '../helpers/addressBook'

export default {
  name: 'AddressBookPage',
  components: { ColliersPageShell, AppButton, AppModal, TextField, SearchField, LoadingState, ErrorState },
  data: function () {
    return {
      store: store,
      activeTab: 'personal',
      search: '',
      formOpen: false,
      editingId: null,
      form: emptyPersonal(),
      statusMessageKey: null,
      formError: '',
      fieldErrors: {},
    }
  },
  computed: {
    filteredPersonal: function () {
      const self = this
      return this.store.personalAddresses.filter(function (row) {
        return matchesSearch(row, self.search)
      })
    },
    filteredOffices: function () {
      const self = this
      return this.store.offices.filter(function (row) {
        return matchesSearch(row, self.search)
      })
    },
    activeRows: function () {
      return this.activeTab === 'personal' ? this.filteredPersonal : this.filteredOffices
    },
    emptyListLabel: function () {
      if (this.activeTab === 'personal') return t('noPersonalAddresses')
      return t('noOfficeAddresses')
    },
  },
  mounted: function () {
    loadOffices()
  },
  methods: {
    t: t,
    formatAddressLine: formatAddressLine,
    clearStatusMessage: function () {
      this.statusMessageKey = null
    },
    clearFormErrors: function () {
      this.formError = ''
      this.fieldErrors = {}
    },
    onFieldInput: function (field, value) {
      this.form[field] = value
      if (this.fieldErrors[field]) {
        const next = Object.assign({}, this.fieldErrors)
        delete next[field]
        this.fieldErrors = next
      }
      if (this.formError) this.formError = ''
    },
    validateForm: function () {
      const required = ['addressName', 'addressStreet', 'addressCity']
      const errors = {}
      const self = this
      required.forEach(function (field) {
        if (!String(self.form[field] || '').trim()) errors[field] = t('fieldRequired')
      })
      this.fieldErrors = errors
      this.formError = Object.keys(errors).length ? t('addressFormIncomplete') : ''
      return !Object.keys(errors).length
    },
    setTab: function (tab) {
      this.activeTab = tab
      this.clearStatusMessage()
    },
    resetForm: function () {
      this.form = emptyPersonal()
      this.editingId = null
    },
    openNew: function () {
      this.clearStatusMessage()
      this.clearFormErrors()
      this.resetForm()
      this.formOpen = true
    },
    openEdit: function (id) {
      const row = getPersonal(id)
      if (!row) return
      this.clearStatusMessage()
      this.clearFormErrors()
      this.resetForm()
      this.form = Object.assign(emptyPersonal(), row)
      this.editingId = id
      this.formOpen = true
    },
    closeForm: function () {
      this.formOpen = false
      this.clearFormErrors()
      this.resetForm()
    },
    saveForm: function (event) {
      if (event && typeof event.preventDefault === 'function') event.preventDefault()
      if (!this.validateForm()) return
      const payload = {
        addressName: String(this.form.addressName || '').trim(),
        addressStreet: String(this.form.addressStreet || '').trim(),
        addressCity: String(this.form.addressCity || '').trim(),
        addressProvince: String(this.form.addressProvince || '').trim(),
        addressPostalZip: String(this.form.addressPostalZip || '').trim(),
        addressCountry: String(this.form.addressCountry || '').trim() || 'Canada',
      }
      const isEdit = Boolean(this.editingId)
      if (isEdit) updatePersonal(this.editingId, payload)
      else addPersonal(payload)
      this.statusMessageKey = isEdit ? 'addressUpdated' : 'addressSaved'
      this.closeForm()
      this.activeTab = 'personal'
    },
    confirmDelete: function (id) {
      this.clearStatusMessage()
      if (window.confirm(t('confirmDeleteAddress'))) deletePersonal(id)
    },
  },
}
</script>
