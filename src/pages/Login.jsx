import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Lock, User } from 'lucide-react'
import { useAppStore } from '../hooks/useAppStore'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAppStore(s => s.login)
  const showToast = useAppStore(s => s.showToast)

  const from = useMemo(() => location.state?.from || '/', [location.state])

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const ok = login(username, password)
      if (!ok) {
        showToast('Usuario o contraseña incorrectos', 'error')
        return
      }
      navigate(from, { replace: true })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 pt-8 pb-6 bg-gradient-to-br from-primary/10 via-white to-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-sm">
                <Lock size={22} />
              </div>
              <div>
                <div className="text-lg font-extrabold text-gray-900 leading-tight">PTI Inspect</div>
                <div className="text-sm text-gray-600">Inicia sesión para continuar</div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 pb-7">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">Usuario</label>
                <div className="mt-2 flex items-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-2xl bg-white focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition">
                  <User size={18} className="text-gray-400" />
                  <input
                    inputMode="numeric"
                    className="w-full outline-none text-[15px] placeholder:text-gray-400"
                    placeholder="101010"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Contraseña</label>
                <div className="mt-2 flex items-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-2xl bg-white focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition">
                  <Lock size={18} className="text-gray-400" />
                  <input
                    type="password"
                    inputMode="numeric"
                    className="w-full outline-none text-[15px] placeholder:text-gray-400"
                    placeholder="101010"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full py-3.5 rounded-2xl bg-primary text-white font-extrabold shadow-sm active:scale-[0.99] disabled:opacity-60"
              >
                {busy ? 'Ingresando…' : 'Ingresar'}
              </button>

              <div className="text-center text-xs text-gray-500">
                Versión v1.1.7
              </div>
            </div>
          </form>
        </div>

        <div className="mt-4 text-center text-xs text-gray-400">
          Acceso rápido para técnicos en campo
        </div>
      </div>
    </div>
  )
}