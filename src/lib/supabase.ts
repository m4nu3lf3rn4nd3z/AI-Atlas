import { createBrowserClient } from '@supabase/ssr'

// Variables inyectadas en build time por Vite.
// En desarrollo: crea un fichero .env.local con estos valores.
// En producción: configúralas en Cloudflare Pages → Settings → Environment Variables.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Faltan variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY. ' +
      'Crea un fichero .env.local en la raíz del proyecto.',
  )
}

// Cliente de Supabase para el navegador. Singleton por módulo.
export const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export type AuthError = { message: string; status?: number }
