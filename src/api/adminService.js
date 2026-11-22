import axios from 'axios';
import initialData from '../mocks/adminData.json';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const TOKEN_KEY = 'vendix_admin_token';

const DEMO_PHONE = '+2290190000000';
const DEMO_PASSWORD = 'Admin123456';

export const USE_MOCK =
  import.meta.env.VITE_USE_MOCK !== 'false' &&
  import.meta.env.VITE_USE_MOCKS !== 'false';

let mockState = {
  dashboard: { ...initialData.dashboard },
  shops: [...initialData.shops],
  reports: [...initialData.reports],
};

export function resetMockState() {
  mockState = {
    dashboard: { ...initialData.dashboard },
    shops: [...initialData.shops],
    reports: [...initialData.reports],
  };
}

export const tokenStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  hasToken: () => Boolean(localStorage.getItem(TOKEN_KEY)),
};

const adminApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem(TOKEN_KEY);

      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }

    return Promise.reject(error);
  },
);

export const adminService = {
  async login(credentials, options = {}) {
    const useMock = options.useMock ?? USE_MOCK;
    const phone = credentials.phone?.trim().replace(/[\s().-]/g, '');
    const password = credentials.password;

    const phoneRegex = /^\+22901\d{8}$/;

    if (!phoneRegex.test(phone || '')) {
      throw new Error(
        'Veuillez saisir un numéro béninois au format +22901XXXXXXXX.',
      );
    }

    if (!password) {
      throw new Error('Veuillez saisir votre mot de passe.');
    }

    if (useMock) {
      if (phone !== DEMO_PHONE || password !== DEMO_PASSWORD) {
        throw new Error('Numéro de téléphone ou mot de passe incorrect.');
      }

      const token = 'vendix-demo-admin-token';
      localStorage.setItem(TOKEN_KEY, token);

      return {
        access_token: token,
        accessToken: token,
        user: {
          phone: DEMO_PHONE,
          role: 'ADMIN',
        },
      };
    }

    const { data } = await adminApi.post('/auth/login', { phone, password });
    const role = data?.user?.role ?? data?.admin?.role;

    if (role !== 'ADMIN') {
      localStorage.removeItem(TOKEN_KEY);
      throw new Error('Accès refusé : droits Super-Admin requis.');
    }

    const token = data?.access_token ?? data?.accessToken;
    if (!token) {
      throw new Error('Jeton d’authentification manquant dans la réponse.');
    }

    localStorage.setItem(TOKEN_KEY, token);
    return data;
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated() {
    return Boolean(this.getToken());
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
  },

  async getDashboardStats() {
    if (USE_MOCK) {
      return {
        ...mockState.dashboard,
        dashboard: mockState.dashboard,
        shops: mockState.shops,
        reports: mockState.reports,
      };
    }

    const { data } = await adminApi.get('/admin/dashboard');
    return data;
  },

  async getMerchants() {
    if (USE_MOCK) {
      return [...mockState.shops];
    }

    const { data } = await adminApi.get('/admin/merchants');
    return data;
  },

  async suspendMerchant(shopId, reason) {
    if (USE_MOCK) {
      mockState.shops = mockState.shops.map((shop) =>
        shop.id === Number(shopId) || shop.id === shopId
          ? { ...shop, status: 'suspended', suspensionReason: reason }
          : shop,
      );
      return { success: true, shopId, status: 'suspended', reason };
    }

    const { data } = await adminApi.post(`/admin/merchants/${shopId}/suspend`, {
      reason,
    });
    return data;
  },

  async getReports() {
    if (USE_MOCK) {
      return [...mockState.reports];
    }

    const { data } = await adminApi.get('/admin/reports');
    return data;
  },

  async updateReportStatus(reportId, status, resolution = '') {
    if (USE_MOCK) {
      mockState.reports = mockState.reports.map((report) =>
        report.id === reportId
          ? { ...report, status, resolution }
          : report,
      );
      return { success: true, reportId, status, resolution };
    }

    const { data } = await adminApi.patch(`/admin/reports/${reportId}`, {
      status,
      resolutionNote: resolution,
    });
    return data;
  },

  api: adminApi,
};

export default adminService;
