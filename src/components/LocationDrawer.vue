<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLocale } from '../composables/useLocale'
import { useCart } from '../composables/useCart'
import { useAddressBook } from '../composables/useAddressBook'

const emit = defineEmits(['select'])
const router = useRouter()
const { t } = useLocale()
const { locationOpen, closeLocationPicker } = useCart()
const { personalAddresses, offices, officesLoading, officesError, loadOffices, formatAddressLine, officeLabel } =
  useAddressBook()
const drawer = ref(null)
const selected = ref([])

watch(locationOpen, async (open) => {
  await customElements.whenDefined('sl-drawer')
  const el = drawer.value
  if (!el) return
  if (open) {
    selected.value = []
    loadOffices()
    el.show()
  } else {
    el.hide()
  }
})

function toggle(addr) {
  if (selected.value.includes(addr)) {
    selected.value = selected.value.filter((row) => row !== addr)
  } else {
    selected.value = [...selected.value, addr]
  }
}

function done() {
  emit('select', selected.value)
  closeLocationPicker()
}

function goToAddressBook() {
  closeLocationPicker()
  router.push({ name: 'addresses' })
}

function onAfterHide() {
  closeLocationPicker()
}
</script>

<template>
  <sl-drawer
    ref="drawer"
    placement="end"
    style="--size: min(420px, 100vw)"
    @sl-after-hide="onAfterHide"
  >
    <div slot="label" class="text-lg font-semibold">{{ t('selectLocation') }}</div>

    <div class="space-y-6">
      <div>
        <h3 class="mb-3 font-semibold text-gray-900">{{ t('myAddressBook') }}</h3>
        <p v-if="!personalAddresses.length" class="text-sm text-gray-500">
          {{ t('noPersonalAddresses') }}
        </p>
        <ul v-else class="space-y-2">
          <li v-for="row in personalAddresses" :key="row.id">
            <label class="flex cursor-pointer items-start gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                class="mt-1 h-4 w-4 rounded border-gray-300 text-colliers-primary focus:ring-colliers-primary"
                :checked="selected.includes(formatAddressLine(row))"
                @change="toggle(formatAddressLine(row))"
              />
              <span>{{ officeLabel(row) }}</span>
            </label>
          </li>
        </ul>
      </div>

      <div>
        <h3 class="mb-3 font-semibold text-gray-900">{{ t('officeAddresses') }}</h3>
        <p v-if="officesLoading" class="text-sm text-gray-500">{{ t('loading') }}</p>
        <p v-else-if="officesError" class="text-sm text-red-600">{{ officesError }}</p>
        <ul v-else class="space-y-2">
          <li v-for="office in offices" :key="office.id">
            <label class="flex cursor-pointer items-start gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                class="mt-1 h-4 w-4 rounded border-gray-300 text-colliers-primary focus:ring-colliers-primary"
                :checked="selected.includes(formatAddressLine(office))"
                @change="toggle(formatAddressLine(office))"
              />
              <span>{{ officeLabel(office) }}</span>
            </label>
          </li>
        </ul>
      </div>

      <div class="border-t border-gray-100 pt-4 text-center">
        <p class="text-sm text-gray-400">{{ t('or') }}</p>
        <p class="mt-2 text-sm text-gray-600">{{ t('manageAddressesInBook') }}</p>
        <button type="button" class="btn-outline mt-3 w-full" @click="goToAddressBook">
          {{ t('goToAddressBook') }}
        </button>
      </div>
    </div>

    <div slot="footer">
      <button type="button" class="btn-primary w-full" @click="done">{{ t('done') }}</button>
    </div>
  </sl-drawer>
</template>
