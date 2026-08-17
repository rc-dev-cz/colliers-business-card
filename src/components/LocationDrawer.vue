<script setup>
import { ref, watch } from 'vue'
import { useLocale } from '../composables/useLocale'
import { useCart } from '../composables/useCart'
import { useAddressBook } from '../composables/useAddressBook'

const emit = defineEmits(['select'])
const { t } = useLocale()
const { locationOpen, closeLocationPicker } = useCart()
const { offices, officesLoading, officesError, loadOffices, formatAddressLine, officeLabel } =
  useAddressBook()
const drawer = ref(null)
const selected = ref([])
const newAddress = ref('')

watch(locationOpen, async (open) => {
  await customElements.whenDefined('sl-drawer')
  const el = drawer.value
  if (!el) return
  if (open) {
    selected.value = []
    newAddress.value = ''
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

function addNew() {
  const value = newAddress.value.trim()
  if (!value) return
  selected.value = [...selected.value, value]
  newAddress.value = ''
}

function done() {
  emit('select', selected.value)
  closeLocationPicker()
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
    <div slot="label" class="text-lg font-semibold">{{ t('selectOrAddLocation') }}</div>

    <div class="space-y-6">
      <div>
        <h3 class="mb-3 font-semibold text-gray-900">{{ t('savedAddresses') }}</h3>
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

      <div class="text-center text-sm text-gray-400">{{ t('or') }}</div>

      <div>
        <h3 class="mb-2 font-semibold text-gray-900">{{ t('addNewAddress') }}</h3>
        <div class="flex gap-2">
          <input
            v-model="newAddress"
            type="text"
            class="field-input"
            :placeholder="t('enterFullAddress')"
          />
          <button type="button" class="btn-primary shrink-0 px-3" @click="addNew">{{ t('add') }}</button>
        </div>
      </div>
    </div>

    <div slot="footer">
      <button type="button" class="btn-primary w-full" @click="done">{{ t('done') }}</button>
    </div>
  </sl-drawer>
</template>
