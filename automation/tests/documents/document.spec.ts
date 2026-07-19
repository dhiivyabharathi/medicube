import path from 'node:path'
import { test, expect } from '@playwright/test'
import { LoginPage } from '../../pages/LoginPage'
import { DashboardPage } from '../../pages/DashboardPage'
import { DocumentsPage } from '../../pages/DocumentsPage'

const sampleFile = path.join(__dirname, '../../fixtures/sample-lab-result.txt')

test.describe('Document workflows', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.open()
    await loginPage.login('admin', 'test123')
    await new DashboardPage(page).verifyDashboard()
  })

  test('Upload document, validate status, and download', async ({ page }) => {
    const dashboard = new DashboardPage(page)
    const documents = new DocumentsPage(page)

    const docName = `QA Lab Upload ${Date.now().toString().slice(-6)}`

    await dashboard.navigateToDocuments()
    await documents.expectLoaded()

    await documents.uploadDocument({
      name: docName,
      category: 'Clinical',
      filePath: sampleFile,
    })
    await documents.expectDocumentVisible(docName)
    await documents.expectStatus(docName, 'Pending')

    await documents.approveDocument(docName)
    await documents.expectStatus(docName, 'Approved')

    const fileName = await documents.downloadDocument(docName)
    expect(fileName).toBe('sample-lab-result.txt')
  })
})
