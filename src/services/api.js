import axios from 'axios'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')

const isAuthEndpoint = (url = '') => {
  const normalized = String(url)
  return normalized.includes('/auth/login') || normalized.includes('/auth/register')
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// Attach JWT
api.interceptors.request.use(config => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }

  const token = localStorage.getItem('findit_token')
  const hasUsableToken = !!token && token !== 'undefined' && token !== 'null'

  // Do not send bearer token to login/register; stale tokens can trigger 403 on some backends.
  if (hasUsableToken && !isAuthEndpoint(config.url)) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (isAuthEndpoint(config.url) && config.headers?.Authorization) {
    delete config.headers.Authorization
  }

  return config
})

// Handle 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('findit_token')
      localStorage.removeItem('findit_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
