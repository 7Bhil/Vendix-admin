
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import adminService from './adminService'

describe('adminService', () => {
  let redirectMock

  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('vendix_admin_token', 'fake-test-token')

    redirectMock = vi.fn()

    vi.stubGlobal('window', {
      location: {
        pathname: '/',
        replace: redirectMock,
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('supprime le jeton lors de la déconnexion', () => {
    expect(adminService.getToken()).toBe('fake-test-token')

    adminService.logout()

    expect(adminService.getToken()).toBeNull()
    expect(adminService.isAuthenticated()).toBe(false)
  })

  it('supprime le jeton après une réponse API 401', async () => {
    const error = {
      response: { status: 401 },
    }

    await expect(
      adminService.api.interceptors.response.handlers[0].rejected(error)
    ).rejects.toBe(error)

    expect(adminService.getToken()).toBeNull()
    expect(redirectMock).toHaveBeenCalledWith('/login')
  })

  it('supprime le jeton et redirige vers login après une réponse API 403', async () => {
    const error = {
      response: { status: 403 },
    }

    await expect(
      adminService.api.interceptors.response.handlers[0].rejected(error)
    ).rejects.toBe(error)

    expect(adminService.getToken()).toBeNull()
    expect(redirectMock).toHaveBeenCalledWith('/login')
  })
})
