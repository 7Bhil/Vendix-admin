import { Routes, Route } from "react-router-dom";

import AdminLayout from "../components/AdminLayout";
import DashboardPage from "../pages/DashboardPage";
import MerchantsPage from "../pages/MerchantsPage";
import ReportsPage from "../pages/ReportsPage";

export default function AppRoutes({ shops, setShops, reports, setReports }) {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route
          path="/"
          element={<DashboardPage shops={shops} reports={reports} />}
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
    </Routes>
  );
}
