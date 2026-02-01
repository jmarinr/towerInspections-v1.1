import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppStore } from '../../hooks/useAppStore'

export default function RequireAuth() {
  const isAuthenticated = useAppStore(s => s.auth?.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}