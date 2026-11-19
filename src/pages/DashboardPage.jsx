
import {
  Store,
  Wallet,
  Flag,
  ShieldCheck,
  Clock3,
  CalendarDays,
  CheckCircle2,
  Ban,
  AlertTriangle,
  FileText,
  ArrowUpRight,
  Activity,
  CircleCheck,
  Building2,
} from 'lucide-react'

import adminData from '../mocks/adminData.json'

// --------------------------------------------------
// CONFIGURATION DES STATUTS
// --------------------------------------------------

const reportStatusConfig = {
  pending: {
    label: 'En attente',
    className: 'bg-amber-50 text-amber-700 ring-amber-200',
    icon: Clock3,
  },
  warning: {
    label: 'Avertissement envoyé',
    className: 'bg-blue-50 text-blue-700 ring-blue-200',
    icon: AlertTriangle,
  },
  dismissed: {
    label: 'Classé sans suite',
    className: 'bg-slate-100 text-slate-600 ring-slate-200',
    icon: CheckCircle2,
  },
  suspended: {
    label: 'Boutique suspendue',
    className: 'bg-rose-50 text-rose-700 ring-rose-200',
    icon: Ban,
  },
}

// --------------------------------------------------
// FORMATAGE
// --------------------------------------------------

function formatCurrency(amount = 0) {
  return `${new Intl.NumberFormat('fr-FR').format(
    Number(amount) || 0
  )} FCFA`
}

function formatCompactCurrency(amount = 0) {
  const value = Number(amount) || 0

  if (value >= 1000000) {
    return `${(value / 1000000).toLocaleString('fr-FR', {
      maximumFractionDigits: 2,
    })} M`
  }

  if (value >= 1000) {
    return `${(value / 1000).toLocaleString('fr-FR', {
      maximumFractionDigits: 1,
    })} K`
  }

  return value.toLocaleString('fr-FR')
}

function formatDate(date) {
  if (!date) return 'Date non disponible'

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Date non disponible'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsedDate)
}

