import type {
  AutomationRunHistoryItem,
  AutomationRunSummary,
  LoginCredentials,
  LoginResponse,
  TestResultItem,
} from '../types'
import { getStoredAuth } from '../utils/authStorage'

const API_BASE = '/api'

class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const auth = getStoredAuth()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  }

  if (auth?.token) {
    ;(headers as Record<string, string>)['Authorization'] = `Bearer ${auth.token}`
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const body = (await response.json()) as { message?: string }
      if (body.message) message = body.message
    } catch {
      // ignore
    }
    throw new ApiError(message, response.status)
  }

  return (await response.json()) as T
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  },
}

export const automationService = {
  async getSummary(): Promise<AutomationRunSummary> {
    return request<AutomationRunSummary>('/automation/summary')
  },
  async getResults(): Promise<TestResultItem[]> {
    return request<TestResultItem[]>('/automation/results')
  },
  async getHistory(): Promise<AutomationRunHistoryItem[]> {
    return request<AutomationRunHistoryItem[]>('/automation/history')
  },
}
