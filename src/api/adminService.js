
import mockData from '../mocks/adminData.json';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';
const TOKEN_KEY = 'vendix_admin_token';

// Récupérer le JWT Super-Admin enregistré après authentification.
const getAuthHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY);

  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};


const STORAGE_KEYS = {
  dashboard: 'vendix_admin_dashboard',
  merchants: 'vendix_admin_merchants',
  reports: 'vendix_admin_reports',
};

// Charger les données sauvegardées ou utiliser les données initiales.
const readMockData = (key, initialData) => {
  const savedData = localStorage.getItem(key);

  if (!savedData) {
    return initialData;
  }

  try {
    return JSON.parse(savedData);
  } catch {
    return initialData;
  }
};

// Sauvegarder les données mock pour les conserver après actualisation.
const saveMockData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Effectuer une requête HTTP et gérer les erreurs.
const apiRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur API (${response.status})`);
  }

  return response.json();
};

// Extraire les données du format de réponse standard.
const extractData = (response) => {
  if (response?.success === false) {
    throw new Error(response.message || 'L’opération a échoué.');
  }

  return response?.data ?? response;
};




export const adminService = {
  // Récupérer les statistiques du tableau de bord.
  async getDashboardStats() {
    if (USE_MOCKS) {
      return readMockData(
        STORAGE_KEYS.dashboard,
        mockData.dashboard,
      );
    }

    const response = await apiRequest('/admin/dashboard');
    return extractData(response);
  },

  // Récupérer la liste des commerçants.
  async getMerchants() {
    if (USE_MOCKS) {
      return readMockData(
        STORAGE_KEYS.merchants,
        mockData.shops,
      );
    }

    const response = await apiRequest('/admin/merchants');
    return extractData(response);
  },

  // Suspendre un commerçant.
  async suspendMerchant(id, reason) {
    if (USE_MOCKS) {
      const merchants = readMockData(
        STORAGE_KEYS.merchants,
        mockData.shops,
      );

      const updatedMerchants = merchants.map((merchant) =>
        merchant.id === id
          ? {
              ...merchant,
              status: 'suspended',
              suspensionReason: reason,
            }
          : merchant,
      );

      saveMockData(STORAGE_KEYS.merchants, updatedMerchants);

      return {
        success: true,
        data: updatedMerchants.find((merchant) => merchant.id === id),
      };
    }

    const response = await apiRequest(`/admin/merchants/${id}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });

    return extractData(response);
  },

  // Récupérer les signalements.
  async getReports() {
    if (USE_MOCKS) {
      return readMockData(
        STORAGE_KEYS.reports,
        mockData.reports,
      );
    }

    const response = await apiRequest('/admin/reports');
    return extractData(response);
  },

  // Mettre à jour le statut d'un signalement.
  async updateReportStatus(id, action, resolutionNote = '') {
    if (USE_MOCKS) {
      const reports = readMockData(
        STORAGE_KEYS.reports,
        mockData.reports,
      );

      const updatedReports = reports.map((report) =>
        report.id === id
          ? {
              ...report,
              status: action,
              resolution: resolutionNote,
            }
          : report,
      );

      saveMockData(STORAGE_KEYS.reports, updatedReports);

      return {
        success: true,
        data: updatedReports.find((report) => report.id === id),
      };
    }

    const response = await apiRequest(`/admin/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: action,
        resolutionNote,
      }),
    });

    return extractData(response);
  },
};
