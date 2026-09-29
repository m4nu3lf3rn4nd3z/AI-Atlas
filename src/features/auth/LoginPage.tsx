import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { supabase } from '@/lib/supabase'
import { AuthLayout } from './AuthLayout'

export default function LoginPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirectTo = params.get('redirect') ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      // Mensaje genérico: no revela si el email existe (previene enumeración)
      setError('Credenciales incorrectas o cuenta no verificada.')
      setLoading(false)
      return
    }

    navigate(redirectTo, { replace: true })
  }

  return (
    <AuthLayout title="Acceder" subtitle="Introduce tus credenciales para continuar">
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-field">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
          />
        </div>

        <div className="auth-field">
          <label htmlFor="password">
            Contraseña
            <Link to="/forgot-password" className="auth-field-link">
              ¿La olvidaste?
            </Link>
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && <p className="auth-error" role="alert">{error}</p>}

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? 'Accediendo…' : 'Acceder'}
        </button>
      </form>

      <p className="auth-footer">
        ¿No tienes cuenta?{' '}
        <Link to="/register">Regístrate gratis</Link>
      </p>
    </AuthLayout>
  )
}
