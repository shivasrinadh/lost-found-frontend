import api from './api'

const tryAuthEndpoints = async (endpoints, payload) => {
  let lastError

  for (const endpoint of endpoints) {
    try {
      const res = await api.post(endpoint, payload)
      return res.data
    } catch (err) {
      lastError = err
      const status = err?.response?.status

      // Retry only when endpoint likely does not exist for this backend variant.
      if (status === 404 || status === 405) {
        continue
      }

      throw err
    }
  }

  throw lastError
}

export const authService = {
  login: (data) => tryAuthEndpoints([
    '/auth/login',
    '/auth/signin',
    '/auth/authenticate',
  ], data),

  register: (data) => tryAuthEndpoints([
    '/auth/register',
    '/auth/signup',
  ], data),
}
