import type { Session, User } from '@supabase/supabase-js'
import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthStore {
  status: AuthStatus
  user: User | null
  session: Session | null
  init: () => Promise<() => void>
  signOut: () => Promise<void>
}

export const useAuth = create<AuthStore>((set) => ({
  status: 'loading',
  user: null,
  session: null,

  init: async () => {
    // Carga la sesión inicial
    const { data } = await supabase.auth.getSession()
    set({
      status: data.session ? 'authenticated' : 'unauthenticated',
      user: data.session?.user ?? null,
      session: data.session,
    })

    // Suscripción a cambios de sesión (login, logout, refresh)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      set({
        status: session ? 'authenticated' : 'unauthenticated',
        user: session?.user ?? null,
        session,
      })
    })

    return () => listener.subscription.unsubscribe()
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ status: 'unauthenticated', user: null, session: null })
  },
}))
