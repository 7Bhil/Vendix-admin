
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import LoginPage from "./pages/LoginPage";
import AppRoutes from "./routes/AppRoutes";
import adminData from "./mocks/adminData.json";

export default function App() {
  // Données initiales des boutiques
  const [shops, setShops] = useState(adminData.shops);

  // Données initiales des signalements
  const [reports, setReports] = useState(adminData.reports);

  return (
    <BrowserRouter>
      <Routes>
        {/* Route publique : connexion */}
        <Route
          path="/login"
          element={<LoginPage />}
        />

        {/* Routes de l'administration */}
        <Route
          path="/*"
          element={
            <AppRoutes
              shops={shops}
              setShops={setShops}
              reports={reports}
              setReports={setReports}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
