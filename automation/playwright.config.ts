import { defineConfig, devices } from '@playwright/test'
import { FRONTEND_BASE_URL } from './config/env'

/**
 * Medicube Playwright configuration
 * Base URL points to the Vite healthcare frontend. Auth state is cleared per test
 * so `/` always renders the Login page (Sprint 1 fix).
 *
 * Dashboard reporter posts metrics to the Medicube QA Dashboard (port 5174)
 * (disable with MEDICUBE_PUBLISH=0).
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['./reporters/dashboardReporter.ts'],
  ],
  use: {
    baseURL: FRONTEND_BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run dev',
      cwd: '../backend',
      url: 'http://localhost:3001/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: 'npm run dev',
      cwd: '../frontend',
      url: FRONTEND_BASE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
})
