
import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'

import adminData from '../mocks/adminData.json'

const statusConfig = {
  pending: {
    label: 'En attente',
    style: 'bg-amber-50 text-amber-700',
  },
  dismissed: {
    label: 'Classé sans suite',
    style: 'bg-slate-100 text-slate-700',
  },
  warning: {
    label: 'Avertissement envoyé',
    style: 'bg-blue-50 text-blue-700',
  },
  suspended: {
    label: 'Boutique suspendue',
    style: 'bg-rose-50 text-rose-700',
  },
}

export default function ReportsPage({ setShops }) {
  const [reports, setReports] = useState(adminData.reports)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedReport, setSelectedReport] = useState(null)
const [resolutionNote, setResolutionNote] = useState('')

    useEffect(() => {
    if (!selectedReport) return

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setSelectedReport(null)
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [selectedReport])

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reporter.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter =
      activeFilter === 'all' || report.status === activeFilter

    return matchesSearch && matchesFilter
  })

const handleReportAction = (action) => {
  if (!selectedReport) return

  const reason = resolutionNote.trim()

  // Exiger un motif pour suspendre une boutique.
  if (action === 'suspended' && !reason) return

  const resolution =
    reason ||
    (action === 'dismissed'
      ? 'Signalement classé sans suite.'
      : 'Un avertissement a été adressé au commerçant.')

  // Mettre à jour le statut du signalement.
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

  const pendingCount = reports.filter(
    (report) => report.status === 'pending'
  ).length

  const dismissedCount = reports.filter(
    (report) => report.status === 'dismissed'
  ).length

  const warningCount = reports.filter(
    (report) => report.status === 'warning'
  ).length

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Gestion des signalements
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Consultez et traitez les plaintes envoyées par les citoyens.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">En attente</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Classés sans suite</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {dismissedCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Avertissements envoyés</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {warningCount}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Rechercher une boutique, un motif..."
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'Tous' },
            { value: 'pending', label: 'En attente' },
            { value: 'dismissed', label: 'Classés sans suite' },
            { value: 'warning', label: 'Avertissements' },
            { value: 'suspended', label: 'Boutiques suspendues' },
          ].map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                activeFilter === filter.value
                  ? 'bg-teal-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="text-sm text-slate-500">
        {filteredReports.length} signalement(s) trouvé(s)
      </div>

      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="font-medium text-slate-700">
              Aucun signalement trouvé
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Essayez de modifier votre recherche ou votre filtre.
            </p>
          </div>
        ) : (
          filteredReports.map((report) => {
            const status = statusConfig[report.status]

            return (
              <article
                key={report.id}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-slate-900">
                        {report.reason}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${status.style}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600">
                      Boutique : <strong>{report.shopName}</strong>
                    </p>

                    <p className="text-sm text-slate-500">
                      Signalé par {report.reporter}
                    </p>

                    <p className="text-sm text-slate-500">
                      Date :{' '}
                      {new Date(report.submittedAt).toLocaleString('fr-FR')}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedReport(report)}
                    className="rounded-lg border border-teal-700 px-4 py-2 text-sm font-medium text-teal-700 transition hover:bg-teal-50"
                  >
                    Voir les détails
                  </button>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {report.description}
                </p>
              </article>
            )
          })
        )}
      </div>

      {selectedReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onClick={() => setSelectedReport(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-modal-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">
                  Signalement #{selectedReport.id}
                </p>

                <h2
                  id="report-modal-title"
                  className="mt-1 text-xl font-bold text-slate-900"
                >
                  {selectedReport.reason}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                aria-label="Fermer"
                className="rounded-lg px-3 py-1 text-xl text-slate-500 hover:bg-slate-100"
              >
                &times;
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-xs font-medium uppercase text-slate-400">
                  Boutique concernée
                </p>
                <p className="mt-1 font-medium text-slate-800">
                  {selectedReport.shopName}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-400">
                  Déclarant
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {selectedReport.reporter}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-400">
                  Description
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  {selectedReport.description}
                </p>
              </div>


              {selectedReport.resolution && (
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-medium uppercase text-slate-400">
                    Résolution
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    {selectedReport.resolution}
                  </p>
                </div>
              )}

              {selectedReport.status === 'pending' && (
                <div className="border-t border-slate-200 pt-5">
                  <label
                    htmlFor="resolutionNote"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Motif ou commentaire de traitement
                  </label>

                  <textarea
                    id="resolutionNote"
                    value={resolutionNote}
                    onChange={(event) =>
                      setResolutionNote(event.target.value)
                    }
                    rows={3}
                    placeholder="Expliquez votre décision..."
                    className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleReportAction('dismissed')}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Classer sans suite
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReportAction('warning')}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Envoyer un avertissement
                    </button>

                    <button
                      type="button"
                      disabled={!resolutionNote.trim()}
                      onClick={() => handleReportAction('suspended')}
                      className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Suspendre la boutique
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </section>
  )

}
