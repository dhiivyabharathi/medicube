import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/Button'

export function Login() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/results" replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ username: username.trim(), password })
      navigate('/results', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-4"
      data-testid="qa-login-page"
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#274e5c_0%,_#12242c_55%,_#1f2327_100%)]"
        aria-hidden
      />
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <p className="text-3xl font-semibold tracking-tight text-brand-950" data-testid="qa-brand">
            Medicube
          </p>
          <p className="mt-1 text-sm font-medium uppercase tracking-[0.18em] text-brand-600">
            QA Dashboard
          </p>
          {/* <p className="mt-3 text-sm text-ink-500">
            Separate from the healthcare product — Playwright results only.
          </p> */}
        </div>

        <form className="space-y-4" onSubmit={handleSubmit} data-testid="qa-login-form">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink-700">Username</span>
            <input
              className="w-full rounded-md border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              data-testid="qa-username-input"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink-700">Password</span>
            <input
              type="password"
              className="w-full rounded-md border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="qa-password-input"
              required
            />
          </label>
          {error ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={loading} data-testid="qa-login-button">
            {loading ? 'Signing in…' : 'Sign in to QA'}
          </Button>
        </form>
        <p className="mt-6 text-center text-xs text-ink-400">
          Demo: <span className="font-medium text-ink-600">admin / test123</span>
        </p>
      </div>
    </div>
  )
}
