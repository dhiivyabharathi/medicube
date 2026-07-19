import { useCallback, useEffect, useState } from 'react'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { StatCard } from '../components/StatCard'
import { useAuth } from '../context/AuthContext'
import { automationService } from '../services/api'
import type {
  AutomationRunHistoryItem,
  AutomationRunSummary,
  TestResultItem,
} from '../types'

const POLL_INTERVAL_MS = 10_000

export function Results() {
  const { user, logout } = useAuth()
  const [summary, setSummary] = useState<AutomationRunSummary | null>(null)
  const [results, setResults] = useState<TestResultItem[]>([])
  const [history, setHistory] = useState<AutomationRunHistoryItem[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)

  const load = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoading(true)
    try {
      const [summaryData, resultsData, historyData] = await Promise.all([
        automationService.getSummary(),
        automationService.getResults(),
        automationService.getHistory(),
      ])
      setSummary(summaryData)
      setResults(resultsData)
      setHistory(historyData)
      setLastSyncedAt(new Date().toLocaleTimeString())
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load results')
    } finally {
      if (showSpinner) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(true)
    const timer = window.setInterval(() => void load(false), POLL_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [load])

  const passRate =
    summary && summary.total > 0
      ? Math.round((summary.passed / summary.total) * 100)
      : 0

  return (
    <div className="min-h-screen" data-testid="qa-results-page">
      <header className="border-b border-ink-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-xl font-semibold tracking-tight text-brand-950" data-testid="qa-brand-name">
              Medicube
            </p>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-brand-600">
              QA Automation Dashboard
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-ink-800">{user?.displayName}</p>
              <p className="text-xs text-ink-500">QA access</p>
            </div>
            <Button variant="secondary" onClick={logout} data-testid="qa-logout-button">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          {/* <div>
            <h1 className="text-2xl font-semibold text-ink-900">Test execution results</h1>
            <p className="mt-1 text-sm text-ink-500">
              Published from Playwright — not part of the Medicube healthcare product UI.
            </p>
          </div> */}
          <div className="flex items-center gap-3">
            {lastSyncedAt ? (
              <p className="text-xs text-ink-400" data-testid="automation-last-synced">
                Synced {lastSyncedAt}
              </p>
            ) : null}
            <Button
              variant="secondary"
              onClick={() => void load(true)}
              disabled={loading}
              data-testid="automation-refresh-button"
            >
              {loading ? 'Refreshing…' : 'Refresh'}
            </Button>
          </div>
        </div>

        {error ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5" data-testid="automation-kpis">
          <StatCard label="Total Tests" value={summary?.total ?? '—'} testId="metric-total" />
          <StatCard label="Passed" value={summary?.passed ?? '—'} testId="metric-passed" />
          <StatCard label="Failed" value={summary?.failed ?? '—'} testId="metric-failed" />
          <StatCard label="Skipped" value={summary?.skipped ?? '—'} testId="metric-skipped" />
          <StatCard
            label="Execution Time"
            value={summary ? `${(summary.durationMs / 1000).toFixed(1)}s` : '—'}
            hint={summary ? `${passRate}% pass · ${summary.latestRunAt}` : undefined}
            testId="metric-duration"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <Card title="Latest run" testId="automation-results">
            <div className="mb-3 text-sm text-ink-500">
              Suite:{' '}
              <span className="font-medium text-ink-800" data-testid="automation-suite-name">
                {summary?.suiteName ?? '—'}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-ink-200 text-xs uppercase tracking-wide text-ink-500">
                  <tr>
                    <th className="px-3 py-2 font-medium">Test</th>
                    <th className="px-3 py-2 font-medium">Suite</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result.id} className="border-b border-ink-100">
                      <td className="px-3 py-3">
                        <p className="font-medium text-ink-800">{result.title}</p>
                        {result.errorMessage ? (
                          <p className="mt-0.5 text-xs text-red-600">{result.errorMessage}</p>
                        ) : null}
                      </td>
                      <td className="px-3 py-3">{result.suite}</td>
                      <td className="px-3 py-3 capitalize">{result.status}</td>
                      <td className="px-3 py-3 font-mono text-xs">{result.durationMs} ms</td>
                    </tr>
                  ))}
                  {results.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-8 text-center text-ink-400">
                        No results yet. Run Playwright from the automation package.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Run history" testId="automation-history">
            <ul className="space-y-3">
              {history.map((run) => (
                <li key={run.id} className="rounded-lg border border-ink-100 bg-ink-50/70 px-3 py-3">
                  <div className="flex justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-ink-800">{run.suiteName}</p>
                      <p className="text-xs text-ink-500">{run.latestRunAt}</p>
                    </div>
                    <p className="text-xs font-semibold text-brand-800">
                      {run.passed}/{run.total}
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-ink-500">
                    {run.failed} failed · {run.skipped} skipped · {(run.durationMs / 1000).toFixed(1)}s
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </main>
    </div>
  )
}
