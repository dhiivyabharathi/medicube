#!/usr/bin/env node
/**
 * Writes a GitHub Actions Job Summary from Playwright JSON results.
 * Usage: node scripts/ci-summary.mjs [path-to-results.json]
 */
import fs from 'node:fs'
import path from 'node:path'

const resultsPath = path.resolve(
  process.cwd(),
  process.argv[2] ?? 'test-results/results.json',
)

function fail(message) {
  console.error(message)
  process.exitCode = 1
}

if (!fs.existsSync(resultsPath)) {
  fail(`No Playwright JSON report at ${resultsPath}`)
  const summary = process.env.GITHUB_STEP_SUMMARY
  if (summary) {
    fs.appendFileSync(
      summary,
      `## Medicube Playwright\n\n⚠️ JSON report not found at \`${resultsPath}\`.\n`,
    )
  }
  process.exit()
}

const report = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'))
const stats = report.stats ?? {}
const expected = stats.expected ?? 0
const unexpected = stats.unexpected ?? 0
const skipped = stats.skipped ?? 0
const flaky = stats.flaky ?? 0
const durationSec = ((stats.duration ?? 0) / 1000).toFixed(1)
const total = expected + unexpected + skipped + flaky
const passRate = total > 0 ? Math.round((expected / total) * 100) : 0

const lines = [
  '## Medicube Playwright Results',
  '',
  `| Metric | Value |`,
  `| --- | ---: |`,
  `| Total | ${total} |`,
  `| Passed | ${expected} |`,
  `| Failed | ${unexpected} |`,
  `| Skipped | ${skipped} |`,
  `| Flaky | ${flaky} |`,
  `| Pass rate | ${passRate}% |`,
  `| Duration | ${durationSec}s |`,
  '',
  unexpected === 0
    ? '✅ All expected tests passed.'
    : `❌ ${unexpected} test(s) failed. Download the \`playwright-report\` artifact for details.`,
  '',
]

const output = lines.join('\n')
console.log(output)

if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, output)
}
