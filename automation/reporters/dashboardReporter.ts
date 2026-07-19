import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter'

export interface ParsedTestResult {
  id: string
  title: string
  suite: string
  status: 'passed' | 'failed' | 'skipped'
  durationMs: number
  errorMessage?: string
}

export interface ParsedRunSummary {
  total: number
  passed: number
  failed: number
  skipped: number
  durationMs: number
  latestRunAt: string
  suiteName: string
}

export interface ParsedAutomationPayload {
  summary: ParsedRunSummary
  results: ParsedTestResult[]
}

function mapStatus(status: TestResult['status']): ParsedTestResult['status'] {
  if (status === 'passed' || status === 'timedOut' || status === 'interrupted') {
    return status === 'passed' ? 'passed' : 'failed'
  }
  if (status === 'skipped') return 'skipped'
  return 'failed'
}

function collectTests(suite: Suite, parentTitles: string[] = []): ParsedTestResult[] {
  const suitePath = [...parentTitles, suite.title].filter(Boolean)
  const results: ParsedTestResult[] = []

  for (const test of suite.tests) {
    results.push(toParsedResult(test, suitePath))
  }

  for (const child of suite.suites) {
    results.push(...collectTests(child, suitePath))
  }

  return results
}

function toParsedResult(test: TestCase, suitePath: string[]): ParsedTestResult {
  const last = test.results[test.results.length - 1]
  const status = last ? mapStatus(last.status) : 'skipped'
  const durationMs = last?.duration ?? 0
  const errorMessage = last?.error?.message?.split('\n')[0]

  const suiteName =
    suitePath.filter((part) => part && !part.endsWith('.spec.ts')).pop() ??
    suitePath[0] ??
    'Medicube'

  return {
    id: `TR-${test.id}`,
    title: test.title,
    suite: suiteName,
    status,
    durationMs: Math.round(durationMs),
    errorMessage,
  }
}

export function buildPayloadFromSuite(
  rootSuite: Suite,
  result: FullResult,
  suiteName = 'Medicube Playwright Suite',
): ParsedAutomationPayload {
  const results = collectTests(rootSuite).filter((item) => item.title)
  const passed = results.filter((r) => r.status === 'passed').length
  const failed = results.filter((r) => r.status === 'failed').length
  const skipped = results.filter((r) => r.status === 'skipped').length

  return {
    summary: {
      total: results.length,
      passed,
      failed,
      skipped,
      durationMs: Math.round(result.duration),
      latestRunAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      suiteName,
    },
    results,
  }
}

/** Parse Playwright JSON reporter output (`test-results/results.json`). */
export function parsePlaywrightJson(report: unknown): ParsedAutomationPayload {
  const root = report as {
    stats?: {
      duration?: number
      expected?: number
      unexpected?: number
      skipped?: number
      flaky?: number
      startTime?: string
    }
    suites?: JsonSuite[]
  }

  const results = flattenJsonSuites(root.suites ?? [])
  const passed = results.filter((r) => r.status === 'passed').length
  const failed = results.filter((r) => r.status === 'failed').length
  const skipped = results.filter((r) => r.status === 'skipped').length
  const durationMs = Math.round(root.stats?.duration ?? results.reduce((sum, r) => sum + r.durationMs, 0))

  return {
    summary: {
      total: results.length,
      passed,
      failed,
      skipped,
      durationMs,
      latestRunAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      suiteName: 'Medicube Playwright Suite',
    },
    results,
  }
}

interface JsonSuite {
  title: string
  file?: string
  suites?: JsonSuite[]
  specs?: Array<{
    title: string
    ok?: boolean
    tests?: Array<{
      status?: string
      results?: Array<{
        status?: string
        duration?: number
        error?: { message?: string }
      }>
    }>
  }>
}

function flattenJsonSuites(suites: JsonSuite[], parent: string[] = []): ParsedTestResult[] {
  const items: ParsedTestResult[] = []

  for (const suite of suites) {
    const path = [...parent, suite.title].filter(Boolean)
    const suiteLabel =
      path.filter((part) => part && !part.endsWith('.spec.ts')).pop() ?? path[0] ?? 'suite'

    for (const spec of suite.specs ?? []) {
      const test = spec.tests?.[0]
      const lastResult = test?.results?.[test.results.length - 1]
      const rawStatus = lastResult?.status ?? test?.status ?? (spec.ok ? 'passed' : 'failed')
      const status: ParsedTestResult['status'] =
        rawStatus === 'passed' || rawStatus === 'expected'
          ? 'passed'
          : rawStatus === 'skipped'
            ? 'skipped'
            : 'failed'

      items.push({
        id: `TR-${items.length + 1}-${spec.title.slice(0, 24).replace(/\s+/g, '-')}`,
        title: spec.title,
        suite: suiteLabel,
        status,
        durationMs: Math.round(lastResult?.duration ?? 0),
        errorMessage: lastResult?.error?.message?.split('\n')[0],
      })
    }

    items.push(...flattenJsonSuites(suite.suites ?? [], path))
  }

  return items
}

export async function publishToMedicubeApi(
  payload: ParsedAutomationPayload,
  options: {
    apiBaseUrl: string
    username?: string
    password?: string
  },
): Promise<void> {
  const apiBaseUrl = options.apiBaseUrl.replace(/\/$/, '')
  const username = options.username ?? 'admin'
  const password = options.password ?? 'test123'

  const loginRes = await fetch(`${apiBaseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  if (!loginRes.ok) {
    throw new Error(`Login failed (${loginRes.status}) while publishing results`)
  }

  const { token } = (await loginRes.json()) as { token: string }

  const publishRes = await fetch(`${apiBaseUrl}/api/automation/results`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!publishRes.ok) {
    const body = await publishRes.text()
    throw new Error(`Publish failed (${publishRes.status}): ${body}`)
  }
}

/** @deprecated Use publishToMedicubeApi */
export const publishToCareSyncApi = publishToMedicubeApi

/**
 * Playwright reporter that posts run metrics to the Medicube QA Dashboard.
 * Disable with MEDICUBE_PUBLISH=0 (or CARESYNC_PUBLISH=0).
 * Override API with MEDICUBE_API_URL (or CARESYNC_API_URL).
 */
class MedicubeDashboardReporter implements Reporter {
  private rootSuite: Suite | undefined
  private config: FullConfig | undefined

  onBegin(config: FullConfig, suite: Suite): void {
    this.config = config
    this.rootSuite = suite
  }

  async onEnd(result: FullResult): Promise<void> {
    if (process.env.MEDICUBE_PUBLISH === '0' || process.env.CARESYNC_PUBLISH === '0') return
    if (!this.rootSuite) return

    const apiBaseUrl =
      process.env.MEDICUBE_API_URL ?? process.env.CARESYNC_API_URL ?? 'http://localhost:3001'
    const payload = buildPayloadFromSuite(this.rootSuite, result)

    try {
      await publishToMedicubeApi(payload, { apiBaseUrl })
      console.log(
        `[Medicube] Published ${payload.summary.total} results to QA Dashboard (${apiBaseUrl})`,
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.warn(`[Medicube] Could not publish results: ${message}`)
      void this.config
    }
  }
}

export default MedicubeDashboardReporter
