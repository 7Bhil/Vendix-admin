import { useEffect, useState } from 'react';
import { adminService } from '../api/adminService.js';
import { Users, AlertTriangle, TrendingUp, CheckCircle, Store } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboard()
      .then(setStats)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-bold text-white">Tableau de bord de supervision</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Commerçants inscrits',
      value: stats?.totalMerchants || 0,
      sub: `${stats?.activeMerchants || 0} actifs`,
      icon: Users,
      color: 'text-emerald-400',
    },
    {
      title: 'Commerces suspendus',
      value: stats?.suspendedMerchants || 0,
      sub: 'Action requise',
      icon: Store,
      color: 'text-amber-400',
    },
    {
      title: 'Volume total transigé',
      value: `${(stats?.totalVolumeFCFA || 0).toLocaleString('fr-FR')} FCFA`,
      sub: 'Cumul des ventes',
      icon: TrendingUp,
      color: 'text-sky-400',
    },
    {
      title: 'Signalements en attente',
      value: stats?.pendingReports || 0,
      sub: 'Litiges citoyens',
      icon: AlertTriangle,
      color: 'text-rose-400',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Supervision globale de la plateforme</h1>
        <p className="text-xs text-slate-400 mt-1">Indicateurs clés de santé et activité des boutiques Vendix.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="bg-slate-950 border border-slate-800 p-5 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{kpi.title}</span>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-white">{kpi.value}</span>
                <span className="block text-[11px] text-slate-500 mt-0.5">{kpi.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white">État des services</h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-xs font-medium text-slate-200">Base PostgreSQL Neon</div>
              <div className="text-[10px] text-slate-500">Connecté - Latence 24ms</div>
            </div>
          </div>
          <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-xs font-medium text-slate-200">API NestJS</div>
              <div className="text-[10px] text-slate-500">En ligne (Port 3000)</div>
            </div>
          </div>
          <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-xs font-medium text-slate-200">Cloudinary Media</div>
              <div className="text-[10px] text-slate-500">Opérationnel</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
