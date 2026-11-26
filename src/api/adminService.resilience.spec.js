import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { adminService, resetMockState, tokenStorage } from './adminService';

describe('adminService — Sécurité, contrôle de rôle et intégrité de l audit', () => {
  beforeEach(() => {
    localStorage.clear();
    resetMockState();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Validation des identifiants et sécurité du login', () => {
    it('normalise les séparateurs du numéro béninois et refuse les formats invalides', async () => {
      await expect(
        adminService.login({ phone: '+33612345678', password: 'Admin123456' }, { useMock: true }),
      ).rejects.toThrow('+22901XXXXXXXX');

      await expect(
        adminService.login({ phone: '+2290190000000', password: '' }, { useMock: true }),
      ).rejects.toThrow('mot de passe');

      const result = await adminService.login(
        { phone: ' +229 01-90.00(00)00 ', password: 'Admin123456' },
        { useMock: true },
      );

      expect(result.user.role).toBe('ADMIN');
      expect(tokenStorage.hasToken()).toBe(true);
    });

    it('bloque toute tentative d escalade de privilège en mode API si le rôle n est pas ADMIN', async () => {
      tokenStorage.setToken('stale-token');
      vi.spyOn(adminService.api, 'post').mockResolvedValue({
        data: {
          access_token: 'merchant-jwt',
          user: { phone: '+2290190000000', role: 'MERCHANT' },
        },
      });

      await expect(
        adminService.login(
          { phone: '+2290190000000', password: 'ValidPassword1!' },
          { useMock: false },
        ),
      ).rejects.toThrow('droits Super-Admin requis');

      expect(tokenStorage.getToken()).toBeNull();
    });

    it('rejette une réponse API ADMIN sans jeton d authentification', async () => {
      vi.spyOn(adminService.api, 'post').mockResolvedValue({
        data: {
          user: { phone: '+2290190000000', role: 'ADMIN' },
        },
      });

      await expect(
        adminService.login(
          { phone: '+2290190000000', password: 'ValidPassword1!' },
          { useMock: false },
        ),
      ).rejects.toThrow('Jeton d’authentification manquant');
    });
  });

  describe('Traçabilité automatique et filtrage avancé des logs d audit', () => {
    it('journalise automatiquement les suspensions et les traitements de signalements', async () => {
      const initialLogs = await adminService.getAuditLogs();

      await adminService.suspendMerchant(1, 'Fraude confirmée sur paiement');
      await adminService.updateReportStatus('REP-001', 'dismissed', 'Preuves insuffisantes');
      await adminService.updateReportStatus('REP-002', 'warning', 'Premier rappel');

      const updatedLogs = await adminService.getAuditLogs();
      expect(updatedLogs.length).toBe(initialLogs.length + 3);

      const recentActions = updatedLogs.slice(0, 3).map((entry) => entry.action);
      expect(recentActions).toContain('SUSPEND_MERCHANT');
      expect(recentActions).toContain('REPORT_DISMISSED');
      expect(recentActions).toContain('REPORT_WARNING');
    });

    it('filtre correctement par action, recherche insensible à la casse et plage de dates', async () => {
      await adminService.suspendMerchant(2, 'Motif-Unique-XYZ');

      const byActionAndSearch = await adminService.getAuditLogs({
        action: 'SUSPEND_MERCHANT',
        search: 'motif-unique-xyz',
      });
      expect(byActionAndSearch).toHaveLength(1);
      expect(byActionAndSearch[0].reason).toBe('Motif-Unique-XYZ');

      const futureOnly = await adminService.getAuditLogs({
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
      expect(futureOnly).toHaveLength(0);

      // Une date invalide ne doit pas faire planter le filtrage
      const withInvalidDate = await adminService.getAuditLogs({
        startDate: 'date-invalide',
        endDate: 'autre-date-invalide',
      });
      expect(withInvalidDate.length).toBeGreaterThan(0);

      // Vérification du tri chronologique décroissant
      for (let i = 1; i < withInvalidDate.length; i += 1) {
        const prev = new Date(withInvalidDate[i - 1].timestamp).getTime();
        const curr = new Date(withInvalidDate[i].timestamp).getTime();
        expect(prev).toBeGreaterThanOrEqual(curr);
      }
    });
  });
});
