
import { Routes, Route, Navigate } from "react-router-dom";

import AdminProtectedRoute from "../components/AdminProtectedRoute";
import AdminLayout from "../components/AdminLayout";

import DashboardPage from "../pages/DashboardPage";
import MerchantsPage from "../pages/MerchantsPage";
import ReportsPage from "../pages/ReportsPage";

export default function AppRoutes({
  shops,
  setShops,
  reports,
  setReports,
}) {
  return (
    <Routes>
      {/* Protection de toutes les pages administrateur */}
      <Route element={<AdminProtectedRoute />}>
        <Route element={<AdminLayout />}>
          {/* Tableau de bord */}
          <Route
            path="/"
            element={
              <DashboardPage
                shops={shops}
                reports={reports}
              />
            }
          />

          {/* Gestion des commerçants */}
          <Route
            path="/commercants"
            element={
              <MerchantsPage
                shops={shops}
                setShops={setShops}
              />
            }
          />

          {/* Gestion des signalements */}
          <Route
            path="/signalements"
            element={
              <ReportsPage
                shops={shops}
                setShops={setShops}
                reports={reports}
                setReports={setReports}
              />
            }
          />
        </Route>
      </Route>

      {/* Redirection des routes inconnues */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}
