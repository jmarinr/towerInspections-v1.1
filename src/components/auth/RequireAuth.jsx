import { Navigate, Outlet, useLocation } from 'react-router-dom'

const AUTH_KEY = 'pti_auth_v1'

export function isAuthed() {
  try {
    return localStorage.getItem(AUTH_KEY) === '1'
  } catch {
    return false
  }
}

export function setAuthed(v) {
  try {
    localStorage.setItem(AUTH_KEY, v ? '1' : '0')
  } catch {
    // ignore
  }
}

export default function RequireAuth() {
  const location = useLocation()
  if (!isAuthed()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}
