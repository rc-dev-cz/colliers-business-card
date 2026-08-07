<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getProduct, officeAddresses, jobTitles } from '../data/products'
import { useLocale } from '../composables/useLocale'
import { useCart } from '../composables/useCart'
import ColliersPageShell from '../layout/ColliersPageShell.vue'
import CardPreview from '../components/CardPreview.vue'

const props = defineProps({
  code: { type: String, required: true },
})

const router = useRouter()
const { t } = useLocale()
const { addToCart } = useCart()
const product = computed(() => getProduct(props.code))

const NAME_MAX = 30
const EMAIL_MAX = 30

const details = reactive({
  name: '',
  title: '',
  email: '',
  phone: '',
  company: 'Colliers',
  address: '',
  website: 'colliers.com/canada',
})

const phoneLocal = ref('')

function formatCanadianLocal(digits) {
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)}-${digits.slice(6)}`
}

function onPhoneInput(event) {
  const digits = event.target.value.replace(/\D/g, '').slice(0, 10)
  phoneLocal.value = formatCanadianLocal(digits)
  details.phone = digits ? `+1 ${formatCanadianLocal(digits)}` : ''
}

function back() {
  router.back()
}

function addItemToCart() {
  if (!product.value) return
  addToCart({
    code: product.value.code,
    language: product.value.language,
    quantity: 1,
    details: { ...details },
  })
}
</script>

<template>
  <ColliersPageShell>
    <div v-if="!product" class="py-20 text-center text-gray-500">Product not found</div>
    <template v-else>
      <button type="button" class="mb-6 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900" @click="back">
        <span aria-hidden="true">‹</span> {{ t('back') }}
      </button>

      <div class="flex flex-col gap-10 lg:flex-row lg:gap-12">
        <div class="w-full lg:max-w-[480px]">
          <h2 class="mb-4 text-lg font-bold text-colliers-primary">{{ t('cardPreview') }}</h2>
          <div class="rounded-lg bg-gray-100 p-4 sm:p-6">
            <CardPreview :details="details" />
          </div>
        </div>

        <div class="min-w-0 flex-1">
          <h1 class="mb-6 text-2xl font-bold text-colliers-primary sm:text-3xl">{{ t('customizeDetails') }}</h1>
          <form class="space-y-4" @submit.prevent="addItemToCart">
            <div>
              <label class="field-label">{{ t('fullName') }}</label>
              <input
                v-model="details.name"
                type="text"
                class="field-input"
                :maxlength="NAME_MAX"
                @input="details.name = details.name.slice(0, NAME_MAX)"
              />
              <p class="field-hint">{{ details.name.length }}/{{ NAME_MAX }} — {{ t('fullNameHint') }}</p>
            </div>
            <div>
              <label class="field-label">{{ t('title') }}</label>
              <select v-model="details.title" class="field-input">
                <option disabled value="">{{ t('selectTitle') }}</option>
                <option v-for="jobTitle in jobTitles" :key="jobTitle" :value="jobTitle">
                  {{ jobTitle }}
                </option>
              </select>
            </div>
            <div>
              <label class="field-label">{{ t('email') }}</label>
              <input
                v-model="details.email"
                type="email"
                class="field-input"
                :maxlength="EMAIL_MAX"
                @input="details.email = details.email.slice(0, EMAIL_MAX)"
              />
              <p class="field-hint">{{ details.email.length }}/{{ EMAIL_MAX }} — {{ t('emailHint') }}</p>
            </div>
            <div>
              <label class="field-label">{{ t('mobilePhone') }}</label>
              <div class="flex overflow-hidden rounded border border-gray-300 focus-within:border-colliers-primary focus-within:ring-1 focus-within:ring-colliers-primary">
                <span class="flex shrink-0 items-center bg-gray-100 px-3 text-[14px] text-gray-600">+1</span>
                <input
                  :value="phoneLocal"
                  type="tel"
                  inputmode="numeric"
                  autocomplete="tel-national"
                  class="w-full border-0 px-3 py-2.5 text-[14px] focus:outline-none focus:ring-0"
                  placeholder="416 555-1234"
                  maxlength="12"
                  @input="onPhoneInput"
                />
              </div>
              <p class="field-hint">{{ t('mobilePhoneHint') }}</p>
            </div>
            <div>
              <label class="field-label">{{ t('companyName') }}</label>
              <input v-model="details.company" type="text" class="field-input" disabled />
            </div>
            <div>
              <label class="field-label">{{ t('address') }}</label>
              <select v-model="details.address" class="field-input">
                <option disabled value="">{{ t('selectAddress') }}</option>
                <option
                  v-for="office in officeAddresses"
                  :key="office.label"
                  :value="office.value"
                >
                  {{ office.label }}
                </option>
              </select>
            </div>
            <div>
              <label class="field-label">{{ t('website') }}</label>
              <input v-model="details.website" type="text" class="field-input" disabled />
            </div>
            <button type="submit" class="btn-primary w-full">{{ t('addToCart') }}</button>
          </form>
        </div>
      </div>
    </template>
  </ColliersPageShell>
</template>
