<template>
  <drawer :open="store.locationOpen" wide :close-label="t('close')" @close="onClose">
    <span slot="label">{{ t('selectLocation') }}</span>

    <div class="space-y-6">
      <div>
        <h3 class="mb-3 font-semibold text-gray-900">{{ t('myAddressBook') }}</h3>
        <p v-if="!store.personalAddresses.length" class="text-sm text-gray-500">
          {{ t('noPersonalAddresses') }}
        </p>
        <ul v-else class="space-y-2">
          <li v-for="row in store.personalAddresses" :key="row.id">
            <label class="flex cursor-pointer items-start gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                class="mt-1 h-4 w-4 rounded border-gray-300 text-colliers-primary focus:ring-colliers-primary"
                :checked="isSelectedRow(row)"
                @change="toggleRow(row)"
              />
              <span>{{ labelFor(row) }}</span>
            </label>
          </li>
        </ul>
      </div>

      <div>
        <h3 class="mb-3 font-semibold text-gray-900">{{ t('officeAddresses') }}</h3>
        <loading-state v-if="store.officesLoading" :message="t('loading')"></loading-state>
        <error-state v-else-if="store.officesError" :message="store.officesError"></error-state>
        <ul v-else class="space-y-2">
          <li v-for="office in store.offices" :key="office.id">
            <label class="flex cursor-pointer items-start gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                class="mt-1 h-4 w-4 rounded border-gray-300 text-colliers-primary focus:ring-colliers-primary"
                :checked="isSelectedRow(office)"
                @change="toggleRow(office)"
              />
              <span>{{ labelFor(office) }}</span>
            </label>
          </li>
        </ul>
      </div>

      <div class="border-t border-gray-100 pt-4 text-center">
        <p class="text-sm text-gray-400">{{ t('or') }}</p>
        <p class="mt-2 text-sm text-gray-600">{{ t('manageAddressesInBook') }}</p>
        <app-button class="mt-3 w-full" variant="outline" @click="goToAddressBook">
          {{ t('goToAddressBook') }}
        </app-button>
      </div>
    </div>

    <div slot="footer">
      <app-button block @click="done">{{ t('done') }}</app-button>
    </div>
  </drawer>
</template>

<script>
import Drawer from './Drawer.vue'
import LoadingState from './LoadingState.vue'
import ErrorState from './ErrorState.vue'
import AppButton from './AppButton.vue'
import { store, t, closeLocationPicker, loadOffices } from '../store'
import { formatAddressLine, officeLabel } from '../adapters/api'
import { go } from '../adapters/nav'

export default {
  name: 'LocationDrawer',
  components: { Drawer, LoadingState, ErrorState, AppButton },
  data: function () {
    return {
      store: store,
      selected: [],
    }
  },
  watch: {
    'store.locationOpen': function (open) {
      if (open) {
        this.selected = []
        loadOffices()
      }
    },
  },
  methods: {
    t: t,
    labelFor: officeLabel,
    lineFor: formatAddressLine,
    isSelectedRow: function (row) {
      return this.selected.indexOf(formatAddressLine(row)) !== -1
    },
    toggleRow: function (row) {
      const addr = formatAddressLine(row)
      if (this.selected.indexOf(addr) !== -1) {
        this.selected = this.selected.filter(function (value) {
          return value !== addr
        })
      } else {
        this.selected = this.selected.concat([addr])
      }
    },
    done: function () {
      this.$emit('select', this.selected.slice())
      closeLocationPicker()
    },
    goToAddressBook: function () {
      closeLocationPicker()
      go('addresses')
    },
    onClose: function () {
      closeLocationPicker()
    },
  },
}
</script>
