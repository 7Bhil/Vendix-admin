import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, AlertTriangle, ShieldCheck } from 'lucide-react';

const navigation = [
  { name: 'Supervision', href: '/admin', icon: LayoutDashboard },
  { name: 'Commerçants', href: '/admin/commercants', icon: Users },
  { name: 'Signalements', href: '/admin/signalements', icon: AlertTriangle },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      {/* Sidebar latérale */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block">Vendix Admin</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium">Plateforme</span>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === '/admin'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
          Console Super-Admin v2.0
        </div>
      </aside>

      {/* Zone de contenu */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 bg-slate-950/50 border-b border-slate-800 px-8 flex items-center justify-between shrink-0">
          <div className="text-xs font-medium text-slate-400">
            Espace Sécurisé Super-Administrateur
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-300">Système opérationnel</span>
          </div>
        </header>

        <div className="p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
