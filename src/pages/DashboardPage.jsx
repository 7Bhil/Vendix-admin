
import {
  Store,
  CircleDollarSign,
  Flag,
  Activity,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react'

import adminData from '../mocks/adminData.json'

// Formater les montants en FCFA
const formatCurrency = (amount) =>
  new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'

// Formater les dates en français
const formatDate = (date) =>
  new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))

// Correspondance entre les statuts et leur présentation
const reportStatus = {
  pending: {
    label: 'En attente',
    icon: Clock3,
    style: 'bg-amber-50 text-amber-700',
  },
  dismissed: {
    label: 'Classé',
    icon: CheckCircle2,
    style: 'bg-slate-100 text-slate-600',
  },
  warning: {
    label: 'Avertissement',
    icon: AlertTriangle,
    style: 'bg-blue-50 text-blue-700',
  },
}

function DashboardPage() {
  const { shops, reports, dashboard } = adminData

  // Calculer les statistiques à partir des données
  const totalShops = shops.length

  const activeShops = shops.filter(
    (shop) => shop.status === 'active',
  ).length

  const suspendedShops = shops.filter(
    (shop) => shop.status === 'suspended',
  ).length

  const pendingReports = reports.filter(
    (report) => report.status === 'pending',
  ).length

  // Récupérer les quatre signalements les plus récents
  const recentReports = [...reports]
    .sort(
      (a, b) =>
        new Date(b.submittedAt) - new Date(a.submittedAt),
    )
    .slice(0, 4)

  const stats = [
    {
      label: 'Boutiques enregistrées',
      value: totalShops,
      description: 'Nombre total de boutiques',
      icon: Store,
      iconStyle: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Boutiques actives',
      value: activeShops,
      description: `${suspendedShops} boutiques suspendues`,
      icon: Activity,
      iconStyle: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Volume des transactions',
      value: formatCurrency(dashboard.transactionVolumeXof),
      description: 'Volume global enregistré',
      icon: CircleDollarSign,
      iconStyle: 'bg-violet-50 text-violet-700',
    },
    {
      label: 'Signalements en attente',
      value: pendingReports,
      description: 'Demandent une vérification',
      icon: Flag,
      iconStyle: 'bg-amber-50 text-amber-700',
    },
  ]

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div>
        <p className="text-sm font-medium text-teal-700">
          Vue générale
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          Tableau de bord
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Suivez les indicateurs essentiels de la plateforme Vendix.
        </p>
      </div>

      {/* Cartes statistiques */}
      <section
        aria-label="Indicateurs de la plateforme"
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map((stat) => {
          const Icon = stat.icon

          return (
            <article
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {stat.label}
                </p>

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconStyle}`}
                >
                  <Icon size={21} />
                </div>
              </div>

              <p className="mt-5 text-2xl font-bold text-slate-900">
                {stat.value}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                {stat.description}
              </p>
            </article>
          )
        })}
      </section>

      {/* Répartition des boutiques et signalements */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-1">
          <h2 className="font-semibold text-slate-900">
            État des boutiques
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Répartition selon leur statut
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-600">Actives</span>
                <span className="font-semibold text-slate-900">
                  {activeShops}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{
                    width: `${totalShops ? (activeShops / totalShops) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-600">Suspendues</span>
                <span className="font-semibold text-slate-900">
                  {suspendedShops}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-rose-500"
                  style={{
                    width: `${totalShops ? (suspendedShops / totalShops) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">
                Signalements récents
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Dernières réclamations reçues
              </p>
            </div>

            <div className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              {pendingReports} en attente
            </div>
          </div>

          <div className="mt-5 divide-y divide-slate-100">
            {recentReports.map((report) => {
              const status = reportStatus[report.status]
              const StatusIcon = status?.icon || XCircle

              return (
                <div
                  key={report.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {report.reason}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {report.shopName} · {report.reporter}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatDate(report.submittedAt)}
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${status?.style || 'bg-slate-100 text-slate-600'}`}
                  >
                    <StatusIcon size={14} />
                    {status?.label || 'Inconnu'}
                  </span>
                </div>
              )
            })}
          </div>
        </article>
      </section>
    </div>
  )
}

export default DashboardPage
