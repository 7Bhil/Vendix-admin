
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import LoginPage from './pages/LoginPage'
import AdminProtectedRoute from './components/AdminProtectedRoute'
import AdminLayout from './components/layout/AdminLayout'
import DashboardPage from './pages/DashboardPage'

// Tableau de bord
function AdminHomePage() {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
      <h1 className="text-2xl font-bold text-white">
        Tableau de bord administrateur
      </h1>
      <p className="text-slate-400 mt-2">
        Bienvenue dans votre espace d'administration Vendix.
      </p>
    </section>
  )
}

// Gestion des commerçants
function CommercantsPage() {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
      <h1 className="text-2xl font-bold text-white">
        Gestion des commerçants
      </h1>
      <p className="text-slate-400 mt-2">
        Cette page permettra de gérer les commerçants de Vendix.
      </p>
    </section>
  )
}

// Gestion des signalements
function SignalementsPage() {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
      <h1 className="text-2xl font-bold text-white">
        Gestion des signalements
      </h1>
      <p className="text-slate-400 mt-2">
        Cette page permettra de consulter et traiter les signalements.
      </p>
    </section>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Route publique : connexion */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protection de toutes les routes administrateur */}
        <Route element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>

            {/* Tableau de bord */}
            <Route path="/" element={<DashboardPage />} />

            {/* Gestion des commerçants */}
            <Route path="/commercants" element={<CommercantsPage />} />

            {/* Gestion des signalements */}
            <Route path="/signalements" element={<SignalementsPage />} />

          </Route>
        </Route>

        {/* Redirection des routes inconnues */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}
