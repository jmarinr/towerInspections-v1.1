import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAppStore } from '../hooks/useAppStore'

export default function Login() {
  const navigate = useNavigate()
  const setSession = useAppStore((s) => s.setSession)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) { setError('Ingrese su correo electrónico'); return }
    if (!password.trim()) { setError('Ingrese su contraseña'); return }

    setLoading(true)
    try {
      // 1. Supabase Auth sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (authError) {
        setError('Credenciales incorrectas. Verifique su correo y contraseña.')
        setLoading(false)
        return
      }

      // 2. Load profile from app_users
      const { data: profile, error: profileError } = await supabase
        .from('app_users')
        .select('id, full_name, role, company_id, supervisor_id, active, companies(org_code, name)')
        .eq('id', authData.session.user.id)
        .single()

      if (profileError || !profile) {
        setError('No se encontró un perfil de usuario. Contacte al administrador.')
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      if (!profile.active) {
        setError('Su cuenta está desactivada. Contacte al administrador.')
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      // 3. Only inspectors can use this app
      if (profile.role !== 'inspector') {
        setError('Este acceso es solo para inspectores. Use el panel de administración.')
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      // 4. Save session in store
      setSession({
        userId: profile.id,
        username: authData.session.user.email,
        name: profile.full_name,
        role: profile.role,
        roleLabel: 'Inspector',
        orgCode: profile.companies?.org_code || 'PTI',
        companyId: profile.company_id,
        supervisorId: profile.supervisor_id || null,
      })

      navigate('/order')
    } catch (err) {
      console.error('[Login] unexpected error:', err)
      setError('Error inesperado. Intente de nuevo.')
    } finally {
      setLoading(false)
    }
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
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Correo electrónico</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Mail size={18} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              placeholder="inspector@ejemplo.com"
              autoComplete="email"
              autoCapitalize="none"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contraseña</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock size={18} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 active:scale-95"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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

      <p className="text-xs text-gray-400 mt-6">PTI Inspect v2.5.42</p>
      <p className="text-xs text-gray-400 mt-1">
        by{' '}
        <a
          href="http://henkancx.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 underline underline-offset-2 hover:text-gray-600 transition-colors"
        >
          HenkanCX
        </a>
      </p>
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
