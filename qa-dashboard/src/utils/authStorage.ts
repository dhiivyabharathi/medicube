import type { AuthUser } from '../types'

const AUTH_STORAGE_KEY = 'medicube_qa_auth'

export interface StoredAuth {
  token: string
  username: string
  displayName: string
  role: string
}

export function getStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredAuth
    if (!parsed.token || !parsed.username) return null
    return parsed
  } catch {
    return null
  }
}

export function setStoredAuth(auth: StoredAuth): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
}

export function clearStoredAuth(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

export function toAuthUser(stored: StoredAuth): AuthUser {
  return {
    username: stored.username,
    displayName: stored.displayName,
    role: stored.role,
  }
}
