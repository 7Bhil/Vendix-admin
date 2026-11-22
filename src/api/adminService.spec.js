import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import adminService, { resetMockState } from './adminService';

describe('adminService', () => {
  let redirectMock;

  beforeEach(() => {
    resetMockState();
    localStorage.clear();
    localStorage.setItem('vendix_admin_token', 'fake-test-token');

    redirectMock = vi.fn();

    vi.stubGlobal('window', {
      location: {
        pathname: '/',
        replace: redirectMock,
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('supprime le jeton lors de la déconnexion', () => {
    expect(adminService.getToken()).toBe('fake-test-token');

    adminService.logout();

    expect(adminService.getToken()).toBeNull();
    expect(adminService.isAuthenticated()).toBe(false);
  });

  it('supprime le jeton et redirige après une réponse API 401', async () => {
    const error = {
      response: { status: 401 },
    };

    await expect(
      adminService.api.interceptors.response.handlers[0].rejected(error),
    ).rejects.toBe(error);

    expect(adminService.getToken()).toBeNull();
    expect(redirectMock).toHaveBeenCalledWith('/login');
  });

  it('supprime le jeton et redirige après une réponse API 403', async () => {
    const error = {
      response: { status: 403 },
    };

    await expect(
      adminService.api.interceptors.response.handlers[0].rejected(error),
    ).rejects.toBe(error);

    expect(adminService.getToken()).toBeNull();
    expect(redirectMock).toHaveBeenCalledWith('/login');
  });

  it('ne redirige pas si l’utilisateur est déjà sur la page login', async () => {
    window.location.pathname = '/login';

    const error = {
      response: { status: 401 },
    };

    await expect(
      adminService.api.interceptors.response.handlers[0].rejected(error),
    ).rejects.toBe(error);

    expect(adminService.getToken()).toBeNull();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('envoie { phone, password } à POST /auth/login en mode réel et stocke le jeton pour ADMIN', async () => {
    localStorage.clear();
    const postSpy = vi.spyOn(adminService.api, 'post').mockResolvedValueOnce({
      data: {
        access_token: 'real-jwt-admin',
        user: { id: 'u-1', phone: '+2290190000000', role: 'ADMIN' },
      },
    });

    const result = await adminService.login(
      { phone: '+229 01 90 00 00 00', password: 'SecretPassword123' },
      { useMock: false },
    );

    expect(postSpy).toHaveBeenCalledWith('/auth/login', {
      phone: '+2290190000000',
      password: 'SecretPassword123',
    });
    expect(result.access_token).toBe('real-jwt-admin');
    expect(adminService.getToken()).toBe('real-jwt-admin');
  });

  it('refuse tout utilisateur dont le rôle n’est pas strictement ADMIN', async () => {
    localStorage.clear();
    vi.spyOn(adminService.api, 'post').mockResolvedValueOnce({
      data: {
        access_token: 'merchant-jwt',
        user: { id: 'u-2', phone: '+2290197001122', role: 'MERCHANT' },
      },
    });

    await expect(
      adminService.login(
        { phone: '+2290197001122', password: 'SecretPassword123' },
        { useMock: false },
      ),
    ).rejects.toThrow('Accès refusé : droits Super-Admin requis.');

    expect(adminService.getToken()).toBeNull();
  });

  it('récupère les statistiques et persiste les actions en mode mock', async () => {
    const stats = await adminService.getDashboardStats();
    expect(stats.shops).toBeInstanceOf(Array);
    expect(stats.reports).toBeInstanceOf(Array);

    const targetShop = stats.shops[0];
    await adminService.suspendMerchant(targetShop.id, 'Non-respect des règles');
    const shopsAfter = await adminService.getMerchants();
    expect(shopsAfter.find((s) => s.id === targetShop.id).status).toBe('suspended');

    const auditLogs = await adminService.getAuditLogs({ action: 'SUSPEND_MERCHANT' });
    expect(auditLogs[0].action).toBe('SUSPEND_MERCHANT');
    expect(auditLogs[0].reason).toBe('Non-respect des règles');
  });
});
