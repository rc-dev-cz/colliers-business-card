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
          <div class="colliers-split-head">
            <h2 class="text-lg font-bold text-colliers-primary">{{ t('cardPreview') }}</h2>
          </div>
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

          <p v-if="previewLayoutError" class="mt-3 text-sm text-red-600">
            {{ previewLayoutError }}
          </p>
        </div>

        <div class="min-w-0 flex-1">
          <div class="colliers-split-head">
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
            <div>
              <text-field
                :label="t('fullName')"
                :value="details.name"
                :maxlength="NAME_MAX"
                :error="nameFieldError"
                name="name"
                autocomplete="name"
                required
                @input="onName"
              ></text-field>
              <p
                v-if="nameLimitReached"
                class="mt-1 text-sm text-amber-700"
                role="status"
                aria-live="polite"
              >
                {{ nameLimitByCredentials ? t('nameNoSpaceCredentials') : t('nameNoSpace') }}
              </p>
            </div>
            <div>
              <multi-select-field
                :label="t('degree')"
                :value="details.degree"
                :options="degreeOptions"
                :locked-values="lockedDegreeValues"
                :placeholder="t('selectDegree')"
                :search-placeholder="t('selectDegree')"
                :empty-label="t('noDegrees')"
                :error="degreeSpaceNotice"
                :warning="degreeSpaceWarning"
                :locked-title="t('credentialTooLong')"
                @input="onDegrees"
                @locked="onCredentialLocked"
              ></multi-select-field>
              <button
                v-if="!showOtherCredential"
                type="button"
                class="mt-2 text-sm font-medium text-colliers-primary underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
                :disabled="additionalCredentialsDisabled"
                @click="otherCredentialOpen = true"
              >
                + {{ t('addOtherCredential') }}
              </button>
            </div>
            <text-field
              v-if="showOtherCredential"
              :label="t('additionalCredentials')"
              :value="otherCredentialDraft"
              :disabled="additionalCredentialsDisabled"
              :error="additionalSpaceNotice"
              @input="onAdditionalCredentials"
            ></text-field>
            <button
              v-if="showOtherCredential && otherCredentialRejected"
              type="button"
              class="-mt-2 text-sm font-medium text-colliers-primary underline-offset-2 hover:underline"
              @click="removeOtherCredential"
            >
              {{ t('removeOtherCredential') }}
            </button>
            <select-field
              :label="t('title')"
              :value="details.title"
              :options="titleOptions"
              :placeholder="t('selectTitle')"
              :error="titleFieldError"
              required
              @input="onTitle"
            ></select-field>
            <select-field
              v-if="isBilingual"
              :label="t('titleFr')"
              :value="details.titleFr"
              :options="titleFrOptions"
              :placeholder="t('selectTitleFr')"
              :error="titleFrFieldError"
              name="titleFr"
              required
              @input="onTitleFr"
            ></select-field>
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
              :error="teamFieldError"
              name="colliersSpecializedTeam"
              autocomplete="organization"
              @input="onSpecializedTeam"
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
              @blur="emailTouched = true"
            ></text-field>
            <phone-field
              :label="t('mobilePhone')"
              :value="details.phone"
              :hint="phoneHint"
              :error="phoneError"
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
import {
  t,
  store,
  setProof,
  loadOffices,
  loadDegrees,
  loadTitles,
  readCustomizeDraft,
  saveCustomizeDraft,
} from '../store'
import { cloneCardDetails } from '../helpers/cart'
import {
  cleanCardText,
  clipEmail,
  clipName,
  emailFromFullName,
  EMAIL_MAX,
  isCompletePhone,
  isValidEmail,
  localPhoneDigits,
  NAME_MAX,
} from '../helpers/validate'
import { formatAddressCard, officeLabel } from '../adapters/api'
import { go, goBack } from '../adapters/nav'
import { loadLayoutFonts } from '../helpers/cardFonts'
import {
  LAYOUT_ERROR,
  credentialsFitOnCard,
  layoutErrorMessage,
  emailFitsOnCard,
  nameFitsOnCard,
  planProductLayout,
  teamFitsOnCard,
} from '../helpers/cardLayout'
import {
  formatCredentialSuffix,
  isBilingualLanguage,
  websiteForProduct,
} from '../helpers/formatCardIdentity'
import {
  bilingualEnglishPreviewDetails,
  bilingualFrenchPreviewDetails,
} from '../helpers/titleLocale'
import { titlesForProductLanguage } from '../helpers/titleAdmin'
import { regionOptions } from '../helpers/canadianProvinces'

