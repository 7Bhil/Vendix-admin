
import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  FileWarning,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Store,
  UserRound,
  CalendarDays,
  ArrowUpRight,
  X,
  ShieldAlert,
  MessageSquareText,
  ClipboardCheck,
} from 'lucide-react'

import adminData from '../mocks/adminData.json'

const statusConfig = {
  pending: {
    label: 'En attente',
    style: 'bg-amber-50 text-amber-700 ring-amber-200',
    icon: Clock3,
  },
  dismissed: {
    label: 'Classé sans suite',
    style: 'bg-slate-100 text-slate-600 ring-slate-200',
    icon: CheckCircle2,
  },
  warning: {
    label: 'Avertissement envoyé',
    style: 'bg-blue-50 text-blue-700 ring-blue-200',
    icon: AlertTriangle,
  },
  suspended: {
    label: 'Boutique suspendue',
    style: 'bg-rose-50 text-rose-700 ring-rose-200',
    icon: Ban,
  },
}

const filters = [
  { value: 'all', label: 'Tous les signalements' },
  { value: 'pending', label: 'En attente' },
  { value: 'dismissed', label: 'Classés sans suite' },
  { value: 'warning', label: 'Avertissements' },
  { value: 'suspended', label: 'Boutiques suspendues' },
]

const formatDate = (date) => {
  if (!date) return 'Date non renseignée'

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Date non renseignée'
  }

  return parsedDate.toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ReportsPage({
  setShops,
  reports = adminData.reports,
  setReports,
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedReport, setSelectedReport] = useState(null)
  const [resolutionNote, setResolutionNote] = useState('')

  // Fermer la fenêtre avec la touche Échap.
  useEffect(() => {
    if (!selectedReport) return

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setSelectedReport(null)
        setResolutionNote('')
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [selectedReport])

  // Filtrer les signalements selon la recherche et le statut.
  const filteredReports = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return reports.filter((report) => {
      const matchesSearch =
        report.shopName?.toLowerCase().includes(normalizedSearch) ||
        report.reason?.toLowerCase().includes(normalizedSearch) ||
        report.reporter?.toLowerCase().includes(normalizedSearch) ||
        report.description?.toLowerCase().includes(normalizedSearch)

      const matchesFilter =
        activeFilter === 'all' || report.status === activeFilter

      return matchesSearch && matchesFilter
    })
  }, [reports, searchTerm, activeFilter])

  // Statistiques des signalements.
  const pendingCount = reports.filter(
    (report) => report.status === 'pending'
  ).length

  const dismissedCount = reports.filter(
    (report) => report.status === 'dismissed'
  ).length

  const warningCount = reports.filter(
    (report) => report.status === 'warning'
  ).length

  const suspendedCount = reports.filter(
    (report) => report.status === 'suspended'
  ).length

  const stats = [
    {
      label: 'Total des signalements',
      value: reports.length,
      icon: FileWarning,
      color: 'bg-slate-100 text-slate-700',
      description: 'Signalements reçus',
    },
    {
      label: 'En attente',
      value: pendingCount,
      icon: Clock3,
      color: 'bg-amber-50 text-amber-700',
      description: 'À examiner',
    },
    {
      label: 'Avertissements',
      value: warningCount,
      icon: AlertTriangle,
      color: 'bg-blue-50 text-blue-700',
      description: 'Envoyés aux commerçants',
    },
    {
      label: 'Boutiques suspendues',
      value: suspendedCount,
      icon: Ban,
      color: 'bg-rose-50 text-rose-700',
      description: 'À la suite d’un signalement',
    },
  ]

  // Ouvrir les détails d'un signalement.
  const openReport = (report) => {
    setSelectedReport(report)
    setResolutionNote(report.resolution || '')
  }

  // Traiter un signalement.
  const handleReportAction = (action) => {
    if (!selectedReport) return

    const reason = resolutionNote.trim()

    // Un motif est obligatoire pour suspendre une boutique.
    if (action === 'suspended' && !reason) return

    const resolution =
      reason ||
      (action === 'dismissed'
        ? 'Signalement classé sans suite.'
        : 'Un avertissement a été adressé au commerçant.')

    // Mettre à jour le signalement.
    setReports((currentReports) =>
      currentReports.map((report) =>
        report.id === selectedReport.id
          ? {
              ...report,
              status: action,
              resolution,
            }
          : report
      )
    )

    // Suspendre également la boutique concernée.
    if (action === 'suspended') {
      setShops((currentShops) =>
        currentShops.map((shop) =>
          shop.id === selectedReport.shopId
            ? {
                ...shop,
                status: 'suspended',
                suspensionReason: reason,
              }
            : shop
        )
      )
    }

    setSelectedReport(null)
    setResolutionNote('')
  }

  const closeModal = () => {
    setSelectedReport(null)
    setResolutionNote('')
  }

  return (
    <section className="space-y-7 pb-8">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-teal-700">
            <FileWarning size={17} />
            Administration
            <span className="text-slate-300">/</span>
            <span className="text-slate-500">Signalements</span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Gestion des signalements
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Consultez les plaintes des utilisateurs et prenez les mesures
            nécessaires pour garantir la fiabilité des boutiques Vendix.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-teal-100 bg-teal-50 px-4 py-3">
          <ShieldAlert size={20} className="text-teal-700" />
          <div>
            <p className="text-xs font-medium text-teal-700">
              Suivi de modération
            </p>
            <p className="text-sm font-semibold text-teal-900">
              {pendingCount} à traiter
            </p>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                    {stat.value}
                  </p>
                </div>

                <div className={`rounded-xl p-3 ${stat.color}`}>
                  <Icon size={21} />
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-400">
                {stat.description}
              </p>
            </div>
          )
        })}
      </div>

      {/* Recherche et filtres */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              Liste des signalements
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Recherchez et filtrez les plaintes reçues.
            </p>
          </div>

          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Rechercher une boutique, un motif, un déclarant..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-50"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <ClipboardCheck
              size={18}
              className="shrink-0 text-slate-400"
            />

            {filters.map((filter) => {
              const isActive = activeFilter === filter.value

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setActiveFilter(filter.value)}
                  className={`shrink-0 rounded-lg px-3.5 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Résultats */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-slate-900">
            {filteredReports.length}
          </span>{' '}
          signalement(s) trouvé(s)
        </p>

        {(searchTerm || activeFilter !== 'all') && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('')
              setActiveFilter('all')
            }}
            className="text-left text-sm font-medium text-teal-700 hover:text-teal-900"
          >
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* Cartes des signalements */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <FileWarning size={26} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-800">
              Aucun signalement trouvé
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Aucun résultat ne correspond à votre recherche ou à ce filtre.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearchTerm('')
                setActiveFilter('all')
              }}
              className="mt-5 text-sm font-semibold text-teal-700 hover:text-teal-900"
            >
              Afficher tous les signalements
            </button>
          </div>
        ) : (
          filteredReports.map((report) => {
            const status = statusConfig[report.status] || statusConfig.pending
            const StatusIcon = status.icon

            return (
              <article
                key={report.id}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md sm:p-6"
              >
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Signalement #{report.id}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${status.style}`}
                        >
                          <StatusIcon size={13} />
                          {status.label}
                        </span>
                      </div>

                      <h3 className="mt-3 text-lg font-semibold text-slate-900">
                        {report.reason}
                      </h3>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-2">
                          <Store size={15} className="text-slate-400" />
                          <span className="font-medium text-slate-700">
                            {report.shopName}
                          </span>
                        </span>

                        <span className="inline-flex items-center gap-2">
                          <UserRound size={15} className="text-slate-400" />
                          {report.reporter}
                        </span>

                        <span className="inline-flex items-center gap-2">
                          <CalendarDays size={15} className="text-slate-400" />
                          {formatDate(report.submittedAt)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openReport(report)}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-semibold text-teal-800 transition hover:border-teal-300 hover:bg-teal-100"
                    >
                      Voir les détails
                      <ArrowUpRight size={16} />
                    </button>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                      {report.description}
                    </p>
                  </div>

                  {report.resolution && (
                    <div className="flex items-start gap-2 text-sm text-slate-500">
                      <CheckCircle2
                        size={16}
                        className="mt-0.5 shrink-0 text-teal-600"
                      />
                      <p>
                        <span className="font-semibold text-slate-700">
                          Résolution :
                        </span>{' '}
                        {report.resolution}
                      </p>
                    </div>
                  )}
                </div>
              </article>
            )
          })
        )}
      </div>

      {/* Fenêtre de détails et de traitement */}
      {selectedReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5"
          onClick={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-modal-title"
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* En-tête de la fenêtre */}
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white px-5 py-5 sm:px-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
                  Dossier de modération
                </p>

                <h2
                  id="report-modal-title"
                  className="mt-2 text-xl font-bold text-slate-900"
                >
                  Signalement #{selectedReport.id}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedReport.reason}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Fermer la fenêtre"
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={21} />
              </button>
            </div>

            <div className="space-y-6 px-5 py-6 sm:px-7">
              {/* Statut actuel */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Statut actuel
                </p>

                {(() => {
                  const currentStatus =
                    statusConfig[selectedReport.status] ||
                    statusConfig.pending
                  const CurrentIcon = currentStatus.icon

                  return (
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ring-inset ${currentStatus.style}`}
                    >
                      <CurrentIcon size={15} />
                      {currentStatus.label}
                    </span>
                  )
                })()}
              </div>

              {/* Informations */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Store size={17} />
                    <p className="text-xs font-semibold uppercase tracking-wide">
                      Boutique concernée
                    </p>
                  </div>

                  <p className="mt-3 font-semibold text-slate-900">
                    {selectedReport.shopName}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <UserRound size={17} />
                    <p className="text-xs font-semibold uppercase tracking-wide">
                      Déclarant
                    </p>
                  </div>

                  <p className="mt-3 font-semibold text-slate-900">
                    {selectedReport.reporter}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 sm:col-span-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <CalendarDays size={17} />
                    <p className="text-xs font-semibold uppercase tracking-wide">
                      Date de soumission
                    </p>
                  </div>

                  <p className="mt-3 text-sm font-medium text-slate-800">
                    {formatDate(selectedReport.submittedAt)}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <MessageSquareText
                    size={17}
                    className="text-teal-700"
                  />
                  <h3 className="text-sm font-semibold text-slate-900">
                    Description du signalement
                  </h3>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                    {selectedReport.description}
                  </p>
                </div>
              </div>

              {/* Résolution existante */}
              {selectedReport.resolution && (
                <div className="rounded-xl border border-teal-100 bg-teal-50 p-4">
                  <div className="flex items-center gap-2 text-teal-800">
                    <CheckCircle2 size={18} />
                    <h3 className="text-sm font-semibold">
                      Décision déjà enregistrée
                    </h3>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-teal-900">
                    {selectedReport.resolution}
                  </p>
                </div>
              )}

              {/* Actions de modération */}
              {selectedReport.status === 'pending' && (
                <div className="border-t border-slate-200 pt-5">
                  <h3 className="font-semibold text-slate-900">
                    Traiter ce signalement
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Ajoutez un commentaire pour expliquer votre décision.
                    Un motif est obligatoire pour suspendre une boutique.
                  </p>

                  <label
                    htmlFor="resolutionNote"
                    className="mb-2 mt-5 block text-sm font-medium text-slate-700"
                  >
                    Motif ou commentaire de traitement
                    <span className="ml-1 text-slate-400">(facultatif)</span>
                  </label>

                  <textarea
                    id="resolutionNote"
                    value={resolutionNote}
                    onChange={(event) =>
                      setResolutionNote(event.target.value)
                    }
                    rows={4}
                    maxLength={500}
                    placeholder="Expliquez votre décision..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3.5 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-50"
                  />

                  <div className="mt-1 text-right text-xs text-slate-400">
                    {resolutionNote.length}/500 caractères
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => handleReportAction('dismissed')}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <CheckCircle2 size={17} />
                      Classer sans suite
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReportAction('warning')}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      <AlertTriangle size={17} />
                      Avertissement
                    </button>

                    <button
                      type="button"
                      disabled={!resolutionNote.trim()}
                      onClick={() => handleReportAction('suspended')}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-3 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Ban size={17} />
                      Suspendre
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Pied de fenêtre */}
            <div className="flex justify-end border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-7">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
