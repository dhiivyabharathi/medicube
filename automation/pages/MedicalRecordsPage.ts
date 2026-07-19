import { type Locator, type Page, expect } from '@playwright/test'

export interface MedicalRecordFormData {
  /** Exact option label text, e.g. "Elena Martinez (MRN-880412)" */
  patientOptionLabel?: string
  diagnosis: string
  providerName?: string
}

export class MedicalRecordsPage {
  readonly page: Page
  readonly recordsPage: Locator
  readonly table: Locator
  readonly form: Locator

  constructor(page: Page) {
    this.page = page
    this.recordsPage = page.getByTestId('medical-records-page')
    this.table = page.getByTestId('medical-records-table')
    this.form = page.getByTestId('medical-record-form')
  }

  async expectLoaded(): Promise<void> {
    await expect(this.recordsPage).toBeVisible()
    await expect(this.table).toBeVisible()
    await expect(this.form).toBeVisible()
  }

  async selectPatientContaining(text: string): Promise<void> {
    const select = this.page.getByTestId('record-patient-input')
    const option = select.locator('option', { hasText: text }).first()
    const value = await option.getAttribute('value')
    if (!value) throw new Error(`No patient option containing "${text}"`)
    await select.selectOption(value)
  }

  async createRecord(data: MedicalRecordFormData & { patientNameContains?: string }): Promise<void> {
    if (data.patientNameContains) {
      await this.selectPatientContaining(data.patientNameContains)
    } else if (data.patientOptionLabel) {
      await this.page.getByTestId('record-patient-input').selectOption({ label: data.patientOptionLabel })
    }
    await this.page.getByTestId('record-diagnosis-input').fill(data.diagnosis)
    if (data.providerName) {
      await this.page.getByTestId('record-provider-input').selectOption(data.providerName)
    }
    await this.page.getByTestId('record-form-submit').click()
  }

  async expectRecordVisible(diagnosis: string, patientName?: string): Promise<void> {
    const diagnosisCell = this.table.getByTestId('record-diagnosis').filter({ hasText: diagnosis })
    await expect(diagnosisCell).toBeVisible()
    if (patientName) {
      const row = this.page.locator('[data-testid^="record-row-"]', { hasText: diagnosis }).first()
      await expect(row.getByTestId('record-patient')).toContainText(patientName)
    }
  }
}

