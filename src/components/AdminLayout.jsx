
import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  Store,
  Flag,
  ShieldCheck,
} from 'lucide-react'

const navigationItems = [
  {
    label: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: 'Commerçants',
    path: '/commercants',
    icon: Store,
  },
  {
    label: 'Signalements',
    path: '/signalements',
    icon: Flag,
  },
]

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      {/* Barre latérale */}
      <aside className="flex w-full flex-col bg-slate-950 text-white md:min-h-screen md:w-64 md:shrink-0">
        {/* Identité de la plateforme */}
        <div className="border-b border-slate-800 px-6 py-6">
          <h1 className="text-2xl font-bold tracking-wide">
            VENDIX
          </h1>

          <p className="mt-1 text-xs text-slate-400">
            Administration de la plateforme
          </p>

          <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-teal-700/40 bg-teal-500/10 px-3 py-2">
            <ShieldCheck size={16} className="text-teal-400" />
            <span className="text-xs font-semibold text-teal-300">
              Super-Admin
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Menu principal
          </p>

          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon

              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-teal-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`
                    }
                  >
                    <Icon size={19} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Pied de la barre latérale */}
        <div className="border-t border-slate-800 px-6 py-4">
          <p className="text-xs text-slate-500">
            Vendix Administration
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Console de supervision
          </p>
        </div>
      </aside>

      {/* Zone principale */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-5 py-4 md:px-8">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Console d'administration
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Supervision générale de Vendix
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
            Super-Admin
          </span>
        </header>

        <main className="flex-1 p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
