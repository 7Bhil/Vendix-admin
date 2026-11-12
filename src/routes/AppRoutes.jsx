
import { Routes, Route } from 'react-router-dom'

import AdminLayout from '../components/AdminLayout'
import DashboardPage from '../pages/DashboardPage'
import MerchantsPage from '../pages/MerchantsPage'
import ReportsPage from '../pages/ReportsPage'

export default function AppRoutes() {
  return (
    <Routes>
      //Structure commune de l'administration
      <Route element={<AdminLayout />}>
        //Tableau de bord
        <Route path="/" element={<DashboardPage />} />

        //Gestion des commerçants
        <Route path="/commercants" element={<MerchantsPage />} />

        //Gestion des signalements
        <Route path="/signalements" element={<ReportsPage />} />
      </Route>
    </Routes>
  )
}
