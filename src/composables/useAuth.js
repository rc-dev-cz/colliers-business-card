import { computed, ref, watch } from 'vue'
import { readStorage, writeStorage, removeStorage } from './useStorage'

const session = ref(readStorage('session', null))

watch(session, (value) => {
  if (value) writeStorage('session', value)
  else removeStorage('session')
}, { deep: true })

export function useAuth() {
  const isAuthenticated = computed(() => Boolean(session.value?.email))
  const userEmail = computed(() => session.value?.email || '')

  function login(email = 'demo') {
    session.value = { email: email || 'demo', loggedInAt: Date.now() }
  }

  function logout() {
    session.value = null
  }

  return {
    session,
    isAuthenticated,
    userEmail,
    login,
    logout,
  }
}
