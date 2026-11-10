import mockData from '../mocks/adminData.json';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const USE_MOCK = import.meta.env.VITE_USE_MOCKS !== 'false';

export const adminService = {
  async getDashboard() {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 200));
      return mockData.stats;
    }
    const res = await fetch(`${API_BASE}/admin/dashboard`, { credentials: 'omit' });
    if (!res.ok) throw new Error('Impossible de charger les métriques du dashboard.');
    return res.json();
  },

  async getMerchants() {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 200));
      return mockData.merchants;
    }
    const res = await fetch(`${API_BASE}/admin/merchants`);
    if (!res.ok) throw new Error('Impossible de charger la liste des commerçants.');
    return res.json();
  },

  async suspendMerchant(id, reason) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 200));
      return { success: true, id, status: 'SUSPENDU', reason };
    }
    const res = await fetch(`${API_BASE}/admin/merchants/${id}/suspend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) throw new Error('Erreur lors de la suspension du commerçant.');
    return res.json();
  },

  async getReports() {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 200));
      return mockData.reports;
    }
    const res = await fetch(`${API_BASE}/admin/reports`);
    if (!res.ok) throw new Error('Impossible de charger les signalements.');
    return res.json();
  },

  async updateReportStatus(id, status) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 200));
      return { success: true, id, status };
    }
    const res = await fetch(`${API_BASE}/admin/reports/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Erreur lors de la mise à jour du signalement.');
    return res.json();
  },
};
