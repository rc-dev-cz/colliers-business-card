<template>
  <colliers-page-shell viewport-list>
    <div class="colliers-viewport-list mx-auto w-full max-w-5xl">
      <div class="colliers-page-header">
        <h1 class="colliers-page-title">{{ t('addressBook') }}</h1>
        <div class="colliers-page-header__actions">
          <app-button v-if="activeTab === 'personal'" class="w-full sm:w-auto" @click="openNew"
            >+ {{ t('addNewAddress') }}</app-button
          >
        </div>
      </div>

      <p
        v-if="statusMessageKey"
        role="status"
        class="mb-5 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
      >
        {{ t(statusMessageKey) }}
      </p>

      <div
        class="colliers-list-panel--viewport overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        <nav
          class="flex gap-6 border-b border-gray-200 px-5 pt-4"
          :aria-label="t('addressBookTabsAria')"
        >
          <button
            type="button"
            class="border-b-[3px] px-1 pb-3 text-sm font-medium transition-colors sm:text-base"
            :class="
              activeTab === 'personal'
                ? 'border-colliers-primary text-colliers-primary'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            "
            @click="setTab('personal')"
          >
            {{ t('myAddressBook') }}
          </button>
          <button
            type="button"
            class="border-b-[3px] px-1 pb-3 text-sm font-medium transition-colors sm:text-base"
            :class="
              activeTab === 'offices'
                ? 'border-colliers-primary text-colliers-primary'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            "
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

        <loading-state
          v-if="activeTab === 'offices' && store.officesLoading"
          :message="t('loading')"
        ></loading-state>
        <error-state
          v-else-if="activeTab === 'offices' && store.officesError"
          :message="store.officesError"
        ></error-state>

        <div v-else class="colliers-list-panel-scroll">
          <!-- Phones: one card per address, actions under it, no sideways scroll (BUG-24) -->
          <ul class="divide-y divide-gray-100 sm:hidden">
            <li
              v-if="!activeRows.length"
              class="px-4 py-10 text-center text-sm italic text-gray-500"
            >
              {{ emptyListLabel }}
            </li>
            <li v-for="row in activeRows" :key="'card-' + row.id" class="px-4 py-4">
              <div class="font-semibold text-gray-900">{{ row.addressName }}</div>
              <div class="mt-1 text-sm text-gray-700">{{ streetLine(row) }}</div>
              <div class="text-sm text-gray-500">{{ cityLine(row) }}</div>
              <div v-if="activeTab === 'personal'" class="mt-3 flex items-center gap-4">
                <button
                  type="button"
                  class="btn-primary-sm"
                  :aria-label="t('edit')"
                  @click="openEdit(row.id)"
                >
                  {{ t('edit') }}
                </button>
                <button
                  type="button"
                  class="colliers-link-action colliers-link-action--danger"
                  :aria-label="t('delete')"
                  @click="confirmDelete(row.id)"
                >
                  {{ t('delete') }}
                </button>
              </div>
            </li>
          </ul>

          <div class="hidden overflow-x-auto sm:block">
            <table class="min-w-full text-left text-sm">
              <thead
                class="sticky top-0 z-10 border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500"
              >
                <tr>
                  <th class="w-48 px-4 py-3 sm:w-56">{{ t('locationName') }}</th>
                  <th class="px-4 py-3">{{ t('address') }}</th>
                  <th class="w-40 px-4 py-3 sm:w-48">{{ t('city') }}</th>
                  <th v-if="activeTab === 'personal'" class="w-40 px-4 py-3 text-right">
                    {{ t('actions') }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!activeRows.length">
                  <td
                    :colspan="activeTab === 'personal' ? 4 : 3"
                    class="px-4 py-10 text-center text-sm italic text-gray-500"
                  >
                    {{ emptyListLabel }}
                  </td>
                </tr>
                <tr
                  v-for="row in activeRows"
                  :key="row.id"
                  class="border-b border-gray-100 last:border-0"
                >
                  <td class="px-4 py-3 font-semibold text-gray-900">{{ row.addressName }}</td>
                  <td class="px-4 py-3 text-gray-700">{{ streetLine(row) }}</td>
                  <td class="px-4 py-3 text-gray-700">{{ cityLine(row) }}</td>
                  <!-- Colliers offices are read-only here (edited in Manage Addresses) -->
                  <td
                    v-if="activeTab === 'personal'"
                    class="whitespace-nowrap px-4 py-3 text-right"
                  >
                    <button
                      type="button"
                      class="btn-primary-sm"
                      :aria-label="t('edit')"
                      @click="openEdit(row.id)"
                    >
                      {{ t('edit') }}
                    </button>
                    <span class="mx-2 text-gray-300">|</span>
                    <button
                      type="button"
                      class="colliers-link-action colliers-link-action--danger"
                      :aria-label="t('delete')"
                      @click="confirmDelete(row.id)"
                    >
                      {{ t('delete') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <app-modal
      :open="formOpen"
      :title="editingId ? t('editAddress') : t('newAddressTitle')"
      size="xl"
      @close="onFormClose"
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
            <label class="field-label" for="addr-nickname"
              >{{ t('locationNickname')
              }}<span class="field-required" aria-hidden="true">*</span></label
            >
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
              <label class="field-label" for="addr-street"
                >{{ t('addressLine1')
                }}<span class="field-required" aria-hidden="true">*</span></label
              >
              <text-field
                id="addr-street"
                :value="form.addressStreet"
                :error="fieldErrors.addressStreet"
                required
                @input="onFieldInput('addressStreet', $event)"
              ></text-field>
            </div>
            <div>
              <label class="field-label" for="addr-city"
                >{{ t('city') }}<span class="field-required" aria-hidden="true">*</span></label
              >
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
              <text-field
                id="addr-province"
                :value="form.addressProvince"
                @input="onFieldInput('addressProvince', $event)"
              ></text-field>
            </div>
            <div>
              <label class="field-label" for="addr-postal">{{ t('postalCode') }}</label>
              <text-field
                id="addr-postal"
                :value="form.addressPostalZip"
                @input="onFieldInput('addressPostalZip', $event)"
              ></text-field>
            </div>
            <div>
              <label class="field-label" for="addr-country">{{ t('country') }}</label>
              <text-field
                id="addr-country"
                :value="form.addressCountry"
                @input="onFieldInput('addressCountry', $event)"
              ></text-field>
            </div>
          </div>
        </div>
        <div class="modal-footer modal-footer--sticky">
          <app-button variant="outline" class="sm:w-auto" @click="onFormClose">{{
            t('cancel')
          }}</app-button>
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
import {
  store,
  t,
  loadOffices,
  addPersonal,
  updatePersonal,
  deletePersonal,
  getPersonal,
  finishNewAddressForShipping,
  cancelNewAddressForShipping,
} from '../store'
import { emptyPersonal, matchesSearch, formatAddressLine } from '../helpers/addressBook'

export default {
  name: 'AddressBookPage',
  components: {
    ColliersPageShell,
    AppButton,
    AppModal,
    TextField,
    SearchField,
    LoadingState,
    ErrorState,
  },
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
      // A search with no hits is not the same as an empty list.
      if (String(this.search || '').trim()) return t('noMatchingAddresses')
      if (this.activeTab === 'personal') return t('noPersonalAddresses')
      return t('noOfficeAddresses')
    },
  },
  mounted: function () {
    loadOffices()
    // Came from Shipping "+ Add new address": open the form straight away (BUG-20).
    if (store.pendingAddressSplitId != null) this.openNew()
  },
  methods: {
    t: t,
    formatAddressLine: formatAddressLine,
    streetLine: function (row) {
      const street = [row.addressStreet, row.addressStreet2].filter(Boolean).join(', ')
      return street || formatAddressLine(row)
    },
    cityLine: function (row) {
      return [row.addressCity, row.addressProvince].filter(Boolean).join(', ')
    },
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
    /** Cancel / close: when Shipping sent us here, go back there with nothing added. */
    onFormClose: function () {
      this.closeForm()
      if (store.pendingAddressSplitId != null) cancelNewAddressForShipping()
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
      const saved = isEdit ? updatePersonal(this.editingId, payload) : addPersonal(payload)
      this.statusMessageKey = isEdit ? 'addressUpdated' : 'addressSaved'
      this.closeForm()
      this.activeTab = 'personal'
      if (!isEdit && store.pendingAddressSplitId != null) finishNewAddressForShipping(saved)
    },
    confirmDelete: function (id) {
      this.clearStatusMessage()
      if (window.confirm(t('confirmDeleteAddress'))) deletePersonal(id)
    },
  },
}
</script>
