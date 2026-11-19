
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const TOKEN_KEY = 'vendix_admin_token'

const DEMO_PHONE = '+2290190000000'
const DEMO_PASSWORD = 'Admin123456'

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

// Intercepteur des réponses : gestion des erreurs 401 et 403
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    if (status === 401 || status === 403) {
      localStorage.removeItem(TOKEN_KEY)

      if (window.location.pathname !== '/login') {
        window.location.replace('/login')
      }
    }

    return Promise.reject(error)
  }
)

const adminService = {
  // Connexion locale pour les tests du frontend
  async login(credentials) {
    try {
      const phone = credentials.phone
        ?.trim()
        .replace(/[\s().-]/g, '')

      const password = credentials.password

      // Vérification du format international E.164 du Bénin
      const phoneRegex = /^\+22901\d{8}$/

      if (!phoneRegex.test(phone || '')) {
        throw new Error(
          'Veuillez saisir un numéro béninois au format +22901XXXXXXXX.'
        )
      }

      // Vérification des identifiants de démonstration
      if (phone !== DEMO_PHONE || password !== DEMO_PASSWORD) {
        throw new Error('Numéro de téléphone ou mot de passe incorrect.')
      }

      // Création d'un faux token pour les tests du frontend
      const token = 'vendix-demo-admin-token'

      localStorage.setItem(TOKEN_KEY, token)

      return {
        access_token: token,
        user: {
          phone: DEMO_PHONE,
          role: 'ADMIN',
        },
      }
    } catch (error) {
      throw new Error(error.message || 'Échec de la connexion.')
    }
  },

  // Récupérer le token
  getToken() {
    return localStorage.getItem(TOKEN_KEY)
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated() {
    return Boolean(this.getToken())
  },

  // Déconnexion
  logout() {
    localStorage.removeItem(TOKEN_KEY)
  },

  // Instance Axios conservée pour une future intégration backend
  api: adminApi,
}

export default adminService
