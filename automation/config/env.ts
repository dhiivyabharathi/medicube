/**
 * Shared frontend base URL for Page Objects.
 * Prefer PLAYWRIGHT_BASE_URL / config baseURL; fall back for IDE/debug runs.
 */
export const FRONTEND_BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:5173'

export const FRONTEND_LOGIN_URL = `${FRONTEND_BASE_URL}/`
