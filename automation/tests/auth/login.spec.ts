import { test, expect } from '@playwright/test'
import { LoginPage } from '../../pages/LoginPage'
import { DashboardPage } from '../../pages/DashboardPage'

test.describe('Authentication', () => {
  test('Admin login should work', async ({ page }) => {
    const loginPage = new LoginPage(page)
    const dashboard = new DashboardPage(page)

    await loginPage.open()
    await expect(page.getByTestId('login-page')).toBeVisible()
    await expect(page.getByTestId('dashboard-page')).toHaveCount(0)

    await loginPage.login('admin', 'test123')
    await dashboard.verifyDashboard()
  })

  test('Invalid credentials show an error', async ({ page }) => {
    const loginPage = new LoginPage(page)

    await loginPage.open()
    await loginPage.login('admin', 'wrong-password')
    await loginPage.expectLoginError(/invalid/i)
    await expect(page).toHaveURL('/')
    await expect(page.getByTestId('login-page')).toBeVisible()
  })

  test('Unauthenticated users cannot access dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    await page.evaluate(() => localStorage.clear())
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/')
    await expect(page.getByTestId('login-page')).toBeVisible()
  })
})
