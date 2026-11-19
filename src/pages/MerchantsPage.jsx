
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Store,
  MapPin,
  Phone,
  UserRound,
  Ban,
  CheckCircle2,
  Building2,
  AlertTriangle,
  X,
  ShieldAlert,
  ArrowUpRight,
  RotateCcw,
} from "lucide-react";

const statusConfig = {
  active: {
    label: "Active",
    style: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15",
    dot: "bg-emerald-500",
  },
  suspended: {
    label: "Suspendue",
    style: "bg-rose-50 text-rose-700 ring-1 ring-rose-600/15",
    dot: "bg-rose-500",
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
  const [selectedShop, setSelectedShop] = useState(null);
  const [suspensionReason, setSuspensionReason] = useState("");

  const activeCount = shops.filter(
    (shop) => shop.status === "active"
  ).length;

  const suspendedCount = shops.filter(
    (shop) => shop.status === "suspended"
  ).length;

  const filteredShops = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const phoneQuery = query.replace(/\s/g, "");

    return shops.filter((shop) => {
      const searchablePhone = (shop.phone || "").replace(/\s/g, "");

      const matchesSearch =
        shop.name.toLowerCase().includes(query) ||
        shop.merchant.toLowerCase().includes(query) ||
        searchablePhone.includes(phoneQuery) ||
        shop.city.toLowerCase().includes(query);

      const matchesFilter =
        activeFilter === "all" || shop.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [shops, searchTerm, activeFilter]);

  const getFilterCount = (value) => {
    if (value === "all") return shops.length;
    return shops.filter((shop) => shop.status === value).length;
  };

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

  const openSuspensionModal = (shop) => {
    setSelectedShop(shop);
    setSuspensionReason("");
  };

  const closeSuspensionModal = () => {
    setSelectedShop(null);
    setSuspensionReason("");
  };

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
          : shop
      )
    );

    closeSuspensionModal();
  };

  const resetFilters = () => {
    setSearchTerm("");
    setActiveFilter("all");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-8">

      {/* En-tête */}
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal-600" />
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
              Gestion de la plateforme
            </p>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Commerçants
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Gérez les boutiques inscrites sur Vendix, consultez leurs
            informations et contrôlez leur statut.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm sm:self-auto">
          <ShieldAlert size={17} className="text-teal-700" />
          <span className="text-xs font-semibold text-slate-600">
            Espace Super-Admin
          </span>
        </div>
      </section>

      {/* Statistiques */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Building2 size={21} />
            </div>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
              Total
            </span>
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Boutiques enregistrées
          </p>

          <div className="mt-1 flex items-end justify-between">
            <p className="text-3xl font-bold tracking-tight text-slate-900">
              {shops.length}
            </p>
            <Store size={20} className="mb-1 text-slate-300" />
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 size={21} />
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              En activité
            </span>
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Boutiques actives
          </p>

          <div className="mt-1 flex items-end justify-between">
            <p className="text-3xl font-bold tracking-tight text-slate-900">
              {activeCount}
            </p>
            <ArrowUpRight size={20} className="mb-1 text-emerald-500" />
          </div>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{
                width: `${shops.length ? (activeCount / shops.length) * 100 : 0}%`,
              }}
            />
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
              <Ban size={21} />
            </div>
            <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700">
              Suspendues
            </span>
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Boutiques suspendues
          </p>

          <div className="mt-1 flex items-end justify-between">
            <p className="text-3xl font-bold tracking-tight text-slate-900">
              {suspendedCount}
            </p>
            <AlertTriangle size={20} className="mb-1 text-rose-400" />
          </div>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-rose-500 transition-all"
              style={{
                width: `${shops.length ? (suspendedCount / shops.length) * 100 : 0}%`,
              }}
            />
          </div>
        </article>

      </section>

      {/* Recherche et filtres */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-bold text-slate-900">
                Annuaire des boutiques
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Recherchez et filtrez les commerçants de la plateforme.
              </p>
            </div>

            {(searchTerm || activeFilter !== "all") && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-2 self-start text-xs font-semibold text-teal-700 transition hover:text-teal-900"
              >
                <RotateCcw size={14} />
                Réinitialiser
              </button>
            )}
          </div>

          <div className="relative mt-5">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Nom de boutique, commerçant, téléphone ou ville..."
              aria-label="Rechercher un commerçant"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const isActive = activeFilter === filter.value;

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setActiveFilter(filter.value)}
                  aria-pressed={isActive}
                  className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-xs font-semibold transition ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {filter.label}

                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] ${
                      isActive
                        ? "bg-white/15 text-white"
                        : "bg-white text-slate-500"
                    }`}
                  >
                    {getFilterCount(filter.value)}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-xs text-slate-500">
            <span className="font-bold text-slate-900">
              {filteredShops.length}
            </span>{" "}
            résultat(s)
          </p>
        </div>
      </section>

      {/* Liste des boutiques */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-bold text-slate-900">
              Liste des boutiques
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Informations et statut des commerçants.
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
            <Store size={19} />
          </div>
        </div>

        {filteredShops.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Search size={25} />
            </div>

            <h3 className="mt-4 font-bold text-slate-800">
              Aucun commerçant trouvé
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
              Aucun résultat ne correspond à votre recherche.
              Essayez de modifier vos mots-clés ou vos filtres.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-teal-800"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <>
            {/* Tableau ordinateur */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    {[
                      "Boutique",
                      "Commerçant",
                      "Téléphone",
                      "Localisation",
                      "Statut",
                      "Action",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="whitespace-nowrap px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredShops.map((shop) => {
                    const status = statusConfig[shop.status] || statusConfig.active;

                    return (
                      <tr
                        key={shop.id}
                        className="group transition-colors hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 transition group-hover:bg-teal-100">
                              <Store size={19} />
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-800">
                                {shop.name}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                {shop.category}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-slate-700">
                            {shop.merchant}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                          {shop.phone}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <MapPin size={15} className="shrink-0 text-slate-400" />
                            {shop.city}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold ${status.style}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {shop.status === "active" ? (
                            <button
                              type="button"
                              onClick={() => openSuspensionModal(shop)}
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                            >
                              <Ban size={14} />
                              Suspendre
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400">
                              Aucune action
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Cartes mobiles */}
            <div className="space-y-3 p-4 md:hidden">
              {filteredShops.map((shop) => {
                const status = statusConfig[shop.status] || statusConfig.active;

                return (
                  <article
                    key={shop.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                          <Store size={20} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-slate-900">
                            {shop.name}
                          </h3>
                          <p className="mt-1 text-xs text-slate-500">
                            {shop.category}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${status.style}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                      <p className="flex items-center gap-3 text-xs text-slate-600">
                        <UserRound size={15} className="shrink-0 text-slate-400" />
                        {shop.merchant}
                      </p>

                      <p className="flex items-center gap-3 text-xs text-slate-600">
                        <Phone size={15} className="shrink-0 text-slate-400" />
                        {shop.phone}
                      </p>

                      <p className="flex items-center gap-3 text-xs text-slate-600">
                        <MapPin size={15} className="shrink-0 text-slate-400" />
                        {shop.city}
                      </p>
                    </div>

                    {shop.status === "active" && (
                      <button
                        type="button"
                        onClick={() => openSuspensionModal(shop)}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
                      >
                        <Ban size={15} />
                        Suspendre cette boutique
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* Modal de suspension */}
      {selectedShop && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={closeSuspensionModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="suspension-modal-title"
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <ShieldAlert size={22} />
                </div>

                <div>
                  <h2
                    id="suspension-modal-title"
                    className="font-bold text-slate-900"
                  >
                    Suspendre la boutique
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Action de modération
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeSuspensionModal}
                aria-label="Fermer"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={19} />
              </button>
            </div>

            <div className="p-6">
              <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-4">
                <p className="text-sm leading-6 text-slate-700">
                  Vous êtes sur le point de suspendre la boutique{" "}
                  <strong className="font-bold text-slate-900">
                    {selectedShop.name}
                  </strong>.
                  Cette action désactivera son statut sur la plateforme.
                </p>
              </div>

              <label
                htmlFor="suspension-reason"
                className="mt-5 block text-sm font-bold text-slate-800"
              >
                Motif de suspension
                <span className="ml-1 text-rose-600">*</span>
              </label>

              <textarea
                id="suspension-reason"
                value={suspensionReason}
                onChange={(event) =>
                  setSuspensionReason(event.target.value)
                }
                rows={4}
                required
                maxLength={500}
                placeholder="Expliquez clairement la raison de cette décision..."
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
              />

              <p className="mt-1 text-right text-[11px] text-slate-400">
                {suspensionReason.length}/500 caractères
              </p>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeSuspensionModal}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Annuler
                </button>

                <button
                  type="button"
                  onClick={handleSuspendShop}
                  disabled={!suspensionReason.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Ban size={16} />
                  Confirmer la suspension
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
