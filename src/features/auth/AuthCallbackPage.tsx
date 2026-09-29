import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { supabase } from '@/lib/supabase'
import { AuthLayout } from './AuthLayout'

// Maneja el callback de Supabase tras confirmar el email o restablecer la contraseña.
// Supabase redirige a /auth/callback?code=xxx (PKCE) o con tokens en el hash.
export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function handleCallback() {
      const code = params.get('code')

      if (!code) {
        const hashParams = new URLSearchParams(window.location.hash.slice(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const type = hashParams.get('type')

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          if (cancelled) return
          if (error) {
            setError('El enlace ha expirado o ya fue usado. Solicita uno nuevo.')
            return
          }
          navigate(type === 'recovery' ? '/reset-password' : '/', { replace: true })
          return
        }

        if (!cancelled) setError('Enlace inválido.')
        return
      }

      // Intercambia el code por una sesión (flujo PKCE — más seguro)
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (cancelled) return
      if (error) {
        setError('El enlace ha expirado o ya fue usado. Solicita uno nuevo.')
        return
      }
      navigate('/', { replace: true })
    }

    handleCallback()
    return () => { cancelled = true }
  }, [navigate, params])

  if (error) {
    return (
      <AuthLayout title="Enlace inválido">
        <p className="auth-error" role="alert">{error}</p>
        <p className="auth-footer">
          <a href="/login">Volver al acceso</a>
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Verificando…">
      <p className="auth-info">Confirmando tu cuenta, un momento…</p>
    </AuthLayout>
  )
}
