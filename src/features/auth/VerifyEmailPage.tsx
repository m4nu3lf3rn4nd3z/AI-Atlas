import { useState } from 'react'
import { Link } from 'react-router'
import { supabase } from '@/lib/supabase'
import { AuthLayout } from './AuthLayout'

export default function VerifyEmailPage() {
  const [resent, setResent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleResend() {
    setLoading(true)
    const { data } = await supabase.auth.getUser()
    if (data.user?.email) {
      await supabase.auth.resend({
        type: 'signup',
        email: data.user.email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
    }
    setResent(true)
    setLoading(false)
  }

  return (
    <AuthLayout
      title="Confirma tu correo"
      subtitle="Tu cuenta está pendiente de verificación"
    >
      <div className="auth-info">
        <p>
          Hemos enviado un enlace de confirmación a tu correo electrónico.
          Haz clic en él para activar tu cuenta y acceder.
        </p>
        <p className="auth-info-secondary">
          El enlace caduca en 24 horas. Si no lo ves, revisa la carpeta de spam.
        </p>
      </div>

      {resent ? (
        <p className="auth-success">Correo reenviado. Revisa tu bandeja de entrada.</p>
      ) : (
        <button className="auth-btn auth-btn--secondary" onClick={handleResend} disabled={loading}>
          {loading ? 'Enviando…' : 'Reenviar correo de confirmación'}
        </button>
      )}

      <p className="auth-footer">
        <Link to="/login">Volver al acceso</Link>
        {' · '}
        <button
          className="auth-link-btn"
          onClick={() => supabase.auth.signOut()}
        >
          Cerrar sesión
        </button>
      </p>
    </AuthLayout>
  )
}
