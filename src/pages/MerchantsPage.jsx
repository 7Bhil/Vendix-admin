import { useEffect, useState } from "react";
import { Search, Store, MapPin, Phone, UserRound } from "lucide-react";


const statusConfig = {
  active: {
    label: "Actif",
    style: "bg-emerald-50 text-emerald-700",
  },
  suspended: {
    label: "Suspendu",
    style: "bg-slate-100 text-slate-600",
  },
};

const filters = [
  { label: "Toutes", value: "all" },
  { label: "Actives", value: "active" },
  { label: "Suspendues", value: "suspended" },
];

export default function MerchantsPage({ shops, setShops }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // Boutique sélectionnée pour la suspension
  const [selectedShop, setSelectedShop] = useState(null);

  // Motif de suspension
  const [suspensionReason, setSuspensionReason] = useState("");

  // Fermer la fenêtre avec la touche Escape
  useEffect(() => {
    if (!selectedShop) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedShop(null);
        setSuspensionReason("");
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [selectedShop]);

  // Ouvrir la fenêtre de suspension
  const openSuspensionModal = (shop) => {
    setSelectedShop(shop);
    setSuspensionReason("");
  };

  // Annuler la suspension
  const closeSuspensionModal = () => {
    setSelectedShop(null);
    setSuspensionReason("");
  };

  // Confirmer la suspension
  const handleSuspendShop = () => {
    const reason = suspensionReason.trim();

    if (!selectedShop || !reason) return;

    setShops((currentShops) =>
      currentShops.map((shop) =>
        shop.id === selectedShop.id
          ? {
              ...shop,
              status: "suspended",
              suspensionReason: reason,
            }
          : shop,
      ),
    );

    closeSuspensionModal();
  };

  // Recherche par boutique, commerçant ou téléphone
  const filteredShops = shops.filter((shop) => {
    const query = searchTerm.trim().toLowerCase();
    const phoneQuery = query.replace(/\s/g, "");
    const searchablePhone = shop.phone.replace(/\s/g, "");

    const matchesSearch =
      shop.name.toLowerCase().includes(query) ||
      shop.merchant.toLowerCase().includes(query) ||
      searchablePhone.includes(phoneQuery);

    const matchesFilter =
      activeFilter === "all" || shop.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  // Compter les boutiques pour chaque filtre
  const getFilterCount = (filterValue) => {
    if (filterValue === "all") return shops.length;

    return shops.filter((shop) => shop.status === filterValue).length;
  };

  return (
    <div className="space-y-7">
      {/* En-tête */}
      <div>
        <p className="text-sm font-medium text-teal-700">
          Gestion de la plateforme
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          Gestion des commerçants
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Consultez et gérez les boutiques présentes sur Vendix.
        </p>
      </div>
      {/* Résumé des boutiques */}
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <div>
          <p className="text-xs text-slate-500">Boutiques enregistrées</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {shops.length}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            {getFilterCount("active")} actives
          </span>

          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
            {getFilterCount("suspended")} suspendues
          </span>
        </div>
      </section>

      {/* Recherche et filtres */}
      <section className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-5">
        <div className="relative min-w-0">
          <Search
            size={19}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Rechercher une boutique ou un commerçant..."
            aria-label="Rechercher un commerçant"
            className="block w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/10"
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              aria-pressed={activeFilter === filter.value}
              className={`min-w-0 rounded-lg px-2 py-3 text-center text-xs font-semibold transition-colors sm:text-sm ${
                activeFilter === filter.value
                  ? "bg-teal-700 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      {/* Résultats */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Liste des boutiques</h2>

          <span className="text-xs text-slate-500">
            {filteredShops.length} résultat(s)
          </span>
        </div>

        {filteredShops.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
            <Store size={32} className="mx-auto text-slate-300" />

            <h3 className="mt-3 font-semibold text-slate-800">
              Aucun commerçant trouvé
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Essayez de modifier votre recherche ou vos filtres.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setActiveFilter("all");
              }}
              className="mt-4 text-sm font-semibold text-teal-700 hover:text-teal-800"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <>
            {/* Tableau : ordinateur */}
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-4">Boutique</th>
                      <th className="px-5 py-4">Commerçant</th>
                      <th className="px-5 py-4">Téléphone</th>
                      <th className="px-5 py-4">Ville</th>
                      <th className="px-5 py-4">Statut</th>
                      <th className="px-5 py-4">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredShops.map((shop) => {
                      const status = statusConfig[shop.status];

                      return (
                        <tr
                          key={shop.id}
                          className="transition-colors hover:bg-slate-50/70"
                        >
                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-slate-800">
                              {shop.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              {shop.category}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {shop.merchant}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {shop.phone}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {shop.city}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${status.style}`}
                            >
                              {status.label}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            {shop.status === "active" && (
                              <button
                                type="button"
                                onClick={() => openSuspensionModal(shop)}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                              >
                                Suspendre
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cartes : mobile */}
            <div className="space-y-3 md:hidden">
              {filteredShops.map((shop) => {
                const status = statusConfig[shop.status];

                return (
                  <article
                    key={shop.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                          <Store size={21} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-slate-900">
                            {shop.name}
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            {shop.category}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.style}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                      <p className="flex items-center gap-2 text-xs text-slate-600">
                        <UserRound size={15} className="text-slate-400" />
                        {shop.merchant}
                      </p>

                      <p className="flex items-center gap-2 text-xs text-slate-600">
                        <Phone size={15} className="text-slate-400" />
                        {shop.phone}
                      </p>

                      <p className="flex items-center gap-2 text-xs text-slate-600">
                        <MapPin size={15} className="text-slate-400" />
                        {shop.city}
                      </p>
                    </div>
                    {shop.status === "active" && (
                      <button
                        type="button"
                        onClick={() => openSuspensionModal(shop)}
                        className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                      >
                        Suspendre cette boutique
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
            {selectedShop && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
                onClick={closeSuspensionModal}
              >
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="suspension-modal-title"
                  className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
                  onClick={(event) => event.stopPropagation()}
                >
                  <h2
                    id="suspension-modal-title"
                    className="text-lg font-bold text-slate-900"
                  >
                    Suspendre la boutique
                  </h2>

                  <p className="mt-2 text-sm text-slate-600">
                    Vous êtes sur le point de suspendre{" "}
                    <strong>{selectedShop.name}</strong>. Veuillez indiquer le
                    motif de cette décision.
                  </p>

                  <label
                    htmlFor="suspension-reason"
                    className="mt-5 block text-sm font-medium text-slate-700"
                  >
                    Motif de suspension *
                  </label>

                  <textarea
                    id="suspension-reason"
                    value={suspensionReason}
                    onChange={(event) =>
                      setSuspensionReason(event.target.value)
                    }
                    rows={4}
                    required
                    placeholder="Expliquez la raison de la suspension..."
                    className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10"
                  />

                  <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={closeSuspensionModal}
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      Annuler
                    </button>

                    <button
                      type="button"
                      onClick={handleSuspendShop}
                      disabled={!suspensionReason.trim()}
                      className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Confirmer la suspension
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
