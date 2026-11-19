
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

import AdminProtectedRoute from '../components/AdminProtectedRoute'
import LoginPage from './LoginPage'
import adminService from '../api/adminService'

vi.mock('../api/adminService', () => ({
  default: {
    isAuthenticated: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  },
}))

function ProtectedPage() {
  return <h1>Page protégée</h1>
}

function renderProtectedRoute(initialPath = '/commercants') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<h1>Page de connexion</h1>} />

        <Route element={<AdminProtectedRoute />}>
          <Route path="/commercants" element={<ProtectedPage />} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

function renderLoginPage(initialEntries = ['/login']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/commercants"
          element={<h1>Gestion des commerçants</h1>}
        />
        <Route path="/" element={<h1>Accueil administrateur</h1>} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Authentification administrateur', () => {
  it('redirige vers login lorsqu’un utilisateur ne possède pas de jeton', () => {
    adminService.isAuthenticated.mockReturnValue(false)

    renderProtectedRoute()

    expect(
      screen.getByRole('heading', {
        name: 'Page de connexion',
      })
    ).toBeInTheDocument()

    expect(screen.queryByText('Page protégée')).not.toBeInTheDocument()
  })

  it('autorise l’accès à une page protégée avec un jeton', () => {
    adminService.isAuthenticated.mockReturnValue(true)

    renderProtectedRoute()

    expect(
      screen.getByRole('heading', {
        name: 'Page protégée',
      })
    ).toBeInTheDocument()
  })

  it('affiche un message lorsque la connexion échoue', async () => {
    const user = userEvent.setup()

    adminService.login.mockRejectedValue(
      new Error('Identifiants incorrects.')
    )

    renderLoginPage()

    await user.type(
      screen.getByPlaceholderText('+22901XXXXXXXX'),
      '+2290190000000'
    )

    await user.type(
      screen.getByPlaceholderText('Votre mot de passe'),
      'motdepasseincorrect'
    )

    await user.click(
      screen.getByRole('button', {
        name: /connexion à la console/i,
      })
    )

    expect(
      await screen.findByText('Identifiants incorrects.')
    ).toBeInTheDocument()

    expect(adminService.login).toHaveBeenCalledWith({
      phone: '+2290190000000',
      password: 'motdepasseincorrect',
    })
  })

  it('refuse la connexion à un utilisateur qui n’est pas administrateur', async () => {
    const user = userEvent.setup()

    adminService.login.mockResolvedValue({
      user: { role: 'CLIENT' },
    })

    renderLoginPage()

    await user.type(
      screen.getByPlaceholderText('+22901XXXXXXXX'),
      '+2290190000000'
    )

    await user.type(
      screen.getByPlaceholderText('Votre mot de passe'),
      'motdepasse'
    )

    await user.click(
      screen.getByRole('button', {
        name: /connexion à la console/i,
      })
    )

    expect(
      await screen.findByText(
        "Vous n'avez pas les droits d'accès à cette console."
      )
    ).toBeInTheDocument()

    expect(adminService.logout).toHaveBeenCalled()

    expect(
      screen.queryByText('Accueil administrateur')
    ).not.toBeInTheDocument()
  })

  it('redirige vers la page initialement demandée après connexion', async () => {
    const user = userEvent.setup()

    adminService.login.mockResolvedValue({
      user: { role: 'ADMIN' },
    })

    renderLoginPage([
      {
        pathname: '/login',
        state: {
          from: {
            pathname: '/commercants',
            search: '?page=2',
            hash: '#liste',
          },
        },
      },
    ])

    await user.type(
      screen.getByPlaceholderText('+22901XXXXXXXX'),
      '+2290190000000'
    )

    await user.type(
      screen.getByPlaceholderText('Votre mot de passe'),
      'motdepasse'
    )

    await user.click(
      screen.getByRole('button', {
        name: /connexion à la console/i,
      })
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Gestion des commerçants',
      })
    ).toBeInTheDocument()

    expect(adminService.login).toHaveBeenCalledWith({
      phone: '+2290190000000',
      password: 'motdepasse',
    })
  })
})
