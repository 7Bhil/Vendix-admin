import { useEffect, useState } from 'react';
import { adminService } from '../api/adminService.js';
import { AlertTriangle, Clock, CheckCircle2, XCircle, Phone } from 'lucide-react';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadData = () => {
    setLoading(true);
    adminService.getReports()
      .then(setReports)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await adminService.updateReportStatus(id, newStatus);
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'EN_ATTENTE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Clock className="w-3 h-3" /> En attente
          </span>
        );
      case 'EN_COURS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" /> En cours
          </span>
        );
      case 'RESOLU':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Résolu
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-700 text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Signalements & Litiges Citoyens</h1>
        <p className="text-xs text-slate-400 mt-1">Traitement des alertes consommateurs et modération anti-fraude.</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-slate-500 bg-slate-950 border border-slate-800 rounded-xl">
            Chargement des alertes...
          </div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-slate-950 border border-slate-800 rounded-xl">
            Aucun litige ou signalement en attente.
          </div>
        ) : (
          reports.map((r) => (
            <div key={r.id} className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white">{r.targetStore || r.targetSlug}</span>
                    <span className="text-xs text-slate-400 ml-2 font-mono">({r.reason})</span>
                  </div>
                </div>
                <div>{getStatusBadge(r.status)}</div>
              </div>

              <div className="text-xs text-slate-300 bg-slate-900/50 p-3.5 rounded-lg border border-slate-800/60 leading-relaxed">
                {r.description}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span className="flex items-center gap-1 font-mono text-slate-300">
                    <Phone className="w-3 h-3 text-slate-500" />
                    {r.reporterPhone}
                  </span>
                  <span>•</span>
                  <span>Signalé le {new Date(r.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>

                <div className="flex items-center gap-2">
                  {r.status !== 'EN_COURS' && r.status !== 'RESOLU' && (
                    <button
                      type="button"
                      disabled={updatingId === r.id}
                      onClick={() => handleUpdateStatus(r.id, 'EN_COURS')}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 transition"
                    >
                      Prendre en charge
                    </button>
                  )}
                  {r.status !== 'RESOLU' && (
                    <button
                      type="button"
                      disabled={updatingId === r.id}
                      onClick={() => handleUpdateStatus(r.id, 'RESOLU')}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 transition"
                    >
                      Marquer résolu
                    </button>
                  )}
                  {r.status !== 'REJETE' && (
                    <button
                      type="button"
                      disabled={updatingId === r.id}
                      onClick={() => handleUpdateStatus(r.id, 'REJETE')}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition"
                    >
                      Rejeter
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