var CREDENTIAL_SPACE_NOTICE_MS = 3000
// These layout errors show under their own field; the rest show under the preview.
var FIELD_LAYOUT_ERRORS = [
  LAYOUT_ERROR.name,
  LAYOUT_ERROR.title,
  LAYOUT_ERROR.team,
  LAYOUT_ERROR.email,
]

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
      // Name kept when the last typed letter did not fit (a wide W can be refused
      // while a narrow i still fits), so the limit helper shows for it too.
      nameRefusedAt: '',
      layoutStatus: 'loading',
      layoutErrorCode: '',
      productPlan: null,
      layoutFonts: null,
      details: emptyDetails('English'),
      emailEdited: false,
      emailTouched: false,
      credentialSpaceRejected: false,
      credentialNoticeField: '',
      credentialNoticeTimer: null,
      otherCredentialOpen: false,
      // What the user typed in Other credential. It reaches the card only when it fits.
      otherCredentialDraft: '',
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
          {
            language: 'English',
            details: bilingualEnglishPreviewDetails(this.details),
            plan: planFor('English'),
          },
          {
            language: 'French',
            details: bilingualFrenchPreviewDetails(this.details),
            plan: planFor('French'),
          },
        ]
      }
      return [{ language: lang, details: this.details, plan: planFor(lang) }]
    },
    layoutErrors: function () {
      var plan = this.productPlan
      if (plan && !plan.valid) return plan.errors
      return this.layoutErrorCode ? [this.layoutErrorCode] : []
    },
    previewLayoutError: function () {
      var code = this.layoutErrors.find(function (row) {
        return FIELD_LAYOUT_ERRORS.indexOf(row) === -1
      })
      return code ? this.layoutMessage(code) : ''
    },
    emailFieldError: function () {
      if (this.hasLayoutError(LAYOUT_ERROR.email)) return this.layoutMessage(LAYOUT_ERROR.email)
      // Format is checked once the field is left, then live while it is fixed.
      var email = String(this.details.email || '').trim()
      if (this.emailTouched && email && !isValidEmail(email)) return t('emailInvalid')
      return ''
    },
    nameFieldError: function () {
      if (!this.hasLayoutError(LAYOUT_ERROR.name)) return ''
      return this.layoutMessage(LAYOUT_ERROR.name)
    },
    /**
     * Persistent helper: at 49 characters, when a typed letter was just refused for card
     * width, or earlier when even one more narrow letter will not fit.
     */
    nameLimitReached: function () {
      var name = String(this.details.name || '')
      if (!name) return false

      // Show the notice at 49, before another character is attempted.
      if (name.length >= NAME_MAX - 1) return true

      if (this.nameRefusedAt && this.nameRefusedAt === name) return true

      if (!this.layoutFonts) return false

      // Check whether even a narrow additional letter would fit.
      return !nameFitsOnCard(
        Object.assign({}, this.details, { name: name + 'i' }),
        this.layoutFonts
      )
    },
    /**
     * The name limit comes from the credentials sharing its line: without them one more
     * letter would still fit (BUG-29).
     */
    nameLimitByCredentials: function () {
      var name = String(this.details.name || '')
      if (!this.nameLimitReached || name.length >= NAME_MAX - 1 || !this.layoutFonts) return false
      if (!formatCredentialSuffix(this.details.degree, this.details.additionalCredentials)) {
        return false
      }
      return nameFitsOnCard({ name: name + 'i' }, this.layoutFonts)
    },
    teamFieldError: function () {
      if (this.credentialSpaceRejected && this.credentialNoticeField === 'team') {
        return t('teamNoSpace')
      }
      if (!this.hasLayoutError(LAYOUT_ERROR.team)) return ''
      return this.layoutMessage(LAYOUT_ERROR.team)
    },
    /** Bilingual: Title owns the English face, French title the French face. */
    titleFieldError: function () {
      var face = this.isBilingual ? 'English' : null
      if (!this.hasLayoutError(LAYOUT_ERROR.title, face)) return ''
      return this.layoutMessage(LAYOUT_ERROR.title)
    },
    titleFrFieldError: function () {
      if (!this.hasLayoutError(LAYOUT_ERROR.title, 'French')) return ''
      return this.layoutMessage(LAYOUT_ERROR.title)
    },
    /** Every credential left in the list is locked: the card is full (CU-02). */
    degreesFull: function () {
      var selected = Array.isArray(this.details.degree) ? this.details.degree : []
      var unselected = (store.degrees || []).filter(function (degree) {
        return selected.indexOf(degree) === -1
      })
      return unselected.length > 0 && this.lockedDegreeValues.length === unselected.length
    },
    /** Full: "No more space". Some options greyed out: say why they are locked (BUG-09). */
    /** Red: the card is full (or a locked option was clicked). */
    degreeSpaceNotice: function () {
      var flashed = this.credentialSpaceRejected && this.credentialNoticeField === 'degree'
      if (flashed || this.degreesFull) return t('credentialsNoSpace')
      return ''
    },
    /** Yellow: some options are greyed out, short ones still fit (BUG-09). */
    degreeSpaceWarning: function () {
      if (this.degreeSpaceNotice || !this.lockedDegreeValues.length) return ''
      return t('credentialsSomeLocked')
    },
    /** Other credential text that does not fit stays in the field only, never on the card. */
    otherCredentialRejected: function () {
      return (
        String(this.otherCredentialDraft || '') !== String(this.details.additionalCredentials || '')
      )
    },
    additionalSpaceNotice: function () {
      if (!this.otherCredentialRejected) return ''
      return t('credentialsNoSpace')
    },
    phoneHint: function () {
      return this.phoneError ? '' : t('mobilePhoneHint')
    },
    /** Partial, too long or not Canadian: say so instead of silently keeping Preview Proof off. */
    phoneError: function () {
      var digits = String((this.details && this.details.phone) || '').replace(/\D/g, '')
      if (!digits || isCompletePhone(digits)) return ''
      if (localPhoneDigits(digits).length < 10) return t('mobilePhoneIncomplete')
      return t('mobilePhoneInvalid')
    },
    layoutReady: function () {
      return this.layoutStatus === 'valid'
    },
    canPreviewProof: function () {
      var details = this.details || {}
      return (
        this.layoutReady &&
        !this.otherCredentialRejected &&
        Boolean(String(details.name || '').trim()) &&
        Boolean(String(details.title || '').trim()) &&
        (!this.isBilingual || Boolean(String(details.titleFr || '').trim())) &&
        isValidEmail(details.email) &&
        isCompletePhone(details.phone) &&
        Boolean(String(details.address || '').trim())
      )
    },
    /** "Other credential" shows once opened from the link, or when it already has text. */
    showOtherCredential: function () {
      return this.otherCredentialOpen || Boolean(String(this.otherCredentialDraft || '').trim())
    },
    titleOptions: function () {
      var lang = (this.product && this.product.language) || 'English'
      return titlesForProductLanguage(lang, store.titles, store.titlesFr).map(function (title) {
        return { value: title, label: title }
      })
    },
    /** Bilingual French title: French list, plus a saved value that is not on it. */
    titleFrOptions: function () {
      var titles = titlesForProductLanguage('French', store.titles, store.titlesFr)
      var current = String(this.details.titleFr || '').trim()
      if (current && titles.indexOf(current) === -1) titles = [current].concat(titles)
      return titles.map(function (title) {
        return { value: title, label: title }
      })
    },
    /** Region names in the card's language (what prints), not the site's. */
    regionOptions: function () {
      return regionOptions(this.product && this.product.language)
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
    /**
     * Link and empty field are off while "No more space" shows, or when not even one letter
     * fits. A field that already has text stays editable so it can be shortened or cleared.
     */
    additionalCredentialsDisabled: function () {
      if (String(this.otherCredentialDraft || '').length) return false
      if (this.degreeSpaceNotice) return true
      if (!this.layoutFonts || !this.product) return false
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
        this.commitOtherCredentialDraft()
        this.replan()
        this.saveDraft()
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
    },
    onTitleFr: function (value) {
      this.details.titleFr = cleanCardText(value)
    },
    onName: function (value, event) {
      var current = String(this.details.name || '')
      var next = clipName(value)
      var fonts = this.layoutFonts
      var details = this.details
      var fits = function (name) {
        return nameFitsOnCard(Object.assign({}, details, { name: name }), fonts)
      }
      if (!fits(next) && next.length >= current.length) {
        // Typing or pasting past the room left for name + credentials: keep what fits.
        // The persistent name-limit helper explains why further characters do not stick.
        while (next.length > current.length && !fits(next)) next = next.slice(0, -1)
        if (event && event.target) event.target.value = next
        this.nameRefusedAt = next
      }
      this.details.name = next
      if (this.emailEdited) return
      // The suggested email is shortened to fit its card line, so a long name never
      // leaves an email the card cannot print.
      this.details.email = emailFromFullName(next, function (email) {
        return emailFitsOnCard(email, fonts)
      })
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
    /**
     * Other credential is refused whole: text that does not fit stays in the field with the
     * no-space message, and the card shows none of it (no "MB" from "MBA").
     */
    onAdditionalCredentials: function (value) {
      var next = cleanCardText(value)
      this.otherCredentialDraft = next
      var candidate = Object.assign({}, this.details, { additionalCredentials: next })
      this.details.additionalCredentials = this.credentialsFit(candidate) ? next : ''
    },
    /** Drop a refused Other credential in one click, so Preview Proof comes back on. */
    removeOtherCredential: function () {
      this.otherCredentialDraft = ''
      this.details.additionalCredentials = ''
      this.otherCredentialOpen = false
    },
    /** A draft that did not fit goes on the card once something else frees the room. */
    commitOtherCredentialDraft: function () {
      if (!this.otherCredentialRejected) return
      var draft = this.otherCredentialDraft
      if (this.credentialsFit(Object.assign({}, this.details, { additionalCredentials: draft }))) {
        this.details.additionalCredentials = draft
      }
    },
    hasLayoutError: function (code, language) {
      var plan = this.productPlan
      if (!language || !plan || !plan.pages) return this.layoutErrors.indexOf(code) !== -1
      return plan.pages.some(function (page) {
        return page.language === language && page.layout.errors.indexOf(code) !== -1
      })
    },
    /** No region chosen: the title alone is too long, so the message leaves region out. */
    layoutMessage: function (code) {
      if (code === LAYOUT_ERROR.title && !String(this.details.region || '').trim()) {
        return t('layoutErrorTitleOnly')
      }
      return layoutErrorMessage(code, t)
    },
    onSpecializedTeam: function (value, event) {
      var current = String(this.details.specializedTeam || '')
      var next = cleanCardText(value)
      var fonts = this.layoutFonts
      var fits = function (text) {
        return teamFitsOnCard({ specializedTeam: text }, fonts)
      }
      if (!fits(next) && next.length >= current.length) {
        // Typing or pasting past the line: keep what still fits, like the other capped fields.
        while (next.length > current.length && !fits(next)) next = next.slice(0, -1)
        this.flashCredentialNotice('team')
        if (event && event.target) event.target.value = next
        this.details.specializedTeam = next
        return
      }
      this.details.specializedTeam = next
      if (this.credentialNoticeField === 'team') this.clearCredentialNotice()
    },
    credentialsFit: function (details) {
      if (!this.layoutFonts || !this.product) return true
      return credentialsFitOnCard(details, this.layoutFonts, this.product.language)
    },
    replan: function () {
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
      var proof = store.proof && store.proof.code === this.product.code ? store.proof : null
      // Back from a proof already in the cart edits that line instead of adding another
      var editId =
        store.editLineId ||
        (store.proof && store.proof.editLineId) ||
        queryLineId ||
        (proof && proof.cartLineId)
      var line = null
      if (editId != null && editId !== '') {
        line =
          store.cart.find(function (item) {
            return String(item.id) === String(editId)
          }) || null
        if (line) store.editLineId = line.id
      }
      // A draft for this card (typed before a refresh) wins over the cart line / proof copy.
      var draft = readCustomizeDraft(this.product.code, line ? line.id : null)
      if (draft) {
        this.setDetails(
          applyLockedBrand(
            Object.assign(emptyDetails(language), cloneCardDetails(draft.details)),
            language
          )
        )
        this.emailEdited = draft.emailEdited
        this.emailTouched = draft.emailEdited
        return
      }
      if (line) {
        this.setDetails(
          applyLockedBrand(
            Object.assign(emptyDetails(language), cloneCardDetails(line.details)),
            language
          )
        )
        this.emailEdited = true
        this.emailTouched = true
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
        this.setDetails(
          applyLockedBrand(
            Object.assign(emptyDetails(language), cloneCardDetails(store.proof.details)),
            language
          )
        )
        this.emailEdited = true
        this.emailTouched = true
        return
      }
      this.setDetails(emptyDetails(language))
      this.emailEdited = false
      this.emailTouched = false
    },
    /** Save the form as it is typed, so a refresh keeps it (Vue's twin of Klai app.proof). */
    saveDraft: function () {
      if (!this.product) return
      saveCustomizeDraft({
        code: this.product.code,
        lineId: store.editLineId,
        details: this.details,
        emailEdited: this.emailEdited,
      })
    },
    /** Loads card details and the Other credential field together. */
    setDetails: function (details) {
      this.details = details
      this.otherCredentialDraft = String(details.additionalCredentials || '')
    },
    clearDesign: function () {
      var language = (this.product && this.product.language) || 'English'
      this.setDetails(emptyDetails(language))
      this.emailEdited = false
      this.emailTouched = false
      this.otherCredentialOpen = false
      this.clearCredentialNotice()
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
  },
}
</script>
