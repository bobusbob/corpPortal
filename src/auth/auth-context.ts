import { createContext, useContext } from 'react'
import type { Profile } from '../lib/database'
import type { LoginInput, RegisterInput, RegisterResult } from './types'

export type AuthContextValue = {
  ready: boolean
  signedIn: boolean
  profile: Profile | null
  profileError: string | null
  register: (input: RegisterInput) => Promise<RegisterResult>
  login: (input: LoginInput) => Promise<string | null>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error('useAuth используется вне AuthProvider')
  }
  return value
}
