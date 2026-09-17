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
          <div class="space-y-4">
            <div v-for="preview in previewSlots" :key="preview.language" class="card-preview-frame">
              <card-preview :details="preview.details" :language="preview.language"></card-preview>
            </div>
          </div>
          <p v-if="printPdfError" class="mt-3 text-sm text-red-600">{{ printPdfError }}</p>
          <app-button
            class="mt-4"
            variant="outline"
            block
            :disabled="printPdfBusy"
            @click="openPrintPdf"
          >{{ printPdfBusy ? t('loading') : t('viewPrintPdf') }}</app-button>
        </div>

        <div class="min-w-0 flex-1">
          <div class="mb-6 flex items-start justify-between gap-4">
            <h1 class="colliers-page-title">{{ t('customizeDetails') }}</h1>
            <button
              type="button"
              class="shrink-0 text-sm text-gray-500 underline-offset-2 hover:text-gray-800 hover:underline"
              @click="clearDesign"
            >{{ t('clearDesign') }}</button>
          </div>
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
            <multi-select-field
              :label="t('degreeOptional')"
              :value="details.degree"
              :options="degreeOptions"
              :placeholder="t('selectDegree')"
              :search-placeholder="t('selectDegree')"
              :empty-label="t('noDegrees')"
              @input="details.degree = $event"
            ></multi-select-field>
            <text-field
              :label="t('additionalCredentialsOptional')"
              :value="details.additionalCredentials"
              @input="details.additionalCredentials = $event"
            ></text-field>
            <text-field
              :label="t('regionOptional')"
              :value="details.region"
              @input="details.region = $event"
            ></text-field>
            <text-field
              :label="t('specializedTeamOptional')"
              :value="details.specializedTeam"
              @input="details.specializedTeam = $event"
            ></text-field>
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
              :label="t('officeLocation')"
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
import MultiSelectField from '../components/MultiSelectField.vue'
import PhoneField from '../components/PhoneField.vue'
import AppButton from '../components/AppButton.vue'
import { getProduct, jobTitles } from '../data/products'
import { t, store, addToCart, loadOffices, loadDegrees } from '../store'
import { clipEmail, clipName, EMAIL_MAX, NAME_MAX } from '../helpers/validate'
import { formatAddressCard, officeLabel } from '../adapters/api'
import { goBack } from '../adapters/nav'
import { viewPrintPdf } from '../helpers/printPdf'
import {
  isBilingualLanguage,
  websiteForProduct,
  WEBSITE_FR,
} from '../helpers/formatCardIdentity'

function emptyDetails(language) {
  return {
    name: '',
    title: '',
    degree: [],
    additionalCredentials: '',
    region: '',
    specializedTeam: '',
    email: '',
    phone: '',
    company: 'Colliers Project Leaders',
    address: '',
    website: websiteForProduct(language),
  }
}

function cloneDetails(details) {
  var out = Object.assign({}, details || {})
  out.degree = Array.isArray(details && details.degree) ? details.degree.slice() : []
  return out
}

export default {
  name: 'CustomizePage',
  components: {
    ColliersPageShell,
    CardPreview,
    TextField,
    SelectField,
    MultiSelectField,
    PhoneField,
    AppButton,
  },
  props: {
    code: { type: String, default: '' },
  },
  data: function () {
    return {
      store: store,
      NAME_MAX: NAME_MAX,
      EMAIL_MAX: EMAIL_MAX,
      printPdfBusy: false,
      printPdfError: '',
      details: emptyDetails('English'),
    }
  },
  computed: {
    product: function () {
      return getProduct(this.code)
    },
    previewSlots: function () {
      if (!this.product) return []
      var lang = this.product.language
      if (isBilingualLanguage(lang)) {
        return [
          { language: 'English', details: this.details },
          {
            language: 'French',
            details: Object.assign({}, this.details, { website: WEBSITE_FR }),
          },
        ]
      }
      return [{ language: lang, details: this.details }]
    },
    titleOptions: function () {
      return jobTitles.map(function (title) {
        return { value: title, label: title }
      })
    },
    degreeOptions: function () {
      return (store.degrees || []).map(function (degree) {
        return { value: degree, label: degree }
      })
    },
    officeOptions: function () {
      return store.offices.map(function (office) {
        return { value: formatAddressCard(office), label: officeLabel(office) }
      })
    },
  },
  watch: {
    product: {
      immediate: true,
      handler: function (product) {
        if (!product) return
        this.details.website = websiteForProduct(product.language)
      },
    },
  },
  mounted: function () {
    loadOffices()
    loadDegrees()
  },
  methods: {
    t: t,
    onName: function (value) {
      this.details.name = clipName(value)
    },
    onEmail: function (value) {
      this.details.email = clipEmail(value)
    },
    clearDesign: function () {
      var language = (this.product && this.product.language) || 'English'
      this.details = emptyDetails(language)
      this.printPdfError = ''
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
        details: cloneDetails(this.details),
      })
    },
    openPrintPdf: function () {
      var self = this
      if (!this.product || this.printPdfBusy) return
      this.printPdfBusy = true
      this.printPdfError = ''
      viewPrintPdf(Object.assign({}, this.details, {
        degree: Array.isArray(this.details.degree) ? this.details.degree.slice() : [],
      }), this.product.language)
        .catch(function (err) {
          self.printPdfError = (err && err.message) || String(err)
        })
        .then(function () {
          self.printPdfBusy = false
        })
    },
  },
}
</script>
