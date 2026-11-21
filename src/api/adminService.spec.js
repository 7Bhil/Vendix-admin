import { describe, it, expect, beforeEach } from 'vitest'
import { adminService, tokenStorage, resetMockState } from './adminService'

describe('adminService (Mode Mock)', () => {
  beforeEach(() => {
    resetMockState()
    tokenStorage.removeToken()
  })

  it('gère la connexion et le stockage du token en mode mock', async () => {
    expect(tokenStorage.hasToken()).toBe(false)

    const res = await adminService.login({
      identifier: 'admin@vendix.bj',
      password: 'admin123',
    })

    expect(res.accessToken).toBeDefined()
    expect(tokenStorage.hasToken()).toBe(true)
    expect(tokenStorage.getToken()).toBe(res.accessToken)

    adminService.logout()
    expect(tokenStorage.hasToken()).toBe(false)
  })

  it('rejette la connexion avec de mauvais identifiants', async () => {
    await expect(
      adminService.login({
        identifier: 'inconnu@test.com',
        password: 'wrong',
      })
    ).rejects.toThrow('Identifiants administrateur incorrects')
  })

  it('récupère les statistiques et données du tableau de bord', async () => {
    const data = await adminService.getDashboardStats()
    expect(data.shops).toBeInstanceOf(Array)
    expect(data.shops.length).toBeGreaterThan(0)
    expect(data.reports).toBeInstanceOf(Array)
  })

  it('suspend un commerçant et persiste le changement en mémoire', async () => {
    const shopsBefore = await adminService.getMerchants()
    const targetShop = shopsBefore[0]

    await adminService.suspendMerchant(targetShop.id, 'Non-respect des règles Vendix')

    const shopsAfter = await adminService.getMerchants()
    const updated = shopsAfter.find((s) => s.id === targetShop.id)

    expect(updated.status).toBe('suspended')
    expect(updated.suspensionReason).toBe('Non-respect des règles Vendix')
  })

  it('met à jour la décision sur un signalement', async () => {
    const reportsBefore = await adminService.getReports()
    const targetReport = reportsBefore[0]

    await adminService.updateReportStatus(targetReport.id, 'dismissed', 'Sans fondement')

    const reportsAfter = await adminService.getReports()
    const updated = reportsAfter.find((r) => r.id === targetReport.id)

    expect(updated.status).toBe('dismissed')
    expect(updated.resolution).toBe('Sans fondement')
  })
})
