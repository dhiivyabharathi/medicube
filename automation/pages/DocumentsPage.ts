import path from 'node:path'
import { type Locator, type Page, expect } from '@playwright/test'

export interface DocumentUploadData {
  name: string
  category: string
  filePath: string
}

export class DocumentsPage {
  readonly page: Page
  readonly documentsPage: Locator
  readonly table: Locator
  readonly uploadForm: Locator

  constructor(page: Page) {
    this.page = page
    this.documentsPage = page.getByTestId('documents-page')
    this.table = page.getByTestId('documents-table')
    this.uploadForm = page.getByTestId('document-upload-form')
  }

  async expectLoaded(): Promise<void> {
    await expect(this.documentsPage).toBeVisible()
    await expect(this.table).toBeVisible()
  }

  async uploadDocument(data: DocumentUploadData): Promise<void> {
    await this.page.getByTestId('document-name-input').fill(data.name)
    await this.page.getByTestId('document-category-input').selectOption(data.category)
    await this.page.getByTestId('document-file-input').setInputFiles(data.filePath)
    await expect(this.page.getByTestId('document-selected-file')).toContainText(
      path.basename(data.filePath),
    )
    await this.page.getByTestId('document-upload-submit').click()
  }

  async expectDocumentVisible(name: string): Promise<void> {
    await expect(this.table.getByTestId('document-name').filter({ hasText: name })).toBeVisible()
  }

  async getDocumentIdByName(name: string): Promise<string> {
    const row = this.page.locator('[data-testid^="document-row-"]', { hasText: name }).first()
    await expect(row).toBeVisible()
    const testId = await row.getAttribute('data-testid')
    if (!testId) throw new Error(`Document row for ${name} missing data-testid`)
    return testId.replace('document-row-', '')
  }

  async expectStatus(name: string, status: string): Promise<void> {
    const id = await this.getDocumentIdByName(name)
    await expect(this.page.getByTestId(`document-status-${id}`)).toHaveText(status)
  }

  async approveDocument(name: string): Promise<void> {
    const id = await this.getDocumentIdByName(name)
    await this.page.getByTestId(`approve-document-${id}`).click()
    await this.expectStatus(name, 'Approved')
  }

  async downloadDocument(name: string): Promise<string> {
    const id = await this.getDocumentIdByName(name)
    const downloadPromise = this.page.waitForEvent('download')
    await this.page.getByTestId(`download-document-${id}`).click()
    const download = await downloadPromise
    const suggested = download.suggestedFilename()
    expect(suggested.length).toBeGreaterThan(0)
    return suggested
  }
}
