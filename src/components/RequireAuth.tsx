import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/auth-context'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { ready, signedIn, profile, profileError } = useAuth()

  if (!ready || (signedIn && !profile && !profileError)) {
    return <p className="status">Открываем кабинет…</p>
  }

  if (!signedIn || !profile) {
    return <Navigate to="/login" replace />
  }

  return children
}

export function GuestOnly({ children }: { children: ReactNode }) {
  const { ready, signedIn, profile, profileError } = useAuth()

  if (!ready || (signedIn && !profile && !profileError)) {
    return <p className="status">Проверяем вход…</p>
  }

  if (profile) {
    return <Navigate to="/cabinet/overview" replace />
  }

  return children
}
