import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import MerchantsPage from './pages/MerchantsPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="commercants" element={<MerchantsPage />} />
          <Route path="signalements" element={<ReportsPage />} />
        </Route>
        {/* Redirection racine vers /admin */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
