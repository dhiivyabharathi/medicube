import { test } from '@playwright/test'
import { LoginPage } from '../../pages/LoginPage'
import { DashboardPage } from '../../pages/DashboardPage'
import { MedicalRecordsPage } from '../../pages/MedicalRecordsPage'

test.describe('Medical record workflows', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.open()
    await loginPage.login('admin', 'test123')
    await new DashboardPage(page).verifyDashboard()
  })

  test('Create and verify a medical record', async ({ page }) => {
    const dashboard = new DashboardPage(page)
    const records = new MedicalRecordsPage(page)

    const diagnosis = `QA Asthma Screen ${Date.now().toString().slice(-6)}`

    await dashboard.navigateToMedicalRecords()
    await records.expectLoaded()

    await records.createRecord({
      patientNameContains: 'Elena Martinez',
      diagnosis,
      providerName: 'Dr Sarah Lee',
    })

    await records.expectRecordVisible(diagnosis, 'Elena Martinez')
  })
})
