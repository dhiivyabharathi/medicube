import { type Locator, type Page, expect } from '@playwright/test'

export interface ProviderFormData {
  name: string
  specialty: string
  mpi: string
  status?: string
}

export class ProvidersPage {
  readonly page: Page
  readonly providersPage: Locator
  readonly addButton: Locator
  readonly searchInput: Locator
  readonly table: Locator

  constructor(page: Page) {
    this.page = page
    this.providersPage = page.getByTestId('providers-page')
    this.addButton = page.getByTestId('add-provider-button')
    this.searchInput = page.getByTestId('provider-search-input')
    this.table = page.getByTestId('providers-table')
  }

  async expectLoaded(): Promise<void> {
    await expect(this.providersPage).toBeVisible()
    await expect(this.table).toBeVisible()
  }

  async openAddForm(): Promise<void> {
    await this.addButton.click()
    await expect(this.page.getByTestId('provider-form-modal')).toBeVisible()
  }

  async fillProviderForm(data: ProviderFormData): Promise<void> {
    await this.page.getByTestId('provider-name-input').fill(data.name)
    await this.page.getByTestId('provider-specialty-input').selectOption(data.specialty)
    await this.page.getByTestId('provider-mpi-input').fill(data.mpi)
    if (data.status) {
      await this.page.getByTestId('provider-status-input').selectOption(data.status)
    }
  }

  async submitForm(): Promise<void> {
    await this.page.getByTestId('provider-form-submit').click()
    await expect(this.page.getByTestId('provider-form-modal')).toBeHidden()
  }

  async addProvider(data: ProviderFormData): Promise<void> {
    await this.openAddForm()
    await this.fillProviderForm(data)
    await this.submitForm()
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term)
  }

  async expectProviderVisible(name: string): Promise<void> {
    await expect(this.table.getByTestId('provider-name').filter({ hasText: name })).toBeVisible()
  }

  async expectProviderNotVisible(name: string): Promise<void> {
    await expect(this.table.getByTestId('provider-name').filter({ hasText: name })).toHaveCount(0)
  }

  async getProviderRowIdByName(name: string): Promise<string> {
    const row = this.page.locator('[data-testid^="provider-row-"]', { hasText: name }).first()
    await expect(row).toBeVisible()
    const testId = await row.getAttribute('data-testid')
    if (!testId) throw new Error(`Provider row for ${name} missing data-testid`)
    return testId.replace('provider-row-', '')
  }

  async editProvider(name: string, updates: Partial<ProviderFormData>): Promise<void> {
    const id = await this.getProviderRowIdByName(name)
    await this.page.getByTestId(`edit-provider-${id}`).click()
    await expect(this.page.getByTestId('provider-form-modal')).toBeVisible()

    if (updates.name) {
      await this.page.getByTestId('provider-name-input').fill(updates.name)
    }
    if (updates.specialty) {
      await this.page.getByTestId('provider-specialty-input').selectOption(updates.specialty)
    }
    if (updates.mpi) {
      await this.page.getByTestId('provider-mpi-input').fill(updates.mpi)
    }
    if (updates.status) {
      await this.page.getByTestId('provider-status-input').selectOption(updates.status)
    }

    await this.submitForm()
  }

  async deleteProvider(name: string): Promise<void> {
    const id = await this.getProviderRowIdByName(name)
    this.page.once('dialog', (dialog) => dialog.accept())
    await this.page.getByTestId(`delete-provider-${id}`).click()
    await this.expectProviderNotVisible(name)
  }
}
