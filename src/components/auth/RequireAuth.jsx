import { useEffect, useRef } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppStore } from '../../hooks/useAppStore'
import { supabase } from '../../lib/supabaseClient'
import { getDeviceId } from '../../lib/deviceId'

const WATCHDOG_INTERVAL = 5 * 60 * 1000  // 5 minutes
const WATCHDOG_INITIAL  = 10 * 1000      // 10 seconds after mount

export default function RequireAuth() {
  const session  = useAppStore((s) => s.session)
  const logout   = useAppStore((s) => s.logout)
  const location = useLocation()
  const timerRef = useRef(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    // Only run when session is active — this component only mounts when logged in
    if (!session?.userId) return

    const deviceId = getDeviceId()

    const checkSession = async () => {
      if (!navigator.onLine) return

      try {
        const { data, error } = await supabase
          .from('app_users')
          .select('active_device_id')
          .eq('id', session.userId)
          .maybeSingle()

        if (error || !data) return

        const activeDevice = data.active_device_id
        console.log(`[SessionWatch] mine=${deviceId.slice(0,8)} active=${activeDevice?.slice(0,8)}`)

        if (activeDevice && activeDevice !== deviceId) {
          console.warn('[SessionWatch] displaced — logging out')
          useAppStore.setState({ displacedByDevice: true })
          setTimeout(() => {
            useAppStore.getState().logout({ clearDevice: false })
          }, 100)
        }
      } catch (e) {
        console.warn('[SessionWatch] error:', e?.message)
      }
    }

    // First check after 10 seconds, then every 5 minutes
    timerRef.current    = setTimeout(checkSession, WATCHDOG_INITIAL)
    intervalRef.current = setInterval(checkSession, WATCHDOG_INTERVAL)

    console.log('[SessionWatch] started — deviceId:', deviceId.slice(0,8))

    return () => {
      clearTimeout(timerRef.current)
      clearInterval(intervalRef.current)
    }
  }, [session?.userId]) // re-run if userId changes (login/logout)

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