// --------------------------------------------------
// CARTE STATISTIQUE PREMIUM
// --------------------------------------------------

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  accent,
  iconBackground,
}) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 sm:p-6">
      <div className={`absolute left-0 top-0 h-full w-1 ${accent}`} />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h2 className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {value}
          </h2>
        </div>

        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconBackground}`}>
          <Icon size={22} strokeWidth={1.9} />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
        <span className={`h-1.5 w-1.5 rounded-full ${accent}`} />

        <p className="text-xs font-medium text-slate-500">
          {description}
        </p>
      </div>
    </article>
  )
}

// --------------------------------------------------
// RÉPARTITION DES BOUTIQUES
// --------------------------------------------------

function ShopsDistribution({
  activeCount,
  suspendedCount,
  total,
}) {
  const activePercentage =
    total > 0 ? (activeCount / total) * 100 : 0

  const suspendedPercentage =
    total > 0 ? (suspendedCount / total) * 100 : 0

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Building2 size={18} />
            </div>

            <h2 className="font-bold text-slate-900">
              État des boutiques
            </h2>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Répartition selon le statut de chaque boutique
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 px-3 py-2 text-right">
          <p className="text-xs text-slate-500">
            Total
          </p>

          <p className="text-lg font-bold text-slate-900">
            {total}
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-7">
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

              <span className="text-sm font-semibold text-slate-700">
                Boutiques actives
              </span>
            </div>

            <div className="text-right">
              <span className="text-sm font-bold text-slate-900">
                {activeCount}
              </span>

              <span className="ml-2 text-xs text-slate-400">
                {activePercentage.toFixed(0)} %
              </span>
            </div>
          </div>

          <div
            className="h-2.5 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-label="Proportion des boutiques actives"
            aria-valuenow={Math.round(activePercentage)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${activePercentage}%` }}
            />
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />

              <span className="text-sm font-semibold text-slate-700">
                Boutiques suspendues
              </span>
            </div>

            <div className="text-right">
              <span className="text-sm font-bold text-slate-900">
                {suspendedCount}
              </span>

              <span className="ml-2 text-xs text-slate-400">
                {suspendedPercentage.toFixed(0)} %
              </span>
            </div>
          </div>

          <div
            className="h-2.5 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-label="Proportion des boutiques suspendues"
            aria-valuenow={Math.round(suspendedPercentage)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-rose-500 transition-all duration-700"
              style={{ width: `${suspendedPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Activity size={16} />
          <span>État global de la plateforme</span>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          <CircleCheck size={14} />
          Suivi actif
        </span>
      </div>
    </section>
  )
}

// --------------------------------------------------
// SIGNALEMENTS RÉCENTS
// --------------------------------------------------

function RecentReports({ reports }) {
  if (reports.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 size={26} />
        </div>

        <h2 className="mt-4 font-bold text-slate-900">
          Aucun signalement récent
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Tous les signalements sont absents pour le moment.
        </p>
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <Flag size={18} />
            </div>

            <h2 className="font-bold text-slate-900">
              Signalements récents
            </h2>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Les quatre derniers signalements reçus sur Vendix
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 sm:self-auto">
          <FileText size={15} />
          {reports.length} signalement(s)
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {reports.map((report) => {
          const status =
            reportStatusConfig[report.status] ||
            reportStatusConfig.pending

          const StatusIcon = status.icon

          return (
            <article
              key={report.id}
              className="group p-5 transition-colors duration-200 hover:bg-slate-50/80 sm:p-6"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                      {report.reason || 'Motif non précisé'}
                    </h3>

                    <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-500">
                      #{report.id}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Store size={15} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[11px] text-slate-400">
                          Boutique concernée
                        </p>

                        <p className="truncate text-sm font-semibold text-slate-700">
                          {report.shopName || 'Non renseignée'}
                        </p>
                      </div>
                    </div>

                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                        <FileText size={15} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[11px] text-slate-400">
                          Signalé par
                        </p>

                        <p className="truncate text-sm font-semibold text-slate-700">
                          {report.reporter || 'Non renseigné'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {report.description && (
                    <p className="mt-4 border-l-2 border-slate-200 pl-3 text-sm leading-relaxed text-slate-500">
                      {report.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                    <CalendarDays size={14} />

                    <span>
                      Soumis le {formatDate(report.submittedAt)}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center lg:justify-end">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold ring-1 ring-inset ${status.className}`}
                  >
                    <StatusIcon size={14} />
                    {status.label}
                  </span>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

// --------------------------------------------------
// PAGE PRINCIPALE
// --------------------------------------------------

export default function DashboardPage({
  shops = adminData.shops,
  reports = adminData.reports,
  transactionVolumeXof =
    adminData.dashboard?.transactionVolumeXof ?? 0,
}) {
  const safeShops = Array.isArray(shops) ? shops : []
  const safeReports = Array.isArray(reports) ? reports : []

  const totalShops = safeShops.length

  const activeShops = safeShops.filter(
    (shop) => shop.status === 'active'
  ).length

  const suspendedShops = safeShops.filter(
    (shop) => shop.status === 'suspended'
  ).length

  const pendingReports = safeReports.filter(
    (report) => report.status === 'pending'
  ).length

  const latestReports = [...safeReports]
    .sort((a, b) => {
      const dateA = new Date(a.submittedAt || 0).getTime()
      const dateB = new Date(b.submittedAt || 0).getTime()

      return dateB - dateA
    })
    .slice(0, 4)

  const currentDate = new Intl.DateTimeFormat('fr-FR', {
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  return (
    <main className="min-w-0 space-y-8 pb-8">
      {/* EN-TÊTE */}
      <section className="relative overflow-hidden rounded-2xl border border-blue-900/20 bg-gradient-to-br from-slate-950 via-blue-950 to-blue-900 p-6 shadow-lg shadow-blue-950/10 sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-2 -top-10 h-44 w-44 rounded-full border border-white/10" />

        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100 backdrop-blur">
              <ShieldCheck size={14} />
              Espace Super-Administrateur
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Tableau de bord
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-blue-100/80 sm:text-base">
              Pilotez la supervision des boutiques et assurez le suivi des signalements sur Vendix.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
              <CalendarDays size={19} />
            </div>

            <div>
              <p className="text-xs text-blue-100/70">
                Période actuelle
              </p>

              <p className="mt-1 text-sm font-bold capitalize text-white">
                {currentDate}
              </p>
            </div>
          </div>
        </div>

        <div className="relative mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-5 text-xs text-blue-100/80">
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Supervision des boutiques
          </span>

          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Contrôle des signalements
          </span>
        </div>
      </section>

      {/* STATISTIQUES */}
      <section>
        <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Vue synthétique
            </p>

            <h2 className="mt-1 text-lg font-bold text-slate-900">
              Indicateurs clés
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Les principales données de votre plateforme
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Boutiques enregistrées"
            value={totalShops.toLocaleString('fr-FR')}
            description="Ensemble des boutiques inscrites"
            icon={Store}
            accent="bg-blue-600"
            iconBackground="bg-blue-50 text-blue-700"
          />

          <StatCard
            title="Boutiques actives"
            value={activeShops.toLocaleString('fr-FR')}
            description={`${suspendedShops} boutique(s) suspendue(s)`}
            icon={ShieldCheck}
            accent="bg-emerald-500"
            iconBackground="bg-emerald-50 text-emerald-700"
          />

          <StatCard
            title="Volume des transactions"
            value={formatCompactCurrency(transactionVolumeXof)}
            description={formatCurrency(transactionVolumeXof)}
            icon={Wallet}
            accent="bg-violet-500"
            iconBackground="bg-violet-50 text-violet-700"
          />

          <StatCard
            title="Signalements en attente"
            value={pendingReports.toLocaleString('fr-FR')}
            description="Dossiers nécessitant une vérification"
            icon={Flag}
            accent="bg-amber-500"
            iconBackground="bg-amber-50 text-amber-700"
          />
        </div>
      </section>

      {/* RÉPARTITION */}
      <section className="grid grid-cols-1 gap-5">
        <ShopsDistribution
          activeCount={activeShops}
          suspendedCount={suspendedShops}
          total={totalShops}
        />
      </section>

      {/* SIGNALEMENTS */}
      <section>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Centre de vigilance
            </p>

            <h2 className="mt-1 text-lg font-bold text-slate-900">
              Suivi des signalements
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Consultez les derniers incidents signalés par les utilisateurs.
            </p>
          </div>

          {pendingReports > 0 && (
            <span className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
              <Flag size={15} />
              {pendingReports} à traiter
            </span>
          )}
        </div>

        <RecentReports reports={latestReports} />
      </section>

      {/* PIED DE PAGE */}
      <footer className="flex flex-col items-center justify-between gap-2 border-t border-slate-200 pt-5 text-center sm:flex-row sm:text-left">
        <p className="text-xs text-slate-400">
          Vendix Admin · Espace de supervision
        </p>

        <p className="text-xs text-slate-400">
          Interface d'administration · 2026
        </p>
      </footer>
    </main>
  )
}
