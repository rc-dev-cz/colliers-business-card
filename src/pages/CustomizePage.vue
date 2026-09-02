<template>
  <colliers-page-shell>
    <div v-if="!product" class="py-20 text-center text-gray-500">{{ t('productNotFound') }}</div>
    <div v-else>
      <button type="button" class="mb-6 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900" @click="back">
        <span aria-hidden="true">‹</span> {{ t('back') }}
      </button>

      <div class="flex flex-col gap-10 lg:flex-row lg:gap-12">
        <div class="w-full lg:max-w-[480px]">
          <h2 class="mb-4 text-lg font-bold text-colliers-primary">{{ t('cardPreview') }}</h2>
          <div class="rounded-lg bg-gray-100 p-4 sm:p-6">
            <card-preview :details="details"></card-preview>
          </div>
        </div>

        <div class="min-w-0 flex-1">
          <h1 class="colliers-page-title mb-6">{{ t('customizeDetails') }}</h1>
          <form class="space-y-4" @submit.prevent="addItemToCart">
            <text-field
              :label="t('fullName')"
              :value="details.name"
              :maxlength="NAME_MAX"
              :hint="details.name.length + '/' + NAME_MAX + ' — ' + t('fullNameHint')"
              @input="onName"
            ></text-field>
            <select-field
              :label="t('title')"
              :value="details.title"
              :options="titleOptions"
              :placeholder="t('selectTitle')"
              @input="details.title = $event"
            ></select-field>
            <text-field
              :label="t('email')"
              type="email"
              :value="details.email"
              :maxlength="EMAIL_MAX"
              :hint="details.email.length + '/' + EMAIL_MAX + ' — ' + t('emailHint')"
              @input="onEmail"
            ></text-field>
            <phone-field
              :label="t('mobilePhone')"
              :value="details.phone"
              :hint="t('mobilePhoneHint')"
              @input="details.phone = $event"
            ></phone-field>
            <text-field :label="t('companyName')" :value="details.company" disabled></text-field>
            <select-field
              :label="t('address')"
              :value="details.address"
              :options="officeOptions"
              :placeholder="store.officesLoading ? t('loading') : t('selectAddress')"
              :disabled="store.officesLoading"
              @input="details.address = $event"
            ></select-field>
            <text-field :label="t('website')" :value="details.website" disabled></text-field>
            <app-button html-type="submit" block>{{ t('addToCart') }}</app-button>
          </form>
        </div>
      </div>
    </div>
  </colliers-page-shell>
</template>

<script>
import ColliersPageShell from '../layout/ColliersPageShell.vue'
import CardPreview from '../components/CardPreview.vue'
import TextField from '../components/TextField.vue'
import SelectField from '../components/SelectField.vue'
import PhoneField from '../components/PhoneField.vue'
import AppButton from '../components/AppButton.vue'
import { getProduct, jobTitles } from '../data/products'
import { t, store, addToCart, loadOffices } from '../store'
import { clipEmail, clipName, EMAIL_MAX, NAME_MAX } from '../helpers/validate'
import { formatAddressCard, officeLabel } from '../adapters/api'
import { goBack } from '../adapters/nav'

export default {
  name: 'CustomizePage',
  components: { ColliersPageShell, CardPreview, TextField, SelectField, PhoneField, AppButton },
  props: {
    code: { type: String, required: true },
  },
  data: function () {
    return {
      store: store,
      NAME_MAX: NAME_MAX,
      EMAIL_MAX: EMAIL_MAX,
      details: {
        name: '',
        title: '',
        email: '',
        phone: '',
        company: 'Colliers',
        address: '',
        website: 'colliers.com/canada',
      },
    }
  },
  computed: {
    product: function () {
      return getProduct(this.code)
    },
    titleOptions: function () {
      return jobTitles.map(function (title) {
        return { value: title, label: title }
      })
    },
    officeOptions: function () {
      return store.offices.map(function (office) {
        return { value: formatAddressCard(office), label: officeLabel(office) }
      })
    },
  },
  mounted: function () {
    loadOffices()
  },
  methods: {
    t: t,
    onName: function (value) {
      this.details.name = clipName(value)
    },
    onEmail: function (value) {
      this.details.email = clipEmail(value)
    },
    back: function () {
      goBack()
    },
    addItemToCart: function () {
      if (!this.product) return
      addToCart({
        code: this.product.code,
        language: this.product.language,
        quantity: 1,
        details: Object.assign({}, this.details),
      })
    },
  },
}
</script>
