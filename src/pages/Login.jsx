import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, User, Eye, EyeOff } from 'lucide-react'
import { authenticate } from '../lib/auth'
import { useAppStore } from '../hooks/useAppStore'

export default function Login() {
  const navigate = useNavigate()
  const setSession = useAppStore((s) => s.setSession)

  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!username.trim()) {
      setError('Ingrese su usuario')
      return
    }
    if (!pin.trim()) {
      setError('Ingrese su PIN')
      return
    }

    setLoading(true)

    setTimeout(() => {
      const result = authenticate(username, pin)

      if (!result.success) {
        setError(result.error)
        setLoading(false)
        return
      }

      setSession(result.user)
      setLoading(false)
      navigate('/order')
    }, 300)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-3xl">🗼</span>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">PTI Inspect</h1>
        <p className="text-sm text-gray-500 mt-1">Ingrese sus credenciales</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Usuario</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <User size={18} />
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError('') }}
              placeholder="Ej: inspector1"
              autoComplete="username"
              autoCapitalize="none"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">PIN</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock size={18} />
            </div>
            <input
              type={showPin ? 'text' : 'password'}
              value={pin}
              onChange={(e) => { setPin(e.target.value); setError('') }}
              placeholder="••••"
              inputMode="numeric"
              maxLength={6}
              autoComplete="current-password"
              className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-300 text-sm font-medium tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 active:scale-95"
            >
              {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
            <p className="text-sm font-semibold text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all active:scale-[0.98] ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary shadow-sm hover:shadow-md'
          }`}
        >
          {loading ? 'Verificando...' : 'Ingresar'}
        </button>
      </form>

      <p className="text-xs text-gray-400 mt-6">PTI Inspect v2.0.5</p>
      <button
        type="button"
        onClick={() => {
          if (window.confirm('¿Borrar todos los datos locales? Se perderán formularios no enviados.')) {
            localStorage.clear()
            window.location.reload()
          }
        }}
        className="mt-2 text-[11px] text-gray-300 underline underline-offset-2 active:text-red-400"
      >
        Borrar datos locales
      </button>
    </div>
  )
}
