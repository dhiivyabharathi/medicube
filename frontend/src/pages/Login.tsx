import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/common/Button'

export function Login() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login({ username: username.trim(), password })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4"
      data-testid="login-page"
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,_#2f7a68_0%,_transparent_45%),radial-gradient(ellipse_at_80%_0%,_#1a4038_0%,_transparent_40%),linear-gradient(160deg,#0b1f1b_0%,#16352f_45%,#22262c_100%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}
        aria-hidden
      />

      <div className="relative w-full max-w-md rounded-2xl border border-white/15 bg-white/95 p-8 shadow-2xl backdrop-blur">
        <div className="mb-8 text-center">
          <p
            className="font-display text-3xl font-semibold tracking-tight text-brand-900"
            data-testid="login-brand"
          >
            Medicube
          </p>
          <p className="mt-2 text-sm text-ink-500">Sign in to the healthcare operations console</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit} data-testid="login-form" noValidate>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink-700">Username</span>
            <input
              autoComplete="username"
              className="w-full rounded-md border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              data-testid="username-input"
              placeholder="admin"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink-700">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              className="w-full rounded-md border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="password-input"
              placeholder="••••••••"
              required
            />
          </label>

          {error ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" data-testid="login-error" role="alert">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            data-testid="login-button"
          >
            {loading ? 'Signing in…' : 'Login'}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-ink-400">
          Demo credentials: <span className="font-medium text-ink-600">admin / test123</span>
        </p>
      </div>
    </div>
  )
}
