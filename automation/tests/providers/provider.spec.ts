import { test, expect } from '@playwright/test'
import { LoginPage } from '../../pages/LoginPage'
import { DashboardPage } from '../../pages/DashboardPage'
import { ProvidersPage } from '../../pages/ProvidersPage'

const uniqueMpi = () =>
  `${Date.now()}`.slice(-10).padStart(10, '0')

test.describe('Provider CRUD', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.open()
    await loginPage.login('admin', 'test123')
    await new DashboardPage(page).verifyDashboard()
  })

  test('Add, search, edit, and delete a provider', async ({ page }) => {
    const dashboard = new DashboardPage(page)
    const providers = new ProvidersPage(page)

    const mpi = uniqueMpi()
    const originalName = `Dr QA Automation ${mpi.slice(-4)}`
    const updatedName = `Dr QA Updated ${mpi.slice(-4)}`

    await dashboard.navigateToProviders()
    await providers.expectLoaded()

    await providers.addProvider({
      name: originalName,
      specialty: 'Cardiology',
      mpi,
      status: 'Active',
    })
    await providers.expectProviderVisible(originalName)

    await providers.search(originalName)
    await providers.expectProviderVisible(originalName)

    await providers.editProvider(originalName, {
      name: updatedName,
      specialty: 'Neurology',
    })
    await providers.search(updatedName)
    await providers.expectProviderVisible(updatedName)
    await providers.expectProviderNotVisible(originalName)

    await providers.deleteProvider(updatedName)
    await providers.search(updatedName)
    await expect(page.getByTestId('providers-empty')).toBeVisible()
  })
})
