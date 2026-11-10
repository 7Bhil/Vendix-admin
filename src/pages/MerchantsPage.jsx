import { useEffect, useState } from 'react';
import { adminService } from '../api/adminService.js';
import { Search, Ban, CheckCircle, Store, Phone } from 'lucide-react';

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const loadData = () => {
    setLoading(true);
    adminService.getMerchants()
      .then(setMerchants)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleSuspend = async (merchant) => {
    const isSuspended = merchant.status === 'SUSPENDU';
    const confirmMsg = isSuspended
      ? `Réactiver le commerce "${merchant.storeName}" ?`
      : `Voulez-vous suspendre l'accès pour "${merchant.storeName}" ?`;

    if (!window.confirm(confirmMsg)) return;

    setActionLoading(merchant.id);
    try {
      await adminService.suspendMerchant(merchant.id, isSuspended ? 'Réactivation' : 'Infraction aux CGU');
      setMerchants((prev) =>
        prev.map((m) =>
          m.id === merchant.id
            ? { ...m, status: isSuspended ? 'ACTIF' : 'SUSPENDU' }
            : m
        )
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = merchants.filter(
    (m) =>
      m.storeName.toLowerCase().includes(search.toLowerCase()) ||
      m.fullName.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Annuaire des commerçants</h1>
          <p className="text-xs text-slate-400 mt-1">Surveillance des comptes marchands et gestion des suspensions.</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, boutique, tél..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3.5">Commerce</th>
                <th className="px-6 py-3.5">Gérant / Contact</th>
                <th className="px-6 py-3.5">Volume de vente</th>
                <th className="px-6 py-3.5">Statut</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Chargement des commerçants...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Aucun commerçant trouvé.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => {
                  const isSuspended = m.status === 'SUSPENDU';
                  return (
                    <tr key={m.id} className="hover:bg-slate-900/30 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                            <Store className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-white">{m.storeName}</div>
                            <div className="text-[11px] text-slate-500 font-mono">/shop/{m.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-200 font-medium">{m.fullName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />
                          {m.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-300 font-medium">
                        {(m.volumeFCFA || 0).toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isSuspended
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          disabled={actionLoading === m.id}
                          onClick={() => handleToggleSuspend(m)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                            isSuspended
                              ? 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'
                              : 'bg-rose-600/20 text-rose-300 hover:bg-rose-600/30'
                          }`}
                        >
                          {isSuspended ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" />
                              Réactiver
                            </>
                          ) : (
                            <>
                              <Ban className="w-3.5 h-3.5" />
                              Suspendre
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
