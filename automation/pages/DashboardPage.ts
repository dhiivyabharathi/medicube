import { type Locator, type Page, expect } from '@playwright/test'

export class DashboardPage {
  readonly page: Page
  readonly dashboardPage: Locator
  readonly heading: Locator
  readonly kpiSection: Locator
  readonly sidebar: Locator

  constructor(page: Page) {
    this.page = page
    this.dashboardPage = page.getByTestId('dashboard-page')
    this.heading = page.getByTestId('dashboard-heading')
    this.kpiSection = page.getByTestId('kpi-section')
    this.sidebar = page.getByTestId('sidebar')
  }

  async verifyDashboard(): Promise<void> {
    await expect(this.page).toHaveURL(/\/dashboard/)
    await expect(this.dashboardPage).toBeVisible()
    await expect(this.heading).toHaveText('Operations Overview')
    await expect(this.kpiSection).toBeVisible()
    await expect(this.sidebar).toBeVisible()
    await expect(this.page.getByTestId('brand-name')).toHaveText('Medicube')
  }

  async navigateToProviders(): Promise<void> {
    await this.page.getByTestId('nav-providers').click()
    await expect(this.page).toHaveURL(/\/providers/)
  }

  async navigateToPatients(): Promise<void> {
    await this.page.getByTestId('nav-patients').click()
    await expect(this.page).toHaveURL(/\/patients/)
  }

  async navigateToDocuments(): Promise<void> {
    await this.page.getByTestId('nav-documents').click()
    await expect(this.page).toHaveURL(/\/documents/)
  }

  async navigateToMedicalRecords(): Promise<void> {
    await this.page.getByTestId('nav-medical-records').click()
    await expect(this.page).toHaveURL(/\/medical-records/)
  }
}
