import axios from 'axios';
import initialData from '../mocks/adminData.json';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const TOKEN_KEY = 'vendix_admin_token';

const DEMO_PHONE = '+2290190000000';
const DEMO_PASSWORD = 'Admin123456';

export const USE_MOCK =
  import.meta.env.VITE_USE_MOCK !== 'false' &&
  import.meta.env.VITE_USE_MOCKS !== 'false';

const DEFAULT_AUDIT_LOGS = [
  {
    id: 'audit-uuid-001',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    adminId: 'admin-001',
    adminName: 'Bhilal C.',
    action: 'SUSPEND_MERCHANT',
    targetType: 'SHOP',
    targetId: 3,
    targetName: 'Mode Élégance',
    reason: 'Suspicion de fraude répétée sur les commandes WhatsApp',
    ipAddress: '197.234.221.10',
  },
  {
    id: 'audit-uuid-002',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    adminId: 'admin-001',
    adminName: 'Bhilal C.',
    action: 'REPORT_WARNING',
    targetType: 'REPORT',
    targetId: 'REP-102',
    targetName: 'Boutique Dantokpa Plus',
    reason: 'Avertissement envoyé suite au retard de livraison signalé',
    ipAddress: '197.234.221.10',
  },
  {
    id: 'audit-uuid-003',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    adminId: 'admin-002',
    adminName: 'Modérateur Cotonou',
    action: 'REPORT_DISMISSED',
    targetType: 'REPORT',
    targetId: 'REP-099',
    targetName: 'Épicerie du Port',
    reason: 'Signalement classé sans suite après vérification des preuves',
    ipAddress: '197.234.221.45',
  },
];

let mockState = {
  dashboard: { ...initialData.dashboard },
  shops: [...initialData.shops],
  reports: [...initialData.reports],
  auditLogs: [...(initialData.auditLogs || DEFAULT_AUDIT_LOGS)],
};

export function resetMockState() {
  mockState = {
    dashboard: { ...initialData.dashboard },
    shops: [...initialData.shops],
    reports: [...initialData.reports],
    auditLogs: [...(initialData.auditLogs || DEFAULT_AUDIT_LOGS)],
  };
}

function appendMockAuditLog({ action, targetType, targetId, targetName, reason }) {
  mockState.auditLogs = [
    {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      adminId: 'admin-001',
      adminName: 'Super-Admin',
      action,
      targetType,
      targetId,
      targetName: String(targetName ?? targetId),
      reason: reason || 'Action administrative enregistrée',
      ipAddress: '127.0.0.1',
    },
    ...mockState.auditLogs,
  ];
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
      const targetShop = mockState.shops.find(
        (shop) => shop.id === Number(shopId) || shop.id === shopId,
      );
      mockState.shops = mockState.shops.map((shop) =>
        shop.id === Number(shopId) || shop.id === shopId
          ? { ...shop, status: 'suspended', suspensionReason: reason }
          : shop,
      );
      appendMockAuditLog({
        action: 'SUSPEND_MERCHANT',
        targetType: 'SHOP',
        targetId: shopId,
        targetName: targetShop?.name || `Boutique #${shopId}`,
        reason,
      });
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
      const targetReport = mockState.reports.find((r) => r.id === reportId);
      mockState.reports = mockState.reports.map((report) =>
        report.id === reportId
          ? { ...report, status, resolution }
          : report,
      );
      const auditAction =
        status === 'dismissed'
          ? 'REPORT_DISMISSED'
          : status === 'suspended'
            ? 'SUSPEND_MERCHANT'
            : 'REPORT_WARNING';
      appendMockAuditLog({
        action: auditAction,
        targetType: 'REPORT',
        targetId: reportId,
        targetName: targetReport?.shopName || `Signalement ${reportId}`,
        reason: resolution || `Statut mis à jour : ${status}`,
      });
      return { success: true, reportId, status, resolution };
    }

    const { data } = await adminApi.patch(`/admin/reports/${reportId}`, {
      status,
      resolutionNote: resolution,
    });
    return data;
  },

  async getAuditLogs(filters = {}) {
    if (USE_MOCK) {
      let logs = [...mockState.auditLogs];

      if (filters.action && filters.action !== 'ALL') {
        logs = logs.filter((log) => log.action === filters.action);
      }

      if (filters.search?.trim()) {
        const term = filters.search.trim().toLowerCase();
        logs = logs.filter(
          (log) =>
            log.targetName?.toLowerCase().includes(term) ||
            log.adminName?.toLowerCase().includes(term) ||
            log.reason?.toLowerCase().includes(term),
        );
      }

      if (filters.startDate) {
        const start = new Date(filters.startDate).getTime();
        if (!Number.isNaN(start)) {
          logs = logs.filter((log) => new Date(log.timestamp).getTime() >= start);
        }
      }

      if (filters.endDate) {
        const end = new Date(filters.endDate).getTime();
        if (!Number.isNaN(end)) {
          logs = logs.filter((log) => new Date(log.timestamp).getTime() <= end);
        }
      }

      return logs.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
    }

    const params = {};
    if (filters.action && filters.action !== 'ALL') params.action = filters.action;
    if (filters.search?.trim()) params.search = filters.search.trim();
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;

    const { data } = await adminApi.get('/admin/audit-logs', { params });
    return data;
  },

  api: adminApi,
};

export default adminService;
