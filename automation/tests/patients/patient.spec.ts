import { test, expect } from '@playwright/test'
import { LoginPage } from '../../pages/LoginPage'
import { DashboardPage } from '../../pages/DashboardPage'
import { PatientsPage } from '../../pages/PatientsPage'

test.describe('Patient workflows', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.open()
    await loginPage.login('admin', 'test123')
    await new DashboardPage(page).verifyDashboard()
  })

  test('Create, search, update, and delete a patient', async ({ page }) => {
    const dashboard = new DashboardPage(page)
    const patients = new PatientsPage(page)

    const suffix = `${Date.now()}`.slice(-6)
    const original = {
      firstName: 'Ava',
      lastName: `QA${suffix}`,
      dateOfBirth: '1992-06-15',
      mrn: `MRN-QA-${suffix}`,
      status: 'Active',
    }
    const updatedLastName = `Updated${suffix}`
    const originalName = patients.fullName(original)
    const updatedName = `${original.firstName} ${updatedLastName}`

    await dashboard.navigateToPatients()
    await patients.expectLoaded()

    await patients.createPatient(original)
    await patients.expectPatientVisible(originalName)

    await patients.search(original.mrn)
    await patients.expectPatientVisible(originalName)

    await patients.updatePatient(originalName, { lastName: updatedLastName })
    await patients.search(updatedLastName)
    await patients.expectPatientVisible(updatedName)
    await patients.expectPatientNotVisible(originalName)

    await patients.deletePatient(updatedName)
    await patients.search(updatedLastName)
    await expect(page.getByTestId('patients-empty')).toBeVisible()
  })
})
