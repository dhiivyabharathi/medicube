import { test, expect } from '@playwright/test'

const API = 'http://localhost:3001/api'

async function authHeaders(request: import('@playwright/test').APIRequestContext) {
  const login = await request.post(`${API}/auth/login`, {
    data: { username: 'admin', password: 'test123' },
  })
  const { token } = await login.json()
  return { Authorization: `Bearer ${token}` }
}

test.describe('API — Automation dashboard ingest', () => {
  test('POST /automation/results publishes summary and results', async ({ request }) => {
    const headers = await authHeaders(request)

    const payload = {
      summary: {
        total: 2,
        passed: 2,
        failed: 0,
        skipped: 0,
        durationMs: 3500,
        latestRunAt: '2026-07-19 12:00 UTC',
        suiteName: 'Medicube API Ingest Suite',
      },
      results: [
        {
          id: 'TR-API-1',
          title: 'Ingest smoke test A',
          suite: 'api',
          status: 'passed',
          durationMs: 1200,
        },
        {
          id: 'TR-API-2',
          title: 'Ingest smoke test B',
          suite: 'api',
          status: 'passed',
          durationMs: 2300,
        },
      ],
    }

    const publish = await request.post(`${API}/automation/results`, {
      headers,
      data: payload,
    })
    expect(publish.status()).toBe(201)

    const body = await publish.json()
    expect(body.summary.suiteName).toBe('Medicube API Ingest Suite')
    expect(body.results).toHaveLength(2)

    const summary = await request.get(`${API}/automation/summary`, { headers })
    expect(summary.ok()).toBeTruthy()
    expect((await summary.json()).total).toBe(2)

    const history = await request.get(`${API}/automation/history`, { headers })
    expect(history.ok()).toBeTruthy()
    const runs = await history.json()
    expect(runs[0].suiteName).toBe('Medicube API Ingest Suite')
  })
})
