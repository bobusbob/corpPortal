import { useEffect, useState, type ReactNode } from 'react'
import { AuthContext, type AuthContextValue } from './auth-context'
import { translateAuthError } from './messages'
import type { LoginInput, RegisterInput, RegisterResult } from './types'
import type { Profile } from '../lib/database'
import { authRedirectUrl, supabase } from '../lib/supabase'

const profileColumns = 'id, email, username, full_name, avatar_url, role, created_at' as const

async function loadProfile(userId: string): Promise<{ profile: Profile | null; error: string | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .select(profileColumns)
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    return { profile: null, error: 'Не удалось загрузить профиль.' }
  }

  if (!data) {
    return {
      profile: null,
      error: 'Профиль не найден. Если регистрация только что прошла, подтвердите почту и войдите снова.',
    }
  }

  return { profile: data, error: null }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    async function sync(userId: string | null) {
      if (!userId) {
        if (ignore) return
        setSignedIn(false)
        setProfile(null)
        setProfileError(null)
        setReady(true)
        return
      }

      setSignedIn(true)

      const result = await loadProfile(userId)
      if (ignore) return
      setProfile(result.profile)
      setProfileError(result.error)
      setReady(true)
    }

    void supabase.auth.getUser().then(({ data }) => {
      void sync(data.user?.id ?? null)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => {
        void sync(session?.user.id ?? null)
      }, 0)
    })

    return () => {
      ignore = true
      listener.subscription.unsubscribe()
    }
  }, [])

  async function register(input: RegisterInput): Promise<RegisterResult> {
    const username = input.username.trim()
    const { data: available, error: availabilityError } = await supabase.rpc('is_username_available', {
      candidate: username,
    })

    if (availabilityError) {
      return { status: 'error', message: 'Не удалось проверить имя пользователя. Попробуйте ещё раз.' }
    }

    if (!available) {
      return {
        status: 'error',
        field: 'username',
        message: 'Это имя пользователя уже занято или записано неверно.',
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email: input.email.trim(),
      password: input.password,
      options: {
        data: {
          username,
          full_name: input.fullName.trim(),
        },
        emailRedirectTo: authRedirectUrl(),
      },
    })

    if (error) {
      const translated = translateAuthError(error.message)
      return { status: 'error', message: translated.text, field: translated.field }
    }

    const identities = data.user?.identities
    if (data.user && Array.isArray(identities) && identities.length === 0) {
      return {
        status: 'error',
        field: 'email',
        message: 'Такая почта уже зарегистрирована. Войдите в кабинет.',
      }
    }

    if (data.session) {
      return { status: 'signed-in' }
    }

    return { status: 'confirm-email' }
  }

  async function login(input: LoginInput): Promise<string | null> {
    const { data: email, error: lookupError } = await supabase.rpc('email_for_login', {
      login_name: input.username.trim(),
    })

    if (lookupError || !email) {
      return 'Неверное имя пользователя или пароль.'
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: input.password,
    })

    if (error) {
      const text = error.message.toLowerCase()
      if (text.includes('email not confirmed')) {
        return 'Почта ещё не подтверждена. Откройте письмо от Supabase и перейдите по ссылке.'
      }
      return 'Неверное имя пользователя или пароль.'
    }

    return null
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  async function refreshProfile() {
    const { data } = await supabase.auth.getUser()
    if (!data.user) return
    const result = await loadProfile(data.user.id)
    setProfile(result.profile)
    setProfileError(result.error)
  }

  const value: AuthContextValue = {
    ready,
    signedIn,
    profile,
    profileError,
    register,
    login,
    logout,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
