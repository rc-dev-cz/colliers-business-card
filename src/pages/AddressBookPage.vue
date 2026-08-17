<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useLocale } from '../composables/useLocale'
import { useAddressBook } from '../composables/useAddressBook'
import ColliersPageShell from '../layout/ColliersPageShell.vue'

const { t } = useLocale()
  const {
  personalAddresses,
  offices,
  officesLoading,
  officesError,
  officesSource,
  loadOffices,
  matchesSearch,
  emptyPersonal,
  addPersonal,
  updatePersonal,
  deletePersonal,
  getPersonal,
  formatAddressLine,
} = useAddressBook()

const activeTab = ref('personal')
const search = ref('')
const formOpen = ref(false)
const editingId = ref(null)
const form = reactive(emptyPersonal())

onMounted(() => {
  loadOffices()
})

const filteredPersonal = computed(() =>
  personalAddresses.value.filter((row) => matchesSearch(row, search.value)),
)

const filteredOffices = computed(() =>
  offices.value.filter((row) => matchesSearch(row, search.value)),
)

function resetForm() {
  Object.assign(form, emptyPersonal())
  editingId.value = null
}

function openNew() {
  resetForm()
  formOpen.value = true
}

function openEdit(id) {
  const row = getPersonal(id)
  if (!row) return
  resetForm()
  Object.assign(form, emptyPersonal(), row)
  editingId.value = id
  formOpen.value = true
}

function closeForm() {
  formOpen.value = false
  resetForm()
}

function saveForm() {
  const payload = {
    addressName: form.addressName.trim(),
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    company: form.company.trim(),
    department: form.department.trim(),
    addressStreet: form.addressStreet.trim(),
    addressStreet2: form.addressStreet2.trim(),
    addressCity: form.addressCity.trim(),
    addressProvince: form.addressProvince.trim(),
    addressPostalZip: form.addressPostalZip.trim(),
    addressCountry: form.addressCountry.trim() || 'Canada',
  }
  if (!payload.addressName || !payload.addressStreet || !payload.addressCity) return

  if (editingId.value) {
    updatePersonal(editingId.value, payload)
  } else {
    addPersonal(payload)
  }
  closeForm()
  activeTab.value = 'personal'
}

function confirmDelete(id) {
  if (window.confirm(t('confirmDeleteAddress'))) {
    deletePersonal(id)
  }
}
</script>

