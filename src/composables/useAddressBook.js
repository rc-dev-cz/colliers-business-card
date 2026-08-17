import { computed, ref, watch } from 'vue'
import { readStorage, writeStorage } from './useStorage'
import { fetchOfficeAddresses, formatAddressCard, formatAddressLine, officeLabel } from '../lib/colliersApi'

const STORAGE_KEY = 'addressBook'

function createId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function emptyPersonal() {
  return {
    id: '',
    addressName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    department: '',
    addressStreet: '',
    addressStreet2: '',
    addressCity: '',
    addressProvince: '',
    addressPostalZip: '',
    addressCountry: 'Canada',
  }
}

const seedPersonal = [
  {
    id: 'seed-home',
    addressName: 'Home Office',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    department: '',
    addressStreet: '100 King Street West',
    addressStreet2: 'Suite 5600',
    addressCity: 'Toronto',
    addressProvince: 'ON',
    addressPostalZip: 'M5X 1C9',
    addressCountry: 'Canada',
  },
  {
    id: 'seed-temp',
    addressName: 'Temporary Location',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    department: '',
    addressStreet: '200 Bay Street',
    addressStreet2: '',
    addressCity: 'Toronto',
    addressProvince: 'ON',
    addressPostalZip: 'M5J 2J2',
    addressCountry: 'Canada',
  },
]

const stored = readStorage(STORAGE_KEY, null)
const personal = ref(Array.isArray(stored) ? stored : seedPersonal.map((a) => ({ ...a })))
const offices = ref([])
const officesLoading = ref(false)
const officesError = ref('')
const officesSource = ref('api')
let officesLoaded = false
let loadPromise = null

watch(
  personal,
  (value) => writeStorage(STORAGE_KEY, value),
  { deep: true },
)

export function useAddressBook() {
  const personalAddresses = computed(() => personal.value)

  async function loadOffices({ force = false } = {}) {
    if (officesLoaded && !force) return offices.value
    if (loadPromise && !force) return loadPromise

    officesLoading.value = true
    officesError.value = ''
    loadPromise = (async () => {
      try {
        const result = await fetchOfficeAddresses()
        offices.value = result.data
        officesSource.value = result.source
        officesLoaded = true
      } catch (error) {
        officesError.value = error?.message || 'Unable to load office addresses.'
        offices.value = []
        officesSource.value = 'api'
      } finally {
        officesLoading.value = false
        loadPromise = null
      }
      return offices.value
    })()

    return loadPromise
  }

  function matchesSearch(address, query) {
    const q = query.trim().toLowerCase()
    if (!q) return true
    const haystack = [
      address.addressName,
      formatAddressLine(address),
      address.addressStreet,
      address.addressStreet2,
      address.addressCity,
      address.addressProvince,
      address.addressPostalZip,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  }

  function addPersonal(fields) {
    const next = { ...emptyPersonal(), ...fields, id: createId(), addressCountry: fields.addressCountry || 'Canada' }
    personal.value = [...personal.value, next]
    return next
  }

  function updatePersonal(id, fields) {
    personal.value = personal.value.map((row) =>
      row.id === id ? { ...row, ...fields, id } : row,
    )
  }

  function deletePersonal(id) {
    personal.value = personal.value.filter((row) => row.id !== id)
  }

  function getPersonal(id) {
    return personal.value.find((row) => row.id === id) || null
  }

  return {
    personalAddresses,
    offices,
    officesLoading,
    officesError,
    officesSource,
    loadOffices,
    matchesSearch,
    emptyPersonal,
    addPersonal,
    updatePersonal,
    deletePersonal,
    getPersonal,
    formatAddressLine,
    formatAddressCard,
    officeLabel,
  }
}
