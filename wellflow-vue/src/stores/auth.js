import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/composables/useApi'

export const useAuthStore = defineStore('auth', () => {
  // ── State ──────────────────────────────────────
  const user  = ref(JSON.parse(localStorage.getItem('wf_user')) || null)
  const token = ref(localStorage.getItem('wf_token') || null)

  // ── Getters ────────────────────────────────────
  const isLoggedIn = computed(() => !!token.value)
  const username   = computed(() => user.value?.username || '')
  const initial    = computed(() => username.value.charAt(0).toUpperCase())

  // ── Actions ────────────────────────────────────
  async function login(email, password) {
    try {
      const { data } = await api.post('/auth/login', { email, password })
      saveSession(data.user, data.token)
      return data
    } catch (error) {
      clearSession()
      throw error
    }
  }

  async function register(username, email, password) {
    try {
      const { data } = await api.post('/auth/register', { username, email, password })
      // Auto-login after successful registration
      const loginResponse = await api.post('/auth/login', { email, password })
      saveSession(loginResponse.data.user, loginResponse.data.token)
      return loginResponse.data
    } catch (error) {
      clearSession()
      throw error
    }
  }

  async function logout() {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearSession()
    }
  }

  // ── Helpers ────────────────────────────────────
  function saveSession(u, t) {
    user.value  = u
    token.value = t
    localStorage.setItem('wf_user',  JSON.stringify(u))
    localStorage.setItem('wf_token', t)
  }

  function clearSession() {
    user.value  = null
    token.value = null
    localStorage.removeItem('wf_user')
    localStorage.removeItem('wf_token')
  }

  return { user, token, isLoggedIn, username, initial, login, register, logout }
})