<template>
  <ColliersPageShell>
    <div class="mx-auto w-full max-w-5xl">
      <div class="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-3xl font-bold text-gray-900 sm:text-4xl">{{ t('addresses') }}</h1>
        <button type="button" class="btn-primary w-full sm:w-auto" @click="openNew">
          {{ t('newAddress') }}
        </button>
      </div>

      <div class="mb-6 border-b border-gray-200">
        <nav class="-mb-px flex gap-6" aria-label="Address book tabs">
          <button
            type="button"
            class="border-b-[3px] px-1 pb-3 text-sm font-medium transition-colors sm:text-base"
            :class="
              activeTab === 'personal'
                ? 'border-colliers-primary text-colliers-primary'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            "
            @click="activeTab = 'personal'"
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
            @click="activeTab = 'offices'"
          >
            {{ t('officeAddresses') }}
          </button>
        </nav>
      </div>

      <div class="mb-5">
        <label class="sr-only" for="address-search">{{ t('searchAddresses') }}</label>
        <input
          id="address-search"
          v-model="search"
          type="search"
          class="field-input max-w-md"
          :placeholder="t('searchAddressesPlaceholder')"
        />
      </div>

      <p
        v-if="activeTab === 'offices' && !officesLoading && officesSource === 'fallback'"
        class="mb-4 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
      >
        {{ t('officesFallbackNotice') }}
      </p>

      <!-- My Address Book -->
      <div v-if="activeTab === 'personal'" class="overflow-x-auto rounded-md border border-gray-200 bg-white">
        <table class="min-w-full text-left text-sm">
          <thead class="border-b border-gray-200 bg-gray-50 text-gray-600">
            <tr>
              <th class="px-4 py-3 font-medium">{{ t('locationName') }}</th>
              <th class="px-4 py-3 font-medium">{{ t('address') }}</th>
              <th class="px-4 py-3 font-medium text-right">{{ t('actions') }}</th>
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
              <td class="px-4 py-3 text-right whitespace-nowrap">
                <button
                  type="button"
                  class="text-colliers-primary hover:underline"
                  @click="openEdit(row.id)"
                >
                  {{ t('edit') }}
                </button>
                <span class="mx-2 text-gray-300">|</span>
                <button
                  type="button"
                  class="text-red-600 hover:underline"
                  @click="confirmDelete(row.id)"
                >
                  {{ t('delete') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Office Addresses (API) — view only -->
      <div v-else class="overflow-x-auto rounded-md border border-gray-200 bg-white">
        <div v-if="officesLoading" class="flex items-center justify-center gap-3 px-4 py-16 text-gray-500">
          <div class="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-colliers-primary" />
          <span>{{ t('loading') }}</span>
        </div>
        <div v-else-if="officesError" class="px-4 py-10 text-center text-red-600">
          {{ officesError }}
          <div class="mt-3">
            <button type="button" class="btn-primary" @click="loadOffices({ force: true })">
              {{ t('retry') }}
            </button>
          </div>
        </div>
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

    <!-- Add / Edit personal address -->
    <div
      v-if="formOpen"
      class="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      :aria-label="editingId ? t('editAddress') : t('newAddress')"
      @click.self="closeForm"
    >
      <div class="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-lg bg-white shadow-xl sm:rounded-lg">
        <div class="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 class="text-lg font-semibold text-gray-900">
            {{ editingId ? t('editAddress') : t('newAddress') }}
          </h2>
          <button
            type="button"
            class="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            :aria-label="t('close')"
            @click="closeForm"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form class="space-y-4 px-5 py-5" @submit.prevent="saveForm">
          <div>
            <label class="field-label" for="addr-nickname">{{ t('locationNickname') }}</label>
            <input id="addr-nickname" v-model="form.addressName" required class="field-input" />
          </div>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label class="field-label" for="addr-first">{{ t('firstName') }}</label>
              <input id="addr-first" v-model="form.firstName" class="field-input" />
            </div>
            <div>
              <label class="field-label" for="addr-last">{{ t('lastName') }}</label>
              <input id="addr-last" v-model="form.lastName" class="field-input" />
            </div>
          </div>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label class="field-label" for="addr-email">{{ t('email') }}</label>
              <input id="addr-email" v-model="form.email" type="email" class="field-input" />
            </div>
            <div>
              <label class="field-label" for="addr-phone">{{ t('phone') }}</label>
              <input id="addr-phone" v-model="form.phone" class="field-input" />
            </div>
          </div>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label class="field-label" for="addr-company">{{ t('companyName') }}</label>
              <input id="addr-company" v-model="form.company" class="field-input" />
            </div>
            <div>
              <label class="field-label" for="addr-dept">{{ t('department') }}</label>
              <input id="addr-dept" v-model="form.department" class="field-input" />
            </div>
          </div>
          <div>
            <label class="field-label" for="addr-street">{{ t('addressLine1') }}</label>
            <input id="addr-street" v-model="form.addressStreet" required class="field-input" />
          </div>
          <div>
            <label class="field-label" for="addr-street2">{{ t('addressLine2') }}</label>
            <input id="addr-street2" v-model="form.addressStreet2" class="field-input" />
          </div>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label class="field-label" for="addr-city">{{ t('city') }}</label>
              <input id="addr-city" v-model="form.addressCity" required class="field-input" />
            </div>
            <div>
              <label class="field-label" for="addr-province">{{ t('province') }}</label>
              <input id="addr-province" v-model="form.addressProvince" class="field-input" />
            </div>
            <div>
              <label class="field-label" for="addr-postal">{{ t('postalCode') }}</label>
              <input id="addr-postal" v-model="form.addressPostalZip" class="field-input" />
            </div>
          </div>
          <div>
            <label class="field-label" for="addr-country">{{ t('country') }}</label>
            <input id="addr-country" v-model="form.addressCountry" class="field-input" />
          </div>

          <div class="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
            <button type="button" class="btn-outline sm:w-auto" @click="closeForm">
              {{ t('cancel') }}
            </button>
            <button type="submit" class="btn-primary sm:w-auto">
              {{ t('save') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </ColliersPageShell>
</template>
