export interface AuthUser {
  username: string
  displayName: string
  role: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  user: AuthUser
  token: string
}

export interface AutomationRunSummary {
  total: number
  passed: number
  failed: number
  skipped: number
  durationMs: number
  latestRunAt: string
  suiteName: string
}

export interface AutomationRunHistoryItem extends AutomationRunSummary {
  id: string
}

export interface TestResultItem {
  id: string
  title: string
  suite: string
  status: 'passed' | 'failed' | 'skipped'
  durationMs: number
  errorMessage?: string
}
