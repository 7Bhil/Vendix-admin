
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

// Intercepteur des requêtes : ajout automatique du jeton
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Intercepteur des réponses : gestion centralisée des erreurs 401 et 403
adminApi.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status

    if (status === 401 || status === 403) {
      // Supprimer le jeton devenu invalide
      localStorage.removeItem(TOKEN_KEY)

      // Éviter une redirection inutile si l'utilisateur est déjà sur login
      if (window.location.pathname !== '/login') {
        window.location.replace('/login')
      }
    }

    return Promise.reject(error)
  }
)

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
