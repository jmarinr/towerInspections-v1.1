import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './pages/Home'
import InspeccionSitio from './pages/InspeccionSitio'
import MantenimientoPreventivo from './pages/MantenimientoPreventivo'
import InventarioEquipos from './pages/InventarioEquipos'
import SplashScreen from './components/ui/SplashScreen'
import Toast from './components/ui/Toast'
import { useAppStore } from './hooks/useAppStore'

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const { toast, hideToast } = useAppStore()

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {showSplash && <SplashScreen />}
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Compat: el menú principal usa /inspeccion */}
        <Route path="/inspeccion" element={<InspeccionSitio />} />
        <Route path="/inspeccion/:step" element={<InspeccionSitio />} />
        <Route path="/inspeccion-sitio" element={<InspeccionSitio />} />
        <Route path="/inspeccion-sitio/:step" element={<InspeccionSitio />} />
        <Route path="/mantenimiento" element={<MantenimientoPreventivo />} />
        <Route path="/inventario-equipos/:step?" element={<InventarioEquipos />} />
      </Routes>
      <Toast message={toast.message} type={toast.type} show={toast.show} onClose={hideToast} />
    </>
  )
}

export default App
