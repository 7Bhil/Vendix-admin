
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import adminService from '../api/adminService'

export default function AdminProtectedRoute() {
  const location = useLocation()

  const isAuthenticated = adminService.isAuthenticated()

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    )
  }

  return <Outlet />
}
