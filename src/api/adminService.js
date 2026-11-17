import initialData from '../mocks/adminData.json'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const TOKEN_KEY = 'vendix_admin_token'

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

// Stockage en mémoire pour le mode mock afin de simuler la persistance
let mockState = {
  dashboard: { ...initialData.dashboard },
  shops: [...initialData.shops],
  reports: [...initialData.reports],
}

/**
 * Réinitialise l'état mock (principalement pour les tests)
 */
export function resetMockState() {
  mockState = {
    dashboard: { ...initialData.dashboard },
    shops: [...initialData.shops],
    reports: [...initialData.reports],
  }
}

/**
 * Gestion du jeton d'authentification Super-Admin
 */
export const tokenStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  hasToken: () => Boolean(localStorage.getItem(TOKEN_KEY)),
}

/**
 * Exécute une requête HTTP avec gestion automatique du token JWT
 */
async function request(endpoint, options = {}) {
  const token = tokenStorage.getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    const error = new Error(errorBody.message || `Erreur HTTP ${response.status}`)
    error.status = response.status
    error.data = errorBody
    throw error
  }

  return response.json()
}

/**
 * Service API d'administration Vendix avec bascule mock / réel
 */
export const adminService = {
  /**
   * Connexion administrateur
   */
  async login(credentials) {
    if (USE_MOCK) {
      if (credentials.password === 'admin123' || credentials.identifier === 'admin@vendix.bj') {
        const fakeToken = 'mock_jwt_superadmin_token_xyz'
        tokenStorage.setToken(fakeToken)
        return {
          accessToken: fakeToken,
          admin: {
            id: 'admin-001',
            email: 'admin@vendix.bj',
            role: 'ADMIN',
          },
        }
      }
      const error = new Error('Identifiants administrateur incorrects')
      error.status = 401
      throw error
    }

    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })

    if (data?.accessToken) {
      tokenStorage.setToken(data.accessToken)
    }

    return data
  },

  /**
   * Déconnexion administrateur
   */
  logout() {
    tokenStorage.removeToken()
  },

  /**
   * Indicateurs consolidés du tableau de bord
   */
  async getDashboardStats() {
    if (USE_MOCK) {
      return {
        dashboard: mockState.dashboard,
        shops: mockState.shops,
        reports: mockState.reports,
      }
    }

    return request('/admin/dashboard')
  },

  /**
   * Liste des commerçants et boutiques
   */
  async getMerchants() {
    if (USE_MOCK) {
      return [...mockState.shops]
    }

    return request('/admin/merchants')
  },

  /**
   * Suspendre une boutique
   */
  async suspendMerchant(shopId, reason) {
    if (USE_MOCK) {
      mockState.shops = mockState.shops.map((shop) =>
        shop.id === Number(shopId) || shop.id === shopId
          ? { ...shop, status: 'suspended', suspensionReason: reason }
          : shop
      )
      return { success: true, shopId, status: 'suspended', reason }
    }

    return request(`/admin/merchants/${shopId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  },

  /**
   * Liste des signalements
   */
  async getReports() {
    if (USE_MOCK) {
      return [...mockState.reports]
    }

    return request('/admin/reports')
  },

  /**
   * Mettre à jour le statut d'un signalement (warning, dismissed, suspended)
   */
  async updateReportStatus(reportId, action, resolutionNote = '') {
    if (USE_MOCK) {
      mockState.reports = mockState.reports.map((report) =>
        report.id === Number(reportId) || report.id === reportId
          ? {
              ...report,
              status: action,
              resolution: resolutionNote || `Signalement traité : ${action}`,
            }
          : report
      )
      return { success: true, reportId, status: action, resolutionNote }
    }

    return request(`/admin/reports/${reportId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: action, resolution: resolutionNote }),
    })
  },
}

export default adminService
