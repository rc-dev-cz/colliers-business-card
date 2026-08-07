import { computed, ref, watch } from 'vue'
import { readStorage, writeStorage } from './useStorage'
import { getProduct } from '../data/products'

function sameDetails(a = {}, b = {}) {
  return JSON.stringify(a) === JSON.stringify(b)
}

function consolidateCart(items = []) {
  const merged = []
  for (const item of items) {
    const match = merged.find(
      (line) => line.code === item.code && sameDetails(line.details, item.details),
    )
    if (match) {
      match.quantity += item.quantity || 1
    } else {
      merged.push({
        ...item,
        quantity: item.quantity || 1,
        details: { ...(item.details || {}) },
      })
    }
  }
  return merged
}

const cart = ref(consolidateCart(readStorage('cart', [])))
const cartOpen = ref(false)
const locationOpen = ref(false)
const locationTarget = ref(null)

watch(
  cart,
  (value) => writeStorage('cart', value),
  { deep: true },
)

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function useCart() {
  const count = computed(() => cart.value.reduce((sum, line) => sum + (line.quantity || 0), 0))
  const subtotal = computed(() =>
    cart.value.reduce((sum, line) => {
      const product = getProduct(line.code)
      const price = product?.price ?? line.price ?? 0
      return sum + price * (line.quantity || 0)
    }, 0),
  )

  function openCart() {
    cartOpen.value = true
  }

  function closeCart() {
    cartOpen.value = false
  }

  function addToCart({ code, language, quantity = 1, details = {} }) {
    const product = getProduct(code)
    if (!product) return

    const existing = cart.value.find(
      (item) => item.code === code && sameDetails(item.details, details),
    )

    if (existing) {
      existing.quantity += quantity
    } else {
      cart.value.push({
        id: uid(),
        code,
        language: language || product.language,
        quantity,
        price: product.price,
        details: { ...details },
      })
    }

    cartOpen.value = true
  }

  function updateQty(id, quantity) {
    const line = cart.value.find((item) => item.id === id)
    if (!line) return
    line.quantity = Math.max(1, Number(quantity) || 1)
  }

  function removeLine(id) {
    cart.value = cart.value.filter((item) => item.id !== id)
  }

  function clearCart() {
    cart.value = []
  }

  function openLocationPicker(target) {
    locationTarget.value = target
    locationOpen.value = true
  }

  function closeLocationPicker() {
    locationOpen.value = false
    locationTarget.value = null
  }

  return {
    cart,
    cartOpen,
    locationOpen,
    locationTarget,
    count,
    subtotal,
    openCart,
    closeCart,
    addToCart,
    updateQty,
    removeLine,
    clearCart,
    openLocationPicker,
    closeLocationPicker,
  }
}
