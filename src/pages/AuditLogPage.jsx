import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  CalendarDays,
  Download,
  Search,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminService } from '../api/adminService';

const getBeninDateKey = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Porto-Novo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
};

const getDateOrdinal = (dateKey) => {
  if (!dateKey) return null;

  const [year, month, day] = dateKey.split('-').map(Number);

  return Date.UTC(year, month - 1, day) / 86400000;
};


const formatBeninDate = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Date invalide';

  const parts = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Africa/Porto-Novo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${values.day}/${values.month}/${values.year} ${values.hour}:${values.minute}`;
};

const actionConfig = {
  SUSPEND_MERCHANT: {
    label: 'Suspension',
    style: 'bg-rose-50 text-rose-700 ring-rose-200',
  },
  REACTIVATE_MERCHANT: {
    label: 'Réactivation',
    style: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  REPORT_DISMISSED: {
    label: 'Signalement rejeté',
    style: 'bg-slate-100 text-slate-700 ring-slate-200',
  },
  REPORT_WARNING: {
    label: 'Avertissement',
    style: 'bg-amber-50 text-amber-700 ring-amber-200',
  },
  ADMIN_LOGIN: {
    label: 'Connexion',
    style: 'bg-blue-50 text-blue-700 ring-blue-200',
  },
  ADMIN_LOGOUT: {
    label: 'Déconnexion',
    style: 'bg-blue-50 text-blue-700 ring-blue-200',
  },
};


const exportAuditLogs = (logs) => {
  const headers = [
    'Date et heure',
    'Administrateur',
    'ID administrateur',
    'Action',
    'Type de cible',
    'Cible',
    'ID cible',
    'Justification',
    'Ancienne valeur',
    'Nouvelle valeur',
    'Adresse IP',
  ];

  const rows = logs.map((log) => [
    formatBeninDate(log.timestamp),
    log.adminName,
    log.adminId,
    log.action,
    log.targetType,
    log.targetName,
    log.targetId,
    log.reason,
    log.previousValue,
    log.newValue,
    log.ipAddress,
  ]);

  const escapeCsvValue = (value) => {
    const normalizedValue = String(value ?? '').replace(/"/g, '""');
    return `"${normalizedValue}"`;
  };

  const csvContent = [
    headers,
    ...rows,
  ]
    .map((row) => row.map(escapeCsvValue).join(';'))
    .join('\r\n');

  const csvBlob = new Blob(
    ['\uFEFF', csvContent],
    { type: 'text/csv;charset=utf-8;' },
  );

  const downloadUrl = URL.createObjectURL(csvBlob);
  const link = document.createElement('a');

  link.href = downloadUrl;
  link.download = `journal-audit-${getBeninDateKey(new Date())}.csv`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(downloadUrl);
};


export default function AuditLogPage() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [todayDateKey] = useState(() => getBeninDateKey(new Date()),);

  useEffect(() => {
    let isMounted = true;

    const loadAuditLogs = async () => {
      try {
        setIsLoading(true);
        setError('');

        const data = await adminService.getAuditLogs();

        if (isMounted) {
          const logs = Array.isArray(data)
            ? data
            : Array.isArray(data?.auditLogs)
              ? data.auditLogs
              : [];

          setAuditLogs(logs);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.message || 'Impossible de charger le journal d’audit.',
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAuditLogs();

    return () => {
      isMounted = false;
    };
  }, []);

const filteredLogs = useMemo(() => {
  const today = getDateOrdinal(todayDateKey);

  return auditLogs.filter((log) => {
    const search = searchTerm.trim().toLowerCase();

    const matchesSearch =
      !search ||
      [
        log.targetName,
        log.adminName,
        log.adminId,
        log.targetId,
      ].some((value) => String(value ?? '').toLowerCase().includes(search));

    const matchesAction =
      actionFilter === 'all' || log.action === actionFilter;

    const eventDate = getDateOrdinal(getBeninDateKey(log.timestamp));
    const ageInDays = eventDate === null ? null : today - eventDate;

    let matchesDate = true;

    if (dateFilter === 'today') {
      matchesDate = ageInDays === 0;
    } else if (dateFilter === '7days') {
      matchesDate = ageInDays >= 0 && ageInDays <= 6;
    } else if (dateFilter === '30days') {
      matchesDate = ageInDays >= 0 && ageInDays <= 29;
    }

    return matchesSearch && matchesAction && matchesDate;
  });
}, [auditLogs, searchTerm, actionFilter, dateFilter, todayDateKey]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-teal-700">
            <ShieldCheck size={18} />
            <span>Administration et sécurité</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900">
            Journal d'audit
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Consultez l'historique des actions sensibles effectuées sur la plateforme.
          </p>
        </div>

        <button
  type="button"
  disabled={filteredLogs.length === 0 || isLoading}
  onClick={() => exportAuditLogs(filteredLogs)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-white px-4 py-2.5 text-sm font-semibold text-teal-800 transition-colors hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:hover:bg-slate-100"
        >
          <Download size={17} />
          Exporter en CSV
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Événements enregistrés
            </p>
            <Activity className="text-teal-700" size={20} />
          </div>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            {auditLogs.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Résultats affichés
            </p>
            <CalendarDays className="text-teal-700" size={20} />
          </div>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            {filteredLogs.length}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4">
          <h2 className="font-semibold text-slate-900">
            Historique des opérations
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Recherchez et consultez les actions administratives.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Rechercher un commerçant ou un administrateur..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(event) => setActionFilter(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          >
            <option value="all">Toutes les actions</option>
            <option value="SUSPEND_MERCHANT">Suspension commerçant</option>
            <option value="REACTIVATE_MERCHANT">Réactivation commerçant</option>
            <option value="REPORT_DISMISSED">Signalement rejeté</option>
            <option value="REPORT_WARNING">Avertissement</option>
            <option value="ADMIN_LOGIN">Connexion administrateur</option>
            <option value="ADMIN_LOGOUT">Déconnexion administrateur</option>
          </select>

          <select
  value={dateFilter}
  onChange={(event) => setDateFilter(event.target.value)}
  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
>
  <option value="all">Toutes les périodes</option>
  <option value="today">Aujourd'hui</option>
  <option value="7days">7 derniers jours</option>
  <option value="30days">30 derniers jours</option>
</select>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-10 text-sm text-slate-500">
          <RefreshCw size={18} className="animate-spin" />
          Chargement du journal d'audit...
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {filteredLogs.length === 0 ? (
            <div className="p-10 text-center">
              <Activity className="mx-auto mb-3 text-slate-300" size={32} />
              <p className="font-medium text-slate-700">
                Aucun événement trouvé
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Essayez de modifier vos critères de recherche.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Date et heure</th>
                    <th className="px-5 py-4">Administrateur</th>
                    <th className="px-5 py-4">Action</th>
                    <th className="px-5 py-4">Cible</th>
                    <th className="px-5 py-4">Justification</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="align-top hover:bg-slate-50/70">
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {formatBeninDate(log.timestamp)}
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-800">
                        {log.adminName || log.adminId || 'Non renseigné'}
                      </td>

                      <td className="px-5 py-4">
  {(() => {
    const config = actionConfig[log.action] || {
      label: log.action || 'Action inconnue',
      style: 'bg-slate-50 text-slate-600 ring-slate-200',
    };

    return (
      <span
        className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${config.style}`}
      >
        {config.label}
      </span>
    );
  })()}
</td>

                      <td className="px-5 py-4">
                        <Link
                          to={log.targetType === 'SHOP' ? '/commercants' : '/signalements'}
                          className="font-medium text-teal-700 hover:underline"
                        >
                          {log.targetName || `Cible #${log.targetId}`}
                        </Link>
                      </td>

                      <td className="max-w-xs px-5 py-4 text-slate-600">
                        {log.reason || 'Aucune justification fournie'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
