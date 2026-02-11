import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppStore } from '../../hooks/useAppStore'

export default function RequireAuth() {
  const session = useAppStore((s) => s.session)
  const location = useLocation()

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
