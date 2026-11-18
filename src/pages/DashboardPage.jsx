
import {
  Store,
  Users,
  ShoppingBag,
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Clock3,
  CircleAlert,
  CheckCircle2,
  Package,
  MoreHorizontal,
} from 'lucide-react'

// Données fictives pour la démonstration
const statistics = [
  {
    title: 'Commerçants',
    value: '1 248',
    evolution: '+12,8 %',
    positive: true,
    description: 'vs mois précédent',
    icon: Store,
    iconStyle: 'bg-blue-50 text-blue-600',
  },
  {
    title: 'Clients inscrits',
    value: '8 642',
    evolution: '+8,4 %',
    positive: true,
    description: 'vs mois précédent',
    icon: Users,
    iconStyle: 'bg-violet-50 text-violet-600',
  },
  {
    title: 'Commandes',
    value: '3 856',
    evolution: '+15,2 %',
    positive: true,
    description: 'vs mois précédent',
    icon: ShoppingBag,
    iconStyle: 'bg-amber-50 text-amber-600',
  },
  {
    title: "Chiffre d'affaires",
    value: '12,8 M FCFA',
    evolution: '-2,3 %',
    positive: false,
    description: 'vs mois précédent',
    icon: Wallet,
    iconStyle: 'bg-emerald-50 text-emerald-600',
  },
]

const salesData = [
  { day: 'Lun', value: 35 },
  { day: 'Mar', value: 55 },
  { day: 'Mer', value: 42 },
  { day: 'Jeu', value: 75 },
  { day: 'Ven', value: 60 },
  { day: 'Sam', value: 90 },
  { day: 'Dim', value: 68 },
]

const activities = [
  {
    title: 'Nouveau commerçant inscrit',
    detail: 'Boutique Le Progrès',
    time: 'Il y a 12 min',
    icon: Store,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    title: 'Nouvelle commande enregistrée',
    detail: 'Commande #VDX-2085',
    time: 'Il y a 35 min',
    icon: ShoppingBag,
    color: 'bg-amber-50 text-amber-600',
  },
  {
    title: 'Nouveau client inscrit',
    detail: 'Inscription sur la plateforme',
    time: 'Il y a 1 h',
    icon: Users,
    color: 'bg-violet-50 text-violet-600',
  },
  {
    title: 'Commande livrée',
    detail: 'Commande #VDX-2079',
    time: 'Il y a 2 h',
    icon: CheckCircle2,
    color: 'bg-emerald-50 text-emerald-600',
  },
]

const recentOrders = [
  {
    id: '#VDX-2085',
    customer: 'Client Démo 01',
    merchant: 'Boutique Le Progrès',
    amount: '45 000 FCFA',
    status: 'En attente',
  },
  {
    id: '#VDX-2084',
    customer: 'Client Démo 02',
    merchant: 'Marché Central',
    amount: '28 500 FCFA',
    status: 'Terminée',
  },
  {
    id: '#VDX-2083',
    customer: 'Client Démo 03',
    merchant: 'Mode & Style',
    amount: '62 000 FCFA',
    status: 'En cours',
  },
  {
    id: '#VDX-2082',
    customer: 'Client Démo 04',
    merchant: 'Boutique Étoile',
    amount: '19 000 FCFA',
    status: 'Terminée',
  },
]

function StatCard({ item }) {
  const Icon = item.icon
  const EvolutionIcon = item.positive ? TrendingUp : TrendingDown

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.iconStyle}`}>
          <Icon size={23} />
        </div>

        <button
          type="button"
          aria-label={`Options ${item.title}`}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
        >
          <MoreHorizontal size={20} />
        </button>
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">
        {item.title}
      </p>

      <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
        {item.value}
      </h3>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${
            item.positive
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-red-50 text-red-600'
          }`}
        >
          <EvolutionIcon size={13} />
          {item.evolution}
        </span>

        <span className="text-xs text-slate-400">
          {item.description}
        </span>
      </div>
    </div>
  )
}

