import axios from 'axios'

// ── Axios instance pre-configured for WellFlow API ──
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

// ── Request interceptor: attach JWT token automatically ──
api.interceptors.request.use(config => {
  const token = localStorage.getItem('wf_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor: handle 401 globally ──
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('wf_user')
      localStorage.removeItem('wf_token')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export default api
