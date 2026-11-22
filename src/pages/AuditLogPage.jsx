import { useEffect, useMemo, useState } from 'react';
import { Download, RefreshCw, ScrollText, Search } from 'lucide-react';
import { adminService } from '../api/adminService';

const ACTION_CONFIG = {
  SUSPEND_MERCHANT: {
    label: 'Suspension boutique',
    style: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  REACTIVATE_MERCHANT: {
    label: 'Réactivation boutique',
    style: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  REPORT_DISMISSED: {
    label: 'Signalement classé',
    style: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  REPORT_WARNING: {
    label: 'Avertissement envoyé',
    style: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  ADMIN_LOGIN: {
    label: 'Connexion admin',
    style: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  ADMIN_LOGOUT: {
    label: 'Déconnexion admin',
    style: 'bg-blue-50 text-blue-700 border-blue-200',
  },
};

const DATE_RANGES = [
  { id: 'all', label: 'Toutes les dates' },
  { id: 'today', label: "Aujourd'hui" },
  { id: '7d', label: '7 derniers jours' },
  { id: '30d', label: '30 derniers jours' },
];

function formatBeninDateTime(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '—';

  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getStartDateForRange(rangeId) {
  if (rangeId === 'all') return undefined;

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (rangeId === '7d') {
    start.setDate(start.getDate() - 6);
  } else if (rangeId === '30d') {
    start.setDate(start.getDate() - 29);
  }

  return start.toISOString();
}

function escapeCsvCell(value) {
  const str = String(value ?? '');
  if (/[",\n\r;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildAuditCsv(logs) {
  const headers = [
    'Date & Heure',
    'Administrateur',
    'Action',
    'Type Cible',
    'Cible',
    'Motif',
    'Adresse IP',
  ];

  const rows = logs.map((log) => [
    formatBeninDateTime(log.timestamp),
    log.adminName,
    log.action,
    log.targetType,
    log.targetName,
    log.reason,
    log.ipAddress || '',
  ]);

  return [headers, ...rows]
    .map((row) => row.map(escapeCsvCell).join(';'))
    .join('\n');
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    let isCurrent = true;

    async function loadLogs() {
      setLoading(true);
      setError('');

      try {
        const data = await adminService.getAuditLogs({
          action: actionFilter !== 'ALL' ? actionFilter : undefined,
          startDate: getStartDateForRange(dateRange),
        });

        if (isCurrent) {
          setLogs(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isCurrent) {
          setError(err.message || "Impossible de charger le journal d'audit.");
        }
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    }

    loadLogs();
    return () => {
      isCurrent = false;
    };
  }, [actionFilter, dateRange, reloadKey]);

  const filteredLogs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return logs;

    return logs.filter(
      (log) =>
        log.targetName?.toLowerCase().includes(query) ||
        log.adminName?.toLowerCase().includes(query) ||
        log.reason?.toLowerCase().includes(query),
    );
  }, [logs, searchTerm]);

  const handleExportCsv = () => {
    const csvContent = buildAuditCsv(filteredLogs);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.setAttribute('download', `audit-logs-${dateStamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Journal d'audit</h1>
          <p className="mt-1 text-sm text-slate-500">
            Historique chronologique et traçabilité des actions Super-Admin.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          disabled={loading || filteredLogs.length === 0}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download size={16} aria-hidden="true" />
          Exporter CSV
        </button>
      </div>

      {/* Filtres */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-3">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            aria-label="Rechercher par boutique ou modérateur"
            placeholder="Boutique, modérateur ou motif..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        <select
          aria-label="Filtrer par type d'action"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        >
          <option value="ALL">Toutes les actions</option>
          {Object.entries(ACTION_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>
              {cfg.label} ({key})
            </option>
          ))}
        </select>

        <select
          aria-label="Filtrer par période"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        >
          {DATE_RANGES.map((range) => (
            <option key={range.id} value={range.id}>
              {range.label}
            </option>
          ))}
        </select>
      </div>

      {/* État erreur */}
      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm font-medium text-rose-800">{error}</p>
          <button
            type="button"
            onClick={() => setReloadKey((prev) => prev + 1)}
            className="inline-flex items-center gap-2 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-sm font-semibold text-rose-800 hover:bg-rose-100"
          >
            <RefreshCw size={15} aria-hidden="true" />
            Réessayer
          </button>
        </div>
      )}

      {/* État chargement */}
      {loading && (
        <div
          role="status"
          aria-label="Chargement du journal d'audit"
          className="space-y-3 rounded-xl border border-slate-200 bg-white p-5"
        >
          <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
          <div className="h-10 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-10 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-10 w-full animate-pulse rounded bg-slate-100" />
          <span className="sr-only">Chargement du journal d'audit...</span>
        </div>
      )}

      {/* État nominal / vide */}
      {!loading && !error && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <ScrollText size={32} className="text-slate-300" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-slate-700">
                Aucun événement d'audit trouvé
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Modifiez vos filtres ou exécutez une action d'administration.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">Date & Heure</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Administrateur</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Action</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Cible</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Motif & Justification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => {
                    const badge = ACTION_CONFIG[log.action] || {
                      label: log.action,
                      style: 'bg-slate-100 text-slate-700 border-slate-200',
                    };

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/70">
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-600">
                          {formatBeninDateTime(log.timestamp)}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {log.adminName}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badge.style}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {log.targetName}
                          <span className="ml-1.5 text-xs text-slate-400">
                            ({log.targetType})
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{log.reason}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
