<template>
  <colliers-page-shell>
    <div class="mx-auto w-full max-w-5xl">
      <div class="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-3xl font-bold text-gray-900 sm:text-4xl">{{ t('addresses') }}</h1>
        <app-button class="w-full sm:w-auto" @click="openNew">{{ t('newAddress') }}</app-button>
      </div>

      <div class="mb-6 border-b border-gray-200">
        <nav class="-mb-px flex gap-6" aria-label="Address book tabs">
          <button
            type="button"
            class="border-b-[3px] px-1 pb-3 text-sm font-medium transition-colors sm:text-base"
            :class="activeTab === 'personal' ? 'border-colliers-primary text-colliers-primary' : 'border-transparent text-gray-500 hover:text-gray-800'"
            @click="activeTab = 'personal'"
          >
            {{ t('myAddressBook') }}
          </button>
          <button
            type="button"
            class="border-b-[3px] px-1 pb-3 text-sm font-medium transition-colors sm:text-base"
            :class="activeTab === 'offices' ? 'border-colliers-primary text-colliers-primary' : 'border-transparent text-gray-500 hover:text-gray-800'"
            @click="activeTab = 'offices'"
          >
            {{ t('officeAddresses') }}
          </button>
        </nav>
      </div>

      <div class="mb-5">
        <label class="sr-only" for="address-search">{{ t('searchAddresses') }}</label>
        <text-field
          id="address-search"
          :value="search"
          :placeholder="t('searchAddressesPlaceholder')"
          @input="search = $event"
        ></text-field>
      </div>

      <div v-if="activeTab === 'personal'" class="overflow-x-auto rounded-md border border-gray-200 bg-white">
        <table class="min-w-full text-left text-sm">
          <thead class="border-b border-gray-200 bg-gray-50 text-gray-600">
            <tr>
              <th class="px-4 py-3 font-medium">{{ t('locationName') }}</th>
              <th class="px-4 py-3 font-medium">{{ t('address') }}</th>
              <th class="px-4 py-3 text-right font-medium">{{ t('actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!filteredPersonal.length">
              <td colspan="3" class="px-4 py-10 text-center text-gray-500">
                {{ t('noPersonalAddresses') }}
              </td>
            </tr>
            <tr
              v-for="row in filteredPersonal"
              :key="row.id"
              class="border-b border-gray-100 last:border-0"
            >
              <td class="px-4 py-3 font-medium text-gray-900">{{ row.addressName }}</td>
              <td class="px-4 py-3 text-gray-700">{{ formatAddressLine(row) }}</td>
              <td class="whitespace-nowrap px-4 py-3 text-right">
                <button type="button" class="text-colliers-primary hover:underline" @click="openEdit(row.id)">
                  {{ t('edit') }}
                </button>
                <span class="mx-2 text-gray-300">|</span>
                <button type="button" class="text-red-600 hover:underline" @click="confirmDelete(row.id)">
                  {{ t('delete') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="overflow-x-auto rounded-md border border-gray-200 bg-white">
        <loading-state v-if="store.officesLoading" :message="t('loading')"></loading-state>
        <error-state v-else-if="store.officesError" :message="store.officesError"></error-state>
        <table v-else class="min-w-full text-left text-sm">
          <thead class="border-b border-gray-200 bg-gray-50 text-gray-600">
            <tr>
              <th class="px-4 py-3 font-medium">{{ t('locationName') }}</th>
              <th class="px-4 py-3 font-medium">{{ t('address') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!filteredOffices.length">
              <td colspan="2" class="px-4 py-10 text-center text-gray-500">
                {{ t('noOfficeAddresses') }}
              </td>
            </tr>
            <tr
              v-for="row in filteredOffices"
              :key="row.id"
              class="border-b border-gray-100 last:border-0"
            >
              <td class="px-4 py-3 font-medium text-gray-900">{{ row.addressName }}</td>
              <td class="px-4 py-3 text-gray-700">{{ formatAddressLine(row) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-if="formOpen"
      class="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      @click.self="closeForm"
    >
      <div class="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-lg bg-white shadow-xl sm:rounded-lg">
        <div class="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 class="text-lg font-semibold text-gray-900">
            {{ editingId ? t('editAddress') : t('newAddress') }}
          </h2>
          <button type="button" class="rounded p-1 text-gray-500 hover:bg-gray-100" @click="closeForm">
            {{ t('close') }}
          </button>
        </div>
        <form class="space-y-4 px-5 py-5" @submit.prevent="saveForm">
          <div>
            <label class="field-label" for="addr-nickname">{{ t('locationNickname') }}</label>
            <text-field id="addr-nickname" :value="form.addressName" required @input="form.addressName = $event"></text-field>
          </div>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label class="field-label" for="addr-street">{{ t('addressLine1') }}</label>
              <text-field id="addr-street" :value="form.addressStreet" required @input="form.addressStreet = $event"></text-field>
            </div>
            <div>
              <label class="field-label" for="addr-city">{{ t('city') }}</label>
              <text-field id="addr-city" :value="form.addressCity" required @input="form.addressCity = $event"></text-field>
            </div>
          </div>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label class="field-label" for="addr-province">{{ t('province') }}</label>
              <text-field id="addr-province" :value="form.addressProvince" @input="form.addressProvince = $event"></text-field>
            </div>
            <div>
              <label class="field-label" for="addr-postal">{{ t('postalCode') }}</label>
              <text-field id="addr-postal" :value="form.addressPostalZip" @input="form.addressPostalZip = $event"></text-field>
            </div>
            <div>
              <label class="field-label" for="addr-country">{{ t('country') }}</label>
              <text-field id="addr-country" :value="form.addressCountry" @input="form.addressCountry = $event"></text-field>
            </div>
          </div>
          <div class="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
            <app-button variant="outline" @click="closeForm">{{ t('cancel') }}</app-button>
            <app-button html-type="submit">{{ t('save') }}</app-button>
          </div>
        </form>
      </div>
    </div>
  </colliers-page-shell>
</template>

<script>
import ColliersPageShell from '../layout/ColliersPageShell.vue'
import AppButton from '../components/AppButton.vue'
import TextField from '../components/TextField.vue'
import LoadingState from '../components/LoadingState.vue'
import ErrorState from '../components/ErrorState.vue'
import { store, t, loadOffices, addPersonal, updatePersonal, deletePersonal, getPersonal } from '../store'
import { emptyPersonal, matchesSearch, formatAddressLine } from '../helpers/addressBook'

export default {
  name: 'AddressBookPage',
  components: { ColliersPageShell, AppButton, TextField, LoadingState, ErrorState },
  data: function () {
    return {
      store: store,
      activeTab: 'personal',
      search: '',
      formOpen: false,
      editingId: null,
      form: emptyPersonal(),
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
  },
  mounted: function () {
    loadOffices()
  },
  methods: {
    t: t,
    formatAddressLine: formatAddressLine,
    resetForm: function () {
      this.form = emptyPersonal()
      this.editingId = null
    },
    openNew: function () {
      this.resetForm()
      this.formOpen = true
    },
    openEdit: function (id) {
      const row = getPersonal(id)
      if (!row) return
      this.resetForm()
      this.form = Object.assign(emptyPersonal(), row)
      this.editingId = id
      this.formOpen = true
    },
    closeForm: function () {
      this.formOpen = false
      this.resetForm()
    },
    saveForm: function () {
      const payload = {
        addressName: String(this.form.addressName || '').trim(),
        addressStreet: String(this.form.addressStreet || '').trim(),
        addressCity: String(this.form.addressCity || '').trim(),
        addressProvince: String(this.form.addressProvince || '').trim(),
        addressPostalZip: String(this.form.addressPostalZip || '').trim(),
        addressCountry: String(this.form.addressCountry || '').trim() || 'Canada',
      }
      if (!payload.addressName || !payload.addressStreet || !payload.addressCity) return
      if (this.editingId) updatePersonal(this.editingId, payload)
      else addPersonal(payload)
      this.closeForm()
      this.activeTab = 'personal'
    },
    confirmDelete: function (id) {
      if (window.confirm(t('confirmDeleteAddress'))) deletePersonal(id)
    },
  },
}
</script>