function SalesChart() {
  const points = salesData
    .map((item, index) => `${40 + index * 75},${190 - item.value * 1.65}`)
    .join(' ')

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900">
            Évolution des ventes
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Activité commerciale des 7 derniers jours
          </p>
        </div>

        <span className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">
          Cette semaine
        </span>
      </div>

      <div className="mt-6 w-full overflow-hidden">
        <svg
          viewBox="0 0 530 230"
          className="h-auto w-full"
          role="img"
          aria-label="Graphique illustratif de l'évolution des ventes sur sept jours"
        >
          {[30, 70, 110, 150, 190].map((y) => (
            <line
              key={y}
              x1="35"
              y1={y}
              x2="500"
              y2={y}
              stroke="#e2e8f0"
              strokeDasharray="4 5"
            />
          ))}

          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
            </linearGradient>
          </defs>

          <polygon
            points={`40,190 ${points} 490,190`}
            fill="url(#salesGradient)"
          />

          <polyline
            points={points}
            fill="none"
            stroke="#0d9488"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {salesData.map((item, index) => {
            const x = 40 + index * 75
            const y = 190 - item.value * 1.65

            return (
              <g key={item.day}>
                <circle
                  cx={x}
                  cy={y}
                  r="5"
                  fill="#ffffff"
                  stroke="#0d9488"
                  strokeWidth="3"
                />
                <text
                  x={x}
                  y="218"
                  fontSize="11"
                  textAnchor="middle"
                  fill="#64748b"
                >
                  {item.day}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
        <span className="h-2.5 w-2.5 rounded-full bg-teal-600" />
        Volume des ventes (données illustratives)
      </div>
    </div>
  )
}

function ActivityPanel() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900">
            Activités récentes
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Derniers événements sur Vendix
          </p>
        </div>

        <Clock3 size={19} className="text-slate-400" />
      </div>

      <div className="mt-6 space-y-5">
        {activities.map((activity, index) => {
          const Icon = activity.icon

          return (
            <div key={index} className="flex items-start gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${activity.color}`}>
                <Icon size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  {activity.title}
                </p>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {activity.detail}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {activity.time}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function OrdersTable() {
  const statusStyles = {
    'En attente': 'bg-amber-50 text-amber-700',
    Terminée: 'bg-emerald-50 text-emerald-700',
    'En cours': 'bg-blue-50 text-blue-700',
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5 sm:p-6">
        <div>
          <h3 className="font-bold text-slate-900">
            Commandes récentes
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Aperçu des dernières transactions
          </p>
        </div>

        <span className="text-sm font-semibold text-teal-700">
          Démonstration
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-4 font-semibold">Commande</th>
              <th className="px-6 py-4 font-semibold">Client</th>
              <th className="px-6 py-4 font-semibold">Commerçant</th>
              <th className="px-6 py-4 font-semibold">Montant</th>
              <th className="px-6 py-4 font-semibold">Statut</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {recentOrders.map((order) => (
              <tr key={order.id} className="transition hover:bg-slate-50">
                <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-slate-800">
                  {order.id}
                </td>

                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                  {order.customer}
                </td>

                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                  {order.merchant}
                </td>

                <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-800">
                  {order.amount}
                </td>

                <td className="whitespace-nowrap px-6 py-4">
                  <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusStyles[order.status]}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-7">

      {/* INTRODUCTION */}
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-teal-700">
            Vue d'ensemble
          </p>

          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Bonjour, Super Admin !
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Voici un aperçu de l'activité de votre plateforme Vendix.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs text-slate-400">
            Période d'analyse
          </p>
          <p className="mt-1 text-sm font-bold text-slate-800">
            Novembre 2026
          </p>
        </div>
      </section>

      {/* STATISTIQUES */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">
            Indicateurs clés
          </h2>
          <span className="text-xs text-slate-400">
            Données fictives
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statistics.map((item) => (
            <StatCard key={item.title} item={item} />
          ))}
        </div>
      </section>

      {/* ALERTES */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <CircleAlert size={23} />
          </div>

          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">
              Signalements à traiter
            </p>
            <p className="mt-1 text-2xl font-extrabold text-amber-950">
              18
            </p>
            <p className="text-xs text-amber-700">
              Nécessitent une vérification
            </p>
          </div>

          <ArrowUpRight size={20} className="text-amber-600" />
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <Package size={23} />
          </div>

          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-900">
              Commerçants en attente
            </p>
            <p className="mt-1 text-2xl font-extrabold text-blue-950">
              24
            </p>
            <p className="text-xs text-blue-700">
              Demandes de validation
            </p>
          </div>

          <ArrowUpRight size={20} className="text-blue-600" />
        </div>
      </section>

      {/* GRAPHIQUE ET ACTIVITÉS */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SalesChart />
        </div>

        <ActivityPanel />
      </section>

      {/* TABLEAU DES COMMANDES */}
      <section>
        <OrdersTable />
      </section>

      <footer className="border-t border-slate-200 pt-5 text-center text-xs text-slate-400">
        Vendix Admin · Tableau de bord de démonstration · 2026
      </footer>
    </div>
  )
}
