import { type Locator, type Page, expect } from '@playwright/test'
import { FRONTEND_LOGIN_URL } from '../config/env'

/**
 * Login page object — Medicube authentication entry point.
 * Selectors use data-testid for stability across UI refactors.
 */
export class LoginPage {
  readonly page: Page
  readonly usernameInput: Locator
  readonly passwordInput: Locator
  readonly loginButton: Locator
  readonly errorMessage: Locator
  readonly loginForm: Locator

  constructor(page: Page) {
    this.page = page
    this.usernameInput = page.getByTestId('username-input')
    this.passwordInput = page.getByTestId('password-input')
    this.loginButton = page.getByTestId('login-button')
    this.errorMessage = page.getByTestId('login-error')
    this.loginForm = page.getByTestId('login-form')
  }

  /**
   * Clears persisted auth so the login route always renders Login (not Dashboard).
   * Uses an absolute URL so navigation works even when baseURL is not applied
   * (e.g. some IDE / debug runners).
   */
  async open(): Promise<void> {
    await this.page.goto(FRONTEND_LOGIN_URL, { waitUntil: 'domcontentloaded' })
    await this.page.evaluate(() => localStorage.clear())
    await this.page.goto(FRONTEND_LOGIN_URL, { waitUntil: 'domcontentloaded' })
    await expect(this.page.getByTestId('login-page')).toBeVisible()
    await expect(this.loginForm).toBeVisible()
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username)
    await this.passwordInput.fill(password)
    await this.loginButton.click()
  }

  async expectLoginError(message?: string | RegExp): Promise<void> {
    await expect(this.errorMessage).toBeVisible()
    if (message) {
      await expect(this.errorMessage).toContainText(message)
    }
  }
}
