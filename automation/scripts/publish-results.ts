import fs from 'node:fs'
import path from 'node:path'
import { parsePlaywrightJson, publishToMedicubeApi } from '../reporters/dashboardReporter'

async function main(): Promise<void> {
  const resultsPath = path.resolve(
    process.cwd(),
    process.env.PLAYWRIGHT_JSON_OUTPUT ?? 'test-results/results.json',
  )
  const apiBaseUrl =
    process.env.MEDICUBE_API_URL ?? process.env.CARESYNC_API_URL ?? 'http://localhost:3001'

  if (!fs.existsSync(resultsPath)) {
    throw new Error(
      `Playwright JSON report not found at ${resultsPath}. Run tests first (npm test).`,
    )
  }

  const raw = JSON.parse(fs.readFileSync(resultsPath, 'utf-8')) as unknown
  const payload = parsePlaywrightJson(raw)

  await publishToMedicubeApi(payload, { apiBaseUrl })

  console.log('Published Medicube automation results:')
  console.log(`  Total:   ${payload.summary.total}`)
  console.log(`  Passed:  ${payload.summary.passed}`)
  console.log(`  Failed:  ${payload.summary.failed}`)
  console.log(`  Skipped: ${payload.summary.skipped}`)
  console.log(`  Duration:${payload.summary.durationMs} ms`)
  console.log(`  API:     ${apiBaseUrl}`)
  console.log(`  QA UI:   http://localhost:5174`)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
