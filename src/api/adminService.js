
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const TOKEN_KEY = 'vendix_admin_token'

const adminApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

const adminService = {
  async login(credentials) {
    try {
      const response = await adminApi.post('/auth/login', {
        identifier: credentials.identifier?.trim(),
        password: credentials.password,
      })

      const data = response.data

      const token = data.access_token || data.accessToken || data.token

      if (!token) {
        throw new Error('Aucun jeton d’authentification reçu.')
      }

      localStorage.setItem(TOKEN_KEY, token)

      return data
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Échec de la connexion.'
      )
    }
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY)
  },

  isAuthenticated() {
    return Boolean(this.getToken())
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY)
  },

  api: adminApi,
}

export default adminService
