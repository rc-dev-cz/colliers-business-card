<template>
  <colliers-page-shell>
    <div v-if="!product" class="py-20 text-center text-gray-500">{{ t('productNotFound') }}</div>
    <div v-else>
      <button
        type="button"
        class="mb-6 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        @click="back"
      >
        <span aria-hidden="true">‹</span> {{ t('back') }}
      </button>

      <div class="flex flex-col gap-10 lg:flex-row lg:gap-12">
        <div class="w-full lg:max-w-[480px]">
          <h2 class="mb-4 text-lg font-bold text-colliers-primary">{{ t('cardPreview') }}</h2>
          <div class="space-y-4">
            <div v-for="preview in previewSlots" :key="preview.language" class="card-preview-frame">
              <card-preview
                :details="preview.details"
                :language="preview.language"
                :plan="preview.plan"
                placeholders
              ></card-preview>
            </div>
          </div>

          <p v-if="layoutError" class="mt-3 text-sm text-red-600">{{ layoutError }}</p>
          <p v-else-if="printPdfError" class="mt-3 text-sm text-red-600">{{ printPdfError }}</p>
          <app-button
            class="mt-4"
            variant="outline"
            block
            :disabled="printPdfBusy || !layoutReady"
            @click="openPrintPdf"
            >{{ printPdfBusy ? t('loading') : t('viewPrintPdf') }}</app-button
          >
        </div>

        <div class="min-w-0 flex-1">
          <div class="mb-6 flex items-start justify-between gap-4">
            <h1 class="colliers-page-title">{{ t('customizeDetails') }}</h1>
            <button
              type="button"
              class="shrink-0 text-sm text-gray-500 underline-offset-2 hover:text-gray-800 hover:underline"
              @click="clearDesign"
            >
              {{ t('clearDesign') }}
            </button>
          </div>
          <form class="space-y-4" @submit.prevent="previewProof">
            <text-field
              :label="t('fullName')"
              :value="details.name"
              :maxlength="NAME_MAX"
              name="name"
              autocomplete="name"
              required
              @input="onName"
            ></text-field>
            <select-field
              :label="t('title')"
              :value="details.title"
              :options="titleOptions"
              :placeholder="t('selectTitle')"
              :error="titleFieldError"
              required
              @input="onTitle"
            ></select-field>
            <text-field
              v-if="isBilingual"
              :label="t('titleFr')"
              :value="details.titleFr"
              :error="titleFieldError"
              name="titleFr"
              autocomplete="off"
              required
              @input="onTitleFr"
            ></text-field>
            <multi-select-field
              :label="t('degree')"
              :value="details.degree"
              :options="degreeOptions"
              :locked-values="lockedDegreeValues"
              :placeholder="t('selectDegree')"
              :search-placeholder="t('selectDegree')"
              :empty-label="t('noDegrees')"
              :error="degreeSpaceNotice"
              @input="onDegrees"
              @locked="onCredentialLocked"
            ></multi-select-field>
            <text-field
              :label="t('additionalCredentials')"
              :value="details.additionalCredentials"
              :disabled="additionalCredentialsDisabled"
              :error="additionalSpaceNotice"
              @input="onAdditionalCredentials"
            ></text-field>
            <select-field
              :label="t('region')"
              :value="details.region"
              :options="regionOptions"
              :placeholder="t('selectRegion')"
              name="colliersCardRegion"
              autocomplete="address-level1"
              @input="details.region = $event"
            ></select-field>
            <text-field
              :label="t('specializedTeam')"
              :value="details.specializedTeam"
              name="colliersSpecializedTeam"
              autocomplete="organization"
              @input="details.specializedTeam = $event"
            ></text-field>
            <text-field
              :label="t('email')"
              type="email"
              :value="details.email"
              :maxlength="EMAIL_MAX"
              :error="emailFieldError"
              name="email"
              autocomplete="email"
              required
              @input="onEmail"
            ></text-field>
            <phone-field
              :label="t('mobilePhone')"
              :value="details.phone"
              required
              @input="details.phone = $event"
            ></phone-field>
            <select-field
              :label="t('officeLocation')"
              :value="details.address"
              :options="officeOptions"
              :placeholder="store.officesLoading ? t('loading') : t('selectAddress')"
              :disabled="store.officesLoading"
              required
              @input="details.address = $event"
            ></select-field>
            <text-field :label="t('website')" :value="details.website" disabled></text-field>
            <text-field :label="t('companyName')" :value="details.company" disabled></text-field>
            <app-button html-type="submit" block :disabled="!canPreviewProof">{{
              t('previewProof')
            }}</app-button>
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
import { CARD_COMPANY, emptyCard, getProduct } from '../data/products'
import { t, store, setProof, loadOffices, loadDegrees, loadTitles } from '../store'
import { cloneCardDetails } from '../helpers/cart'
import { clipEmail, clipName, emailFromFullName, EMAIL_MAX, NAME_MAX } from '../helpers/validate'
import { formatAddressCard, officeLabel } from '../adapters/api'
import { go, goBack } from '../adapters/nav'
import { viewPrintPdf } from '../helpers/printPdf'
import { loadLayoutFonts } from '../helpers/cardFonts'
import {
  LAYOUT_ERROR,
  credentialsFitOnCard,
  layoutErrorMessage,
  planProductLayout,
} from '../helpers/cardLayout'
import { isBilingualLanguage, websiteForProduct } from '../helpers/formatCardIdentity'
import { bilingualFrenchPreviewDetails, suggestFrenchTitle } from '../helpers/titleLocale'
import { titlesForProductLanguage } from '../helpers/titleAdmin'
import { CANADIAN_REGION_OPTIONS } from '../helpers/canadianProvinces'

