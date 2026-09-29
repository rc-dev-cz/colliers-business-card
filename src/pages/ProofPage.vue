<template>
  <colliers-page-shell>
    <div v-if="!product || !proof" class="py-20 text-center text-gray-500">{{ t('productNotFound') }}</div>
    <div v-else>
      <button type="button" class="mb-6 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900" @click="backToEdit">
        <span aria-hidden="true">‹</span> {{ t('back') }}
      </button>

      <div class="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
        <div class="w-full min-w-0 lg:flex-[1.35]">
          <h2 class="mb-4 text-lg font-bold text-colliers-primary">{{ t('cardPreview') }}</h2>
          <div class="space-y-5">
            <div
              v-for="preview in previewSlots"
              :key="preview.language"
              class="card-preview-frame card-preview-frame--proof"
            >
              <card-preview
                :details="preview.details"
                :language="preview.language"
                :plan="preview.plan"
                placeholders
              ></card-preview>
            </div>
          </div>
        </div>

        <div class="w-full min-w-0 lg:max-w-md lg:flex-1">
          <h1 class="colliers-page-title mb-4">{{ t('proofApproval') }}</h1>

          <div class="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
            <p class="font-semibold text-red-800">{{ t('proofNoticeLead') }}</p>
            <p class="mt-2 leading-relaxed text-amber-950">{{ t('proofNotice') }}</p>
            <label class="mt-4 flex cursor-pointer items-start gap-3 rounded border border-amber-200 bg-white px-3 py-3 text-sm text-gray-800">
              <input v-model="approved" class="mt-0.5 h-4 w-4 shrink-0" type="checkbox" />
              <span>{{ t('proofCheckbox') }}</span>
            </label>
          </div>

          <div class="space-y-3">
            <app-button variant="outline" block :disabled="!approved" @click="addItem">
              {{ t('addToCart') }}
            </app-button>
            <app-button block :disabled="!approved" @click="continueToShipping">
              {{ t('continueToShipping') }}
            </app-button>
            <app-button variant="outline" block @click="backToEdit">
              <span aria-hidden="true" class="mr-1">‹</span>{{ t('backToEdit') }}
            </app-button>
          </div>
        </div>
      </div>
    </div>
  </colliers-page-shell>
</template>

<script>
import ColliersPageShell from '../layout/ColliersPageShell.vue'
import CardPreview from '../components/CardPreview.vue'
import AppButton from '../components/AppButton.vue'
import { getProduct } from '../data/products'
import { t, store, addProofToCart, ensureProofInCart } from '../store'
import { go } from '../adapters/nav'
import { loadLayoutFonts } from '../helpers/cardFonts'
import { planProductLayout } from '../helpers/cardLayout'
import { isBilingualLanguage, WEBSITE_FR } from '../helpers/formatCardIdentity'

export default {
  name: 'ProofPage',
  components: { ColliersPageShell, CardPreview, AppButton },
  props: {
    code: { type: String, default: '' },
  },
  data: function () {
    return {
      approved: false,
      layoutFonts: null,
      productPlan: null,
    }
  },
  computed: {
    proof: function () {
      return store.proof
    },
    product: function () {
      var code = (this.proof && this.proof.code) || this.code
      return getProduct(code)
    },
    previewSlots: function () {
      if (!this.product || !this.proof) return []
      var lang = this.product.language
      var details = this.proof.details || {}
      var pages = (this.productPlan && this.productPlan.pages) || []
      var planFor = function (language) {
        for (var i = 0; i < pages.length; i++) {
          if (pages[i].language === language) return pages[i].layout
        }
        return null
      }
      if (isBilingualLanguage(lang)) {
        return [
          { language: 'English', details: details, plan: planFor('English') },
          {
            language: 'French',
            details: Object.assign({}, details, { website: WEBSITE_FR }),
            plan: planFor('French'),
          },
        ]
      }
      return [{ language: lang, details: details, plan: planFor(lang) }]
    },
  },
  watch: {
    proof: {
      immediate: true,
      handler: function (proof) {
        if (!proof || !proof.code) {
          if (this.code) go('customize', { code: this.code })
          else go('catalog')
          return
        }
        this.approved = false
        this.replan()
      },
    },
  },
  mounted: function () {
    var self = this
    loadLayoutFonts()
      .then(function (fonts) {
        self.layoutFonts = fonts
        self.replan()
      })
      .catch(function () {})
  },
  methods: {
    t: t,
    replan: function () {
      if (!this.layoutFonts || !this.product || !this.proof) {
        this.productPlan = null
        return
      }
      this.productPlan = planProductLayout(this.proof.details, this.product.language, this.layoutFonts)
    },
    addItem: function () {
      if (!this.approved) return
      addProofToCart()
    },
    continueToShipping: function () {
      if (!this.approved) return
      ensureProofInCart()
      go('shipping')
    },
    backToEdit: function () {
      var code = (this.proof && this.proof.code) || this.code
      if (code) go('customize', { code: code })
      else go('catalog')
    },
  },
}
</script>
