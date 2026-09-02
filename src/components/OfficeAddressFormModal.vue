<template>
  <app-modal
    :open="open"
    :title="isEditing ? t('updateExistingAddress') : t('newAddressTitle')"
    :subtitle="t('officeAddressFormIntro')"
    size="wide"
    @close="onClose"
  >
    <form @submit.prevent="submit">
      <div class="space-y-6 px-5 py-5 sm:px-6 sm:py-6">
        <p
          v-if="draftSavedNotice"
          role="status"
          class="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
        >
          {{ t('draftSaved') }}
        </p>

        <div>
          <label class="office-form-label" for="office-form-name">
            {{ t('addressName') }} <span class="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="office-form-name"
            v-model="form.addressName"
            type="text"
            class="field-input"
            required
            :placeholder="t('addressNamePlaceholder')"
          />
        </div>

        <div>
          <label class="office-form-label" for="office-form-street">
            {{ t('streetAddress') }} <span class="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="office-form-street"
            v-model="form.addressStreet"
            type="text"
            class="field-input"
            required
            :placeholder="t('streetAddressPlaceholder')"
          />
        </div>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label class="office-form-label" for="office-form-city">
              {{ t('city') }} <span class="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="office-form-city"
              v-model="form.addressCity"
              type="text"
              class="field-input"
              required
            />
          </div>
          <div>
            <label class="office-form-label" for="office-form-province">
              {{ t('stateProvince') }} <span class="text-red-500" aria-hidden="true">*</span>
            </label>
            <select
              id="office-form-province"
              v-model="form.addressProvince"
              class="field-input"
              required
            >
              <option disabled value="">{{ t('selectProvince') }}</option>
              <option
                v-for="province in provinces"
                :key="province.value"
                :value="province.value"
              >
                {{ province.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label class="office-form-label" for="office-form-postal">
              {{ t('zipPostalCode') }} <span class="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="office-form-postal"
              v-model="form.addressPostalZip"
              type="text"
              class="field-input"
              required
            />
          </div>
          <div>
            <label class="office-form-label" for="office-form-country">
              {{ t('country') }} <span class="text-red-500" aria-hidden="true">*</span>
            </label>
            <select
              id="office-form-country"
              v-model="form.addressCountry"
              class="field-input"
              required
            >
              <option
                v-for="country in countries"
                :key="country.value"
                :value="country.value"
              >
                {{ country.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <app-button variant="outline" class="sm:w-auto" :disabled="saving" @click="onClose">
          {{ t('cancel') }}
        </app-button>
        <div class="modal-footer-actions">
          <button
            type="button"
            class="btn-secondary min-w-[120px]"
            :disabled="saving"
            @click="saveDraft"
          >
            {{ t('saveDraft') }}
          </button>
          <app-button html-type="submit" class="min-w-[140px] sm:w-auto" :disabled="saving">
            {{ saving ? t('saving') : submitLabel }}
          </app-button>
        </div>
      </div>
    </form>
  </app-modal>
</template>

<script>
import AppModal from './AppModal.vue'
import AppButton from './AppButton.vue'
import { t } from '../store'
import { emptyOffice } from '../helpers/officeAdmin'
import { CANADIAN_PROVINCES, OFFICE_COUNTRY_OPTIONS } from '../helpers/canadianProvinces'
import { readStorage, writeStorage, removeStorage } from '../helpers/storage'

const OFFICE_DRAFT_KEY = 'officeAddressDraft'

export default {
  name: 'OfficeAddressFormModal',
  components: { AppModal, AppButton },
  props: {
    open: { type: Boolean, default: false },
    editingId: { type: String, default: null },
    initialForm: { type: Object, default: null },
    saving: { type: Boolean, default: false },
  },
  data: function () {
    return {
      form: emptyOffice(),
      draftSavedNotice: false,
      provinces: CANADIAN_PROVINCES,
      countries: OFFICE_COUNTRY_OPTIONS,
    }
  },
  computed: {
    isEditing: function () {
      return Boolean(this.editingId)
    },
    submitLabel: function () {
      return this.isEditing ? t('updateAddress') : t('addNewAddress')
    },
  },
  watch: {
    open: function (isOpen) {
      if (isOpen) {
        this.draftSavedNotice = false
        this.syncForm()
      }
    },
    initialForm: function () {
      if (this.open) this.syncForm()
    },
  },
  methods: {
    t: t,
    syncForm: function () {
      if (this.editingId) {
        this.form = Object.assign(emptyOffice(), this.initialForm || {})
        return
      }
      const draft = readStorage(OFFICE_DRAFT_KEY, null)
      if (draft && typeof draft === 'object') {
        this.form = Object.assign(emptyOffice(), this.initialForm || {}, draft)
        return
      }
      this.form = Object.assign(emptyOffice(), this.initialForm || {})
    },
    onClose: function () {
      this.draftSavedNotice = false
      this.$emit('close')
    },
    saveDraft: function () {
      writeStorage(OFFICE_DRAFT_KEY, {
        addressName: this.form.addressName,
        addressStreet: this.form.addressStreet,
        addressCity: this.form.addressCity,
        addressProvince: this.form.addressProvince,
        addressPostalZip: this.form.addressPostalZip,
        addressCountry: this.form.addressCountry || 'Canada',
      })
      this.draftSavedNotice = true
    },
    clearDraft: function () {
      removeStorage(OFFICE_DRAFT_KEY)
    },
    submit: function () {
      const payload = {
        addressName: String(this.form.addressName || '').trim(),
        addressStreet: String(this.form.addressStreet || '').trim(),
        addressStreet2: '',
        addressCity: String(this.form.addressCity || '').trim(),
        addressProvince: String(this.form.addressProvince || '').trim(),
        addressPostalZip: String(this.form.addressPostalZip || '').trim(),
        addressCountry: String(this.form.addressCountry || '').trim() || 'Canada',
      }
      if (!payload.addressName || !payload.addressStreet || !payload.addressCity) return
      if (!payload.addressProvince || !payload.addressPostalZip) return
      this.clearDraft()
      this.$emit('save', payload)
    },
  },
}
</script>

<style scoped>
.office-form-label {
  @apply mb-1 block text-[13px] font-medium text-gray-700;
}
</style>
