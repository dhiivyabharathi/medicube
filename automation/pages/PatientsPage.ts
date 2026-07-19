import { type Locator, type Page, expect } from '@playwright/test'

export interface PatientFormData {
  firstName: string
  lastName: string
  dateOfBirth: string
  mrn: string
  status?: string
}

export class PatientsPage {
  readonly page: Page
  readonly patientsPage: Locator
  readonly searchInput: Locator
  readonly table: Locator
  readonly form: Locator

  constructor(page: Page) {
    this.page = page
    this.patientsPage = page.getByTestId('patients-page')
    this.searchInput = page.getByTestId('patient-search-input')
    this.table = page.getByTestId('patients-table')
    this.form = page.getByTestId('patient-form')
  }

  async expectLoaded(): Promise<void> {
    await expect(this.patientsPage).toBeVisible()
    await expect(this.table).toBeVisible()
  }

  async createPatient(data: PatientFormData): Promise<void> {
    await this.page.getByTestId('patient-firstname-input').fill(data.firstName)
    await this.page.getByTestId('patient-lastname-input').fill(data.lastName)
    await this.page.getByTestId('patient-dob-input').fill(data.dateOfBirth)
    await this.page.getByTestId('patient-mrn-input').fill(data.mrn)
    if (data.status) {
      await this.page.getByTestId('patient-status-input').selectOption(data.status)
    }
    await this.page.getByTestId('patient-form-submit').click()
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term)
  }

  fullName(data: Pick<PatientFormData, 'firstName' | 'lastName'>): string {
    return `${data.firstName} ${data.lastName}`
  }

  async expectPatientVisible(name: string): Promise<void> {
    await expect(this.table.getByTestId('patient-name').filter({ hasText: name })).toBeVisible()
  }

  async expectPatientNotVisible(name: string): Promise<void> {
    await expect(this.table.getByTestId('patient-name').filter({ hasText: name })).toHaveCount(0)
  }

  async getPatientIdByName(name: string): Promise<string> {
    const row = this.page.locator('[data-testid^="patient-row-"]', { hasText: name }).first()
    await expect(row).toBeVisible()
    const testId = await row.getAttribute('data-testid')
    if (!testId) throw new Error(`Patient row for ${name} missing data-testid`)
    return testId.replace('patient-row-', '')
  }

  async updatePatient(name: string, updates: Partial<PatientFormData>): Promise<void> {
    const id = await this.getPatientIdByName(name)
    await this.page.getByTestId(`edit-patient-${id}`).click()

    if (updates.firstName) {
      await this.page.getByTestId('patient-firstname-input').fill(updates.firstName)
    }
    if (updates.lastName) {
      await this.page.getByTestId('patient-lastname-input').fill(updates.lastName)
    }
    if (updates.dateOfBirth) {
      await this.page.getByTestId('patient-dob-input').fill(updates.dateOfBirth)
    }
    if (updates.mrn) {
      await this.page.getByTestId('patient-mrn-input').fill(updates.mrn)
    }
    if (updates.status) {
      await this.page.getByTestId('patient-status-input').selectOption(updates.status)
    }

    await this.page.getByTestId('patient-form-submit').click()
  }

  async deletePatient(name: string): Promise<void> {
    const id = await this.getPatientIdByName(name)
    this.page.once('dialog', (dialog) => dialog.accept())
    await this.page.getByTestId(`delete-patient-${id}`).click()
    await this.expectPatientNotVisible(name)
  }
}
