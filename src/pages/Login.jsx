import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { setAuthed } from '../components/auth/RequireAuth'

export default function Login() {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [touched, setTouched] = useState(false)
  const [show, setShow] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const isOk = useMemo(() => user.trim() === '101010' && pass.trim() === '101010', [user, pass])
  const showError = touched && !isOk

  const from = (location.state && location.state.from) ? location.state.from : '/'

  const submit = (e) => {
    e.preventDefault()
    setTouched(true)
    if (!isOk) return
    setAuthed(true)
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
            <span className="text-2xl font-black text-primary">PTI</span>
          </div>
          <h1 className="mt-3 text-xl font-extrabold text-gray-900">PTI Inspect</h1>
          <p className="text-sm text-gray-500 mt-1">Inicia sesión para continuar</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Usuario</label>
            <input
              value={user}
              onChange={(e) => setUser(e.target.value)}
              onBlur={() => setTouched(true)}
              inputMode="numeric"
              placeholder="101010"
              className={`w-full px-4 py-3 text-[15px] border-2 rounded-xl bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 ${touched && user.trim() ? 'border-emerald-500' : 'border-gray-200'}`}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña</label>
            <div className="relative">
              <input
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                onBlur={() => setTouched(true)}
                type={show ? 'text' : 'password'}
                placeholder="101010"
                className={`w-full px-4 py-3 pr-20 text-[15px] border-2 rounded-xl bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 ${touched && pass.trim() ? 'border-emerald-500' : 'border-gray-200'}`}
              />
              <button
                type="button"
                onClick={() => setShow(s => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 bg-gray-100 active:scale-95"
              >
                {show ? 'Ocultar' : 'Ver'}
              </button>
            </div>
          </div>

          {showError && (
            <p className="text-sm font-semibold text-red-600">⚠ Usuario o contraseña incorrectos</p>
          )}

          <button
            type="submit"
            className={`w-full py-3 rounded-xl font-extrabold text-white bg-primary active:scale-[0.99] transition-all ${(!user.trim() || !pass.trim()) ? 'opacity-60' : ''}`}
          >
            Entrar
          </button>

          <p className="text-xs text-gray-400 text-center">Phoenix Tower International © 2026</p>
        </form>
      </div>
    </div>
  )
}
