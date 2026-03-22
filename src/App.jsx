import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './pages/Home'
import InspeccionSitio from './pages/InspeccionSitio'
import MantenimientoPreventivo from './pages/MantenimientoPreventivo'
import InventarioEquipos from './pages/InventarioEquipos'
import InventarioEquiposV2 from './pages/InventarioEquiposV2'
import SafetyClimbingDevice from './pages/SafetyClimbingDevice'
import GroundingSystemTest from './pages/GroundingSystemTest'
import AdditionalPhotoReport from './pages/AdditionalPhotoReport'
import PreventiveMaintenanceExecuted from './pages/PreventiveMaintenanceExecuted'
import Login from './pages/Login'
import OrderScreen from './pages/OrderScreen'
import FormIntro from './pages/FormIntro'
import SplashScreen from './components/ui/SplashScreen'
import Toast from './components/ui/Toast'
import ConnectivityBanner from './components/ui/ConnectivityBanner'
import { useAppStore } from './hooks/useAppStore'
import { startSupabaseBackgroundSync } from './lib/supabaseSync'
import { supabase } from './lib/supabaseClient'
import RequireAuth from './components/auth/RequireAuth'

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-6">
        <div className="text-lg font-extrabold text-gray-900">Página no encontrada</div>
        <p className="mt-2 text-sm text-gray-600">La ruta no existe o cambió en esta versión.</p>
        <a
          href="#/"
          className="inline-flex mt-5 px-4 py-2 rounded-xl bg-gray-900 text-white font-semibold"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  )
}

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const { toast, hideToast, logout } = useAppStore()


  useEffect(() => {
    startSupabaseBackgroundSync()
  }, [])

  // ── Session watchdog: if Supabase token expires/invalidates, force logout ──
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        logout()
      }
    })
    return () => subscription.unsubscribe()
  }, [logout])

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {showSplash && <SplashScreen />}
      <ConnectivityBanner />
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas */}
        <Route element={<RequireAuth />}>
          <Route path="/order" element={<OrderScreen />} />
          <Route path="/" element={<Home />} />
          <Route path="/intro/:formId" element={<FormIntro />} />

          {/* Compat: el menú principal usa /inspeccion */}
          <Route path="/inspeccion" element={<InspeccionSitio />} />
          <Route path="/inspeccion/:step" element={<InspeccionSitio />} />
          <Route path="/inspeccion-sitio" element={<InspeccionSitio />} />
          <Route path="/inspeccion-sitio/:step" element={<InspeccionSitio />} />

          <Route path="/mantenimiento" element={<MantenimientoPreventivo />} />
          {/* Alias para compatibilidad (evita pantalla en blanco si se usa este path) */}
          <Route path="/mantenimiento-preventivo" element={<MantenimientoPreventivo />} />

          <Route path="/mantenimiento-ejecutado" element={<PreventiveMaintenanceExecuted />} />

          <Route path="/inventario-equipos" element={<InventarioEquipos />} />
          <Route path="/inventario-equipos/:step" element={<InventarioEquipos />} />

          <Route path="/inventario-equipos-v2" element={<InventarioEquiposV2 />} />
          <Route path="/inventario-equipos-v2/:step" element={<InventarioEquiposV2 />} />

          <Route path="/safety-climbing-device" element={<SafetyClimbingDevice />} />
          <Route path="/sistema-ascenso" element={<SafetyClimbingDevice />} />

          <Route path="/grounding-system-test" element={<GroundingSystemTest />} />

          <Route path="/reporte-fotos" element={<AdditionalPhotoReport />} />

          {/* Fallback para evitar pantalla en blanco en rutas no registradas */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toast message={toast.message} type={toast.type} show={toast.show} onClose={hideToast} />
    </>
  )
}

export default App
