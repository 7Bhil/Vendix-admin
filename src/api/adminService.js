import initialData from '../mocks/adminData.json';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const TOKEN_KEY = 'vendix_admin_token';

export const USE_MOCK =
  import.meta.env.VITE_USE_MOCK !== 'false' &&
  import.meta.env.VITE_USE_MOCKS !== 'false';

let mockState = {
  dashboard: { ...initialData.dashboard },
  shops: [...initialData.shops],
  reports: [...initialData.reports],
};

/**
 * Réinitialise l'état mock (principalement pour les tests)
 */
export function resetMockState() {
  mockState = {
    dashboard: { ...initialData.dashboard },
    shops: [...initialData.shops],
    reports: [...initialData.reports],
  };
}

/**
 * Gestion du jeton d'authentification Super-Admin
 */
export const tokenStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  hasToken: () => Boolean(localStorage.getItem(TOKEN_KEY)),
};

/**
 * Exécute une requête HTTP avec gestion automatique du token JWT
 */
async function request(endpoint, options = {}) {
  const token = tokenStorage.getToken();
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const error = new Error(errorBody.message || `Erreur HTTP ${response.status}`);
    error.status = response.status;
    error.data = errorBody;
    throw error;
  }

  const payload = await response.json();
  if (payload?.success === false) {
    throw new Error(payload.message || 'L’opération a échoué.');
  }

  return payload?.data ?? payload;
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
        const fakeToken = 'mock_jwt_superadmin_token_xyz';
        tokenStorage.setToken(fakeToken);
        return {
          accessToken: fakeToken,
          admin: {
            id: 'admin-001',
            email: 'admin@vendix.bj',
            role: 'ADMIN',
          },
        };
      }
      const error = new Error('Identifiants administrateur incorrects');
      error.status = 401;
      throw error;
    }

    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (data?.accessToken) {
      tokenStorage.setToken(data.accessToken);
    }

    return data;
  },

  /**
   * Déconnexion administrateur
   */
  logout() {
    tokenStorage.removeToken();
  },

  /**
   * Indicateurs consolidés du tableau de bord
   */
  async getDashboardStats() {
    if (USE_MOCK) {
      return {
        ...mockState.dashboard,
        dashboard: mockState.dashboard,
        shops: mockState.shops,
        reports: mockState.reports,
      };
    }

    return request('/admin/dashboard');
  },

  /**
   * Liste des commerçants et boutiques
   */
  async getMerchants() {
    if (USE_MOCK) {
      return [...mockState.shops];
    }

    return request('/admin/merchants');
  },

  /**
   * Suspendre une boutique
   */
  async suspendMerchant(shopId, reason) {
    if (USE_MOCK) {
      mockState.shops = mockState.shops.map((shop) =>
        shop.id === Number(shopId) || shop.id === shopId
          ? { ...shop, status: 'suspended', suspensionReason: reason }
          : shop,
      );
      return {
        success: true,
        shopId,
        status: 'suspended',
        reason,
        data: mockState.shops.find((s) => s.id === Number(shopId) || s.id === shopId),
      };
    }

    return request(`/admin/merchants/${shopId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  /**
   * Liste des signalements
   */
  async getReports() {
    if (USE_MOCK) {
      return [...mockState.reports];
    }

    return request('/admin/reports');
  },

  /**
   * Mettre à jour le statut d'un signalement
   */
  async updateReportStatus(reportId, status, resolution = '') {
    if (USE_MOCK) {
      mockState.reports = mockState.reports.map((report) =>
        report.id === reportId
          ? { ...report, status, resolution }
          : report,
      );
      return {
        success: true,
        reportId,
        status,
        resolution,
        data: mockState.reports.find((r) => r.id === reportId),
      };
    }

    return request(`/admin/reports/${reportId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, resolutionNote: resolution }),
    });
  },
};
