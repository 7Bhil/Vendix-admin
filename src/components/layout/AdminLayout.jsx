
import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  LayoutDashboard,
  Store,
  Flag,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronRight,
  PanelLeftClose,
} from 'lucide-react'

import adminService from '../../api/adminService'

const navigation = [
  {
    name: 'Tableau de bord',
    path: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Commerçants',
    path: '/commercants',
    icon: Store,
  },
  {
    name: 'Signalements',
    path: '/signalements',
    icon: Flag,
  },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const currentPage =
    navigation.find((item) => item.path === location.pathname)?.name ||
    'Administration'

  const handleLogout = () => {
    adminService.logout()
    navigate('/login', { replace: true })
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">

      {/* Fond sombre du menu mobile */}
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-950 text-white transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500 shadow-lg shadow-teal-500/20">
              <ShieldCheck size={25} className="text-slate-950" />
            </div>

            <div>
              <h1 className="text-xl font-extrabold tracking-tight">
                Vendix<span className="text-teal-400">.</span>
              </h1>
              <p className="text-xs font-medium text-slate-400">
                Administration
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeMobileMenu}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 lg:hidden"
            aria-label="Fermer le menu"
          >
            <X size={21} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4 py-7">
          <p className="mb-4 px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
            Menu principal
          </p>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `group flex items-center justify-between rounded-xl px-4 py-3.5 transition-all duration-200 ${
                      isActive
                        ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/10'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon size={19} />
                        <span className="text-sm font-semibold">
                          {item.name}
                        </span>
                      </div>

                      {isActive && <ChevronRight size={17} />}
                    </>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Profil administrateur */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-sm font-bold text-teal-400">
              SA
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                Super Administrateur
              </p>
              <p className="text-xs text-slate-500">
                Accès administrateur
              </p>
            </div>

            <ShieldCheck size={17} className="text-teal-400" />
          </div>
        </div>
      </aside>

      {/* ZONE PRINCIPALE */}
      <div className="min-h-screen lg:pl-72">

        {/* HEADER */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur-md sm:px-7 lg:px-9">

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-100 lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu size={21} />
            </button>

            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Vendix</span>
                <ChevronRight size={13} />
                <span className="font-medium text-teal-600">
                  Administration
                </span>
              </div>

              <h2 className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">
                {currentPage}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-emerald-700">
                Mode administration
              </span>
            </div>

            <button
              type="button"
              aria-label="Notifications"
              title="Notifications"
              className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50 hover:text-teal-600"
            >
              <Bell size={19} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 sm:px-4"
            >
              <LogOut size={17} />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </header>

        {/* CONTENU DES PAGES */}
        <main className="min-h-[calc(100vh-5rem)] p-4 sm:p-7 lg:p-9">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
