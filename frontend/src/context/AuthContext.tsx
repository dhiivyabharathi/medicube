import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AuthUser, LoginCredentials } from '../types'
import { authService } from '../services/healthcare'
import {
  clearStoredAuth,
  getStoredAuth,
  setStoredAuth,
  type StoredAuth,
} from '../utils/authStorage'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function toUser(stored: StoredAuth): AuthUser {
  return {
    username: stored.username,
    displayName: stored.displayName,
    role: stored.role,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = getStoredAuth()
    return stored ? toUser(stored) : null
  })

  const login = useCallback(async (credentials: LoginCredentials) => {
    const { user: authUser, token } = await authService.login(credentials)
    setStoredAuth({
      token,
      username: authUser.username,
      displayName: authUser.displayName,
      role: authUser.role,
    })
    setUser(authUser)
  }, [])

  const logout = useCallback(() => {
    clearStoredAuth()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      login,
      logout,
    }),
    [user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
