import { Routes, Route, Navigate } from "react-router-dom";

import AdminProtectedRoute from "../components/AdminProtectedRoute";
import AdminLayout from "../components/AdminLayout";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import MerchantsPage from "../pages/MerchantsPage";
import ReportsPage from "../pages/ReportsPage";

export default function AppRoutes({
  shops,
  setShops,
  reports,
  setReports,
  dashboardStats,
}) {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<AdminProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route
            path="/"
            element={
              <DashboardPage
                shops={shops}
                reports={reports}
                dashboardStats={dashboardStats}
              />
            }
          />
          <Route
            path="/commercants"
            element={<MerchantsPage shops={shops} setShops={setShops} />}
          />
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

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
