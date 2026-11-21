
import { useEffect, useState } from 'react'
import { BrowserRouter } from 'react-router-dom'

import AppRoutes from './routes/AppRoutes'
import { adminService } from './api/adminService'

export default function App() {
  const [shops, setShops] = useState([])
  const [reports, setReports] = useState([])
  const [dashboardStats, setDashboardStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        setLoading(true)
        setError('')

        const [merchantsData, reportsData, statsData] = await Promise.all([
          adminService.getMerchants(),
          adminService.getReports(),
          adminService.getDashboardStats(),
        ])

        setShops(merchantsData)
        setReports(reportsData)
        setDashboardStats(statsData)
      } catch (err) {
        setError(
          err.message || 'Impossible de charger les données administrateur.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadAdminData()
  }, [])

  return (
    <BrowserRouter>
      {loading ? (
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-gray-600">
            Chargement des données administrateur...
          </p>
        </div>
      ) : error ? (
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <AppRoutes
          shops={shops}
          setShops={setShops}
          reports={reports}
          setReports={setReports}
          dashboardStats={dashboardStats}
        />
      )}
    </BrowserRouter>
  )
}
