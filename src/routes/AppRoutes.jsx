import { Routes, Route } from "react-router-dom";

import AdminLayout from "../components/AdminLayout";
import DashboardPage from "../pages/DashboardPage";
import MerchantsPage from "../pages/MerchantsPage";
import ReportsPage from "../pages/ReportsPage";

export default function AppRoutes({ shops, setShops }) {
  return (
    <Routes>
      //Structure commune de l'administration
      <Route element={<AdminLayout />}>
        //Tableau de bord
        <Route path="/" element={<DashboardPage />} />
        //Gestion des commerçants
        <Route
          path="/commercants"
          element={<MerchantsPage shops={shops} setShops={setShops} />}
        />
        //Gestion des signalements
        <Route
          path="/signalements"
          element={<ReportsPage shops={shops} setShops={setShops} />}
        />
      </Route>
    </Routes>
  );
}