var CREDENTIAL_SPACE_NOTICE_MS = 3000

function emptyDetails(language) {
  var card = emptyCard(language)
  return {
    name: card.name,
    title: card.title,
    titleFr: card.titleFr,
    degree: card.degree.slice(),
    additionalCredentials: card.additionalCredentials,
    region: card.region,
    specializedTeam: card.specializedTeam,
    email: card.email,
    phone: card.phone,
    company: CARD_COMPANY,
    address: card.address,
    website: card.website,
  }
}

function applyLockedBrand(details, language) {
  var next = details || {}
  next.company = CARD_COMPANY
  next.website = websiteForProduct(language)
  return next
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
      layoutStatus: 'loading',
      layoutErrorCode: '',
      productPlan: null,
      layoutFonts: null,
      details: emptyDetails('English'),
      emailEdited: false,
      credentialSpaceRejected: false,
      credentialNoticeField: '',
      credentialNoticeTimer: null,
    }
  },
  computed: {
    product: function () {
      return getProduct(this.code)
    },
    isBilingual: function () {
      return isBilingualLanguage(this.product && this.product.language)
    },
    previewSlots: function () {
      if (!this.product) return []
      var lang = this.product.language
      var pages = (this.productPlan && this.productPlan.pages) || []
      var planFor = function (language) {
        for (var i = 0; i < pages.length; i++) {
          if (pages[i].language === language) return pages[i].layout
        }
        return null
      }
      if (isBilingualLanguage(lang)) {
        return [
          { language: 'English', details: this.details, plan: planFor('English') },
          {
            language: 'French',
            details: bilingualFrenchPreviewDetails(this.details),
            plan: planFor('French'),
          },
        ]
      }
      return [{ language: lang, details: this.details, plan: planFor(lang) }]
    },
    layoutError: function () {
      if (!this.layoutErrorCode) return ''
      return layoutErrorMessage(this.layoutErrorCode, t)
    },
    emailFieldError: function () {
      if (this.layoutErrorCode !== LAYOUT_ERROR.email) return ''
      return this.layoutError
    },
    titleFieldError: function () {
      if (this.layoutErrorCode !== LAYOUT_ERROR.title) return ''
      return this.layoutError
    },
    degreeSpaceNotice: function () {
      if (!this.credentialSpaceRejected || this.credentialNoticeField !== 'degree') return ''
      return t('credentialsNoSpace')
    },
    additionalSpaceNotice: function () {
      if (!this.credentialSpaceRejected || this.credentialNoticeField !== 'additional') {
        return ''
      }
      return t('credentialsNoSpace')
    },
    layoutReady: function () {
      return this.layoutStatus === 'valid'
    },
    canPreviewProof: function () {
      var details = this.details || {}
      return (
        this.layoutReady &&
        Boolean(String(details.name || '').trim()) &&
        Boolean(String(details.title || '').trim()) &&
        (!this.isBilingual || Boolean(String(details.titleFr || '').trim())) &&
        Boolean(String(details.email || '').trim()) &&
        Boolean(String(details.phone || '').trim()) &&
        Boolean(String(details.address || '').trim())
      )
    },
    titleOptions: function () {
      var lang = (this.product && this.product.language) || 'English'
      return titlesForProductLanguage(lang, store.titles).map(function (title) {
        return { value: title, label: title }
      })
    },
    regionOptions: function () {
      return CANADIAN_REGION_OPTIONS
    },
    degreeOptions: function () {
      return (store.degrees || []).map(function (degree) {
        return { value: degree, label: degree }
      })
    },
    lockedDegreeValues: function () {
      if (!this.layoutFonts || !this.product) return []
      var self = this
      var selected = Array.isArray(this.details.degree) ? this.details.degree : []
      return (store.degrees || []).filter(function (degree) {
        if (selected.indexOf(degree) !== -1) return false
        var candidate = Object.assign({}, self.details, {
          degree: selected.concat([degree]),
        })
        return !credentialsFitOnCard(candidate, self.layoutFonts, self.product.language)
      })
    },
    additionalCredentialsDisabled: function () {
      if (!this.layoutFonts || !this.product) return false
      if (String(this.details.additionalCredentials || '').length) return false
      var candidate = Object.assign({}, this.details, { additionalCredentials: 'i' })
      return !credentialsFitOnCard(candidate, this.layoutFonts, this.product.language)
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
        this.hydrateFromStore()
        applyLockedBrand(this.details, product.language)
        this.replan()
      },
    },
    details: {
      deep: true,
      handler: function () {
        this.replan()
      },
    },
  },
  mounted: function () {
    var self = this
    this.hydrateFromStore()
    loadOffices()
    loadDegrees()
    loadTitles()
    loadLayoutFonts()
      .then(function (fonts) {
        self.layoutFonts = fonts
        self.replan()
      })
      .catch(function () {
        self.layoutStatus = 'invalid'
        self.layoutErrorCode = 'layoutErrorName'
      })
  },
  beforeDestroy: function () {
    this.clearCredentialNotice()
  },
  methods: {
    t: t,
    onTitle: function (value) {
      this.details.title = value
      this.details.titleFr = suggestFrenchTitle(value)
    },
    onTitleFr: function (value) {
      this.details.titleFr = value
    },
    fillMissingTitleFr: function () {
      if (!this.isBilingual) return
      if (String(this.details.titleFr || '').trim()) return
      this.details.titleFr = suggestFrenchTitle(this.details.title)
    },
    onName: function (value) {
      this.details.name = clipName(value)
      if (this.emailEdited) return
      this.details.email = emailFromFullName(this.details.name)
    },
    flashCredentialNotice: function (field) {
      this.credentialNoticeField = field
      this.credentialSpaceRejected = true
      if (this.credentialNoticeTimer) clearTimeout(this.credentialNoticeTimer)
      var self = this
      this.credentialNoticeTimer = setTimeout(function () {
        self.credentialSpaceRejected = false
        self.credentialNoticeField = ''
        self.credentialNoticeTimer = null
      }, CREDENTIAL_SPACE_NOTICE_MS)
    },
    clearCredentialNotice: function () {
      if (this.credentialNoticeTimer) clearTimeout(this.credentialNoticeTimer)
      this.credentialNoticeTimer = null
      this.credentialSpaceRejected = false
      this.credentialNoticeField = ''
    },
    onEmail: function (value) {
      this.details.email = clipEmail(value)
      this.emailEdited = true
    },
    onDegrees: function (degrees) {
      var next = Array.isArray(degrees) ? degrees.slice() : []
      var current = Array.isArray(this.details.degree) ? this.details.degree : []
      var isRemoval = next.length < current.length
      var candidate = Object.assign({}, this.details, { degree: next })
      var fits = this.credentialsFit(candidate)
      if (!fits && !isRemoval) {
        this.flashCredentialNotice('degree')
        return
      }
      this.details.degree = next
      this.clearCredentialNotice()
    },
    onCredentialLocked: function () {
      this.flashCredentialNotice('degree')
    },
    onAdditionalCredentials: function (value, event) {
      var current = String(this.details.additionalCredentials || '')
      var next = String(value || '')
      var candidate = Object.assign({}, this.details, { additionalCredentials: next })
      var fits = this.credentialsFit(candidate)
      var isShorter = next.length < current.length
      if (!fits && !isShorter) {
        this.flashCredentialNotice('additional')
        if (event && event.target) event.target.value = current
        return
      }
      this.details.additionalCredentials = next
      this.clearCredentialNotice()
    },
    credentialsFit: function (details) {
      if (!this.layoutFonts || !this.product) return true
      return credentialsFitOnCard(details, this.layoutFonts, this.product.language)
    },
    replan: function () {
      this.printPdfError = ''
      if (!this.layoutFonts || !this.product) {
        this.layoutStatus = 'loading'
        this.layoutErrorCode = ''
        this.productPlan = null
        return
      }
      var plan = planProductLayout(this.details, this.product.language, this.layoutFonts)
      this.productPlan = plan
      if (plan.valid) {
        this.layoutStatus = 'valid'
        this.layoutErrorCode = ''
      } else {
        this.layoutStatus = 'invalid'
        this.layoutErrorCode = plan.errors[0] || 'layoutErrorName'
      }
    },
    hydrateFromStore: function () {
      if (!this.product) return
      var language = this.product.language || 'English'
      var queryLineId = this.$route && this.$route.query && this.$route.query.lineId
      var editId = store.editLineId || (store.proof && store.proof.editLineId) || queryLineId
      var line = null
      if (editId != null && editId !== '') {
        line =
          store.cart.find(function (item) {
            return String(item.id) === String(editId)
          }) || null
        if (line) store.editLineId = line.id
      }
      if (line) {
        this.details = applyLockedBrand(
          Object.assign(emptyDetails(language), cloneCardDetails(line.details)),
          language
        )
        this.emailEdited = true
        this.fillMissingTitleFr()
        return
      }
      if (editId && !line) {
        store.editLineId = null
        if (store.proof) store.proof.editLineId = null
      }
      if (
        !queryLineId &&
        !store.editLineId &&
        store.proof &&
        store.proof.code === this.product.code
      ) {
        this.details = applyLockedBrand(
          Object.assign(emptyDetails(language), cloneCardDetails(store.proof.details)),
          language
        )
        this.emailEdited = true
        this.fillMissingTitleFr()
        return
      }
      this.details = emptyDetails(language)
      this.emailEdited = false
    },
    clearDesign: function () {
      var language = (this.product && this.product.language) || 'English'
      this.details = emptyDetails(language)
      this.emailEdited = false
      this.clearCredentialNotice()
      this.printPdfError = ''
    },
    back: function () {
      goBack()
    },
    previewProof: function () {
      if (!this.product || !this.canPreviewProof) return
      setProof({
        code: this.product.code,
        language: this.product.language,
        details: cloneCardDetails(this.details),
        editLineId: store.editLineId,
      })
      go('proof', { code: this.product.code })
    },
    openPrintPdf: function () {
      var self = this
      if (!this.product || this.printPdfBusy || !this.layoutReady) return
      this.printPdfBusy = true
      this.printPdfError = ''
      viewPrintPdf(
        Object.assign({}, this.details, {
          degree: Array.isArray(this.details.degree) ? this.details.degree.slice() : [],
        }),
        this.product.language
      )
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
