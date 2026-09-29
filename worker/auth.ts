/**
 * Cloudflare Pages Worker — autenticación de borde
 *
 * Intercepta TODOS los requests antes de servir cualquier fichero estático.
 * Verifica el JWT de Supabase con la clave pública (RS256/ES256) del proyecto.
 *
 * Rutas públicas (no requieren sesión):
 *   /login  /register  /verify-email  /auth/*  /forgot-password  /reset-password
 *
 * Variables de entorno requeridas (Cloudflare Pages → Settings → Environment variables):
 *   SUPABASE_URL        URL de tu proyecto Supabase (https://xxxx.supabase.co)
 *   SUPABASE_ANON_KEY   Clave pública anon del proyecto
 *   SUPABASE_JWT_SECRET Clave JWT del proyecto (Settings → API → JWT Secret)
 */

export interface Env {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  SUPABASE_JWT_SECRET: string
  ASSETS: Fetcher // Assets estáticos de Cloudflare Pages
}

// Rutas que no requieren autenticación
const PUBLIC_PATHS = new Set([
  '/login',
  '/register',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
])

const PUBLIC_PREFIXES = ['/auth/']

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return true
  // Favicon y archivos de sistema
  if (pathname === '/favicon.svg' || pathname === '/robots.txt') return true
  return false
}

// Parsea las cookies de la cabecera Cookie
function parseCookies(cookieHeader: string): Record<string, string> {
  return Object.fromEntries(
    cookieHeader
      .split(';')
      .map((c) => c.trim().split('='))
      .filter((p) => p.length === 2)
      .map(([k, v]) => [k.trim(), decodeURIComponent(v.trim())]),
  )
}

// Extrae el JWT del Bearer header o de la cookie de Supabase
function extractToken(request: Request, cookies: Record<string, string>): string | null {
  // 1. Cookie de Supabase (sb-<project-ref>-auth-token)
  const sbCookie = Object.keys(cookies).find(
    (k) => k.startsWith('sb-') && k.endsWith('-auth-token'),
  )
  if (sbCookie) {
    try {
      const parsed = JSON.parse(cookies[sbCookie])
      if (parsed?.access_token) return parsed.access_token as string
    } catch {
      // cookie malformada
    }
  }

  // 2. Authorization: Bearer <token>
  const auth = request.headers.get('Authorization')
  if (auth?.startsWith('Bearer ')) return auth.slice(7)

  return null
}

// Verifica el JWT con la clave secreta de Supabase usando Web Crypto API
async function verifySupabaseJWT(
  token: string,
  secret: string,
): Promise<{ valid: boolean; emailConfirmed: boolean }> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return { valid: false, emailConfirmed: false }

    const [headerB64, payloadB64, signatureB64] = parts

    // Decodifica y verifica la firma HMAC-SHA256 (Supabase usa HS256 por defecto)
    const encoder = new TextEncoder()
    const data = encoder.encode(`${headerB64}.${payloadB64}`)
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    )

    const signature = Uint8Array.from(
      atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')),
      (c) => c.charCodeAt(0),
    )

    const valid = await crypto.subtle.verify('HMAC', keyMaterial, signature, data)
    if (!valid) return { valid: false, emailConfirmed: false }

    // Decodifica el payload para verificar expiración y email confirmado
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'))) as {
      exp?: number
      email_confirmed_at?: string
      aud?: string
    }

    // Verifica expiración
    if (!payload.exp || Date.now() / 1000 > payload.exp) {
      return { valid: false, emailConfirmed: false }
    }

    // Verifica audiencia (debe ser 'authenticated')
    if (payload.aud !== 'authenticated') {
      return { valid: false, emailConfirmed: false }
    }

    const emailConfirmed = Boolean(payload.email_confirmed_at)
    return { valid: true, emailConfirmed }
  } catch {
    // Cualquier error en la verificación → acceso denegado (fail-closed)
    return { valid: false, emailConfirmed: false }
  }
}

function redirectTo(url: URL, path: string): Response {
  const dest = new URL(path, url.origin)
  // Guarda la URL original para redirigir después del login
  if (path === '/login' && url.pathname !== '/') {
    dest.searchParams.set('redirect', url.pathname)
  }
  return Response.redirect(dest.toString(), 302)
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const pathname = url.pathname

    // --- Rutas públicas: sirve directamente sin verificar auth ---
    if (isPublicPath(pathname)) {
      return env.ASSETS.fetch(request)
    }

    // --- Assets estáticos del bundle (JS, CSS, fonts): requieren auth ---
    // Sirve los assets solo si el usuario está autenticado.
    // Esto evita que alguien descargue el bundle directamente.
    const cookies = parseCookies(request.headers.get('Cookie') ?? '')
    const token = extractToken(request, cookies)

    // Fail-closed: si no hay token o no es válido → redirige al login
    if (!token) {
      // Para requests de assets (JS/CSS/fonts/images), devuelve 401 en vez de redirect
      if (pathname.startsWith('/assets/') || pathname.startsWith('/fonts/')) {
        return new Response('Unauthorized', { status: 401 })
      }
      return redirectTo(url, '/login')
    }

    const { valid, emailConfirmed } = await verifySupabaseJWT(token, env.SUPABASE_JWT_SECRET)

    if (!valid) {
      if (pathname.startsWith('/assets/') || pathname.startsWith('/fonts/')) {
        return new Response('Unauthorized', { status: 401 })
      }
      return redirectTo(url, '/login')
    }

    if (!emailConfirmed) {
      if (pathname.startsWith('/assets/') || pathname.startsWith('/fonts/')) {
        return new Response('Forbidden', { status: 403 })
      }
      return redirectTo(url, '/verify-email')
    }

    // --- Autenticado y email confirmado: sirve el contenido ---
    const response = await env.ASSETS.fetch(request)

    // Añade cabeceras de seguridad a todas las respuestas
    const headers = new Headers(response.headers)
    headers.set('X-Frame-Options', 'DENY')
    headers.set('X-Content-Type-Options', 'nosniff')
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    headers.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'wasm-unsafe-eval'", // wasm para transformers.js
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob:",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
        "worker-src 'self' blob:",
        "frame-ancestors 'none'",
      ].join('; '),
    )
    // HSTS: fuerza HTTPS durante 1 año
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  },
}
