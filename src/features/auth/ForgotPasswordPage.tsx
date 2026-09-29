import { useState } from 'react'
import { Link } from 'react-router'
import { supabase } from '@/lib/supabase'
import { AuthLayout } from './AuthLayout'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    // Siempre mostramos "enviado" aunque el email no exista (evita enumeración)
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })

    setSent(true)
  }

  if (sent) {
    return (
      <AuthLayout title="Revisa tu correo">
        <div className="auth-info">
          <p>
            Si existe una cuenta con ese correo, habrás recibido un enlace para
            restablecer tu contraseña. Caduca en 1 hora.
          </p>
        </div>
        <p className="auth-footer">
          <Link to="/login">Volver al acceso</Link>
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Recuperar contraseña"
      subtitle="Te enviaremos un enlace para restablecerla"
    >
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

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? 'Enviando…' : 'Enviar enlace'}
        </button>
      </form>

      <p className="auth-footer">
        <Link to="/login">Volver al acceso</Link>
      </p>
    </AuthLayout>
  )
}
