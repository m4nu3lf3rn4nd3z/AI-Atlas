import { useState } from 'react'
import { Link } from 'react-router'
import { supabase } from '@/lib/supabase'
import { AuthLayout } from './AuthLayout'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // La URL de callback a la que Supabase redirigirá tras confirmar el email.
        // Debe estar en la lista de Redirect URLs del proyecto de Supabase.
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      // Mensaje genérico para no revelar si el email ya existe
      setError('No se pudo completar el registro. Inténtalo de nuevo.')
      setLoading(false)
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <AuthLayout
        title="Confirma tu correo"
        subtitle={`Hemos enviado un enlace de verificación a ${email}`}
      >
        <div className="auth-info">
          <p>
            Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
            El enlace caduca en 24 horas.
          </p>
          <p className="auth-info-secondary">
            ¿No lo ves? Revisa la carpeta de spam.
          </p>
        </div>
        <p className="auth-footer">
          <Link to="/login">Volver al acceso</Link>
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Crear cuenta" subtitle="Accede a todos los labs y el mapa del ecosistema">
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
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
          />
        </div>

        <div className="auth-field">
          <label htmlFor="confirm">Confirmar contraseña</label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repite la contraseña"
          />
        </div>

        {error && <p className="auth-error" role="alert">{error}</p>}

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>

      <p className="auth-footer">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login">Accede aquí</Link>
      </p>
    </AuthLayout>
  )
}
