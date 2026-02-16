import { useEffect, useRef } from 'react'
import { WifiOff, RefreshCw, AlertTriangle, Check } from 'lucide-react'
import { useAppStore } from '../../hooks/useAppStore'
import { getPendingSyncCount } from '../../lib/supabaseSync'

export default function ConnectivityBanner() {
  const isOnline = useAppStore((s) => s.isOnline)
  const syncStatus = useAppStore((s) => s.syncStatus)
  const pendingSyncCount = useAppStore((s) => s.pendingSyncCount)
  const setOnline = useAppStore((s) => s.setOnline)
  const setPendingSyncCount = useAppStore((s) => s.setPendingSyncCount)
  const setSyncStatus = useAppStore((s) => s.setSyncStatus)
  const showReconnected = useRef(false)

  // Listen for online/offline events
  useEffect(() => {
    const goOnline = () => {
      setOnline(true)
      showReconnected.current = true
      setSyncStatus('syncing')
      // After 4 seconds, clear the "reconnected" banner
      setTimeout(() => {
        showReconnected.current = false
        setSyncStatus('idle')
      }, 4000)
    }
    const goOffline = () => {
      setOnline(false)
      setSyncStatus('offline')
    }

    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)

    // Set initial state
    setOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [setOnline, setSyncStatus])

  // Periodically check pending sync count
  useEffect(() => {
    const check = () => setPendingSyncCount(getPendingSyncCount())
    check()
    const interval = setInterval(check, 5000)
    return () => clearInterval(interval)
  }, [setPendingSyncCount])

  // Don't show anything when all is good
  if (isOnline && syncStatus === 'idle' && pendingSyncCount === 0) {
    return null
  }

  // Determine banner style
  let bg, icon, message

  if (!isOnline) {
    bg = 'bg-amber-500'
    icon = <WifiOff size={14} strokeWidth={2.5} />
    message = 'Sin conexión — los datos se guardan localmente'
  } else if (syncStatus === 'syncing' || pendingSyncCount > 0) {
    bg = 'bg-blue-500'
    icon = <RefreshCw size={14} className="animate-spin" strokeWidth={2.5} />
    message = pendingSyncCount > 0
      ? `Sincronizando ${pendingSyncCount} elemento${pendingSyncCount > 1 ? 's' : ''} pendiente${pendingSyncCount > 1 ? 's' : ''}...`
      : 'Conexión recuperada — sincronizando...'
  } else if (syncStatus === 'error') {
    bg = 'bg-red-500'
    icon = <AlertTriangle size={14} strokeWidth={2.5} />
    message = 'Error al sincronizar — se reintentará automáticamente'
  } else {
    return null
  }

  return (
    <div className={`${bg} text-white px-4 py-2 flex items-center justify-center gap-2 text-xs font-semibold z-[200]`}>
      {icon}
      <span>{message}</span>
    </div>
  )
}
