import { test, expect } from '@playwright/test'
import { skipAuth } from './helpers'

test.describe('CFO Virtual', () => {
  test.beforeEach(async ({ page }) => {
    await skipAuth(page)
    await page.locator('button:has-text("CFO Virtual")').first().click()
    await page.waitForTimeout(500)
  })

  test('shows welcome message', async ({ page }) => {
    await expect(page.locator('text=Soy tu CFO Virtual').first()).toBeVisible()
  })

  test('shows quick prompts', async ({ page }) => {
    await expect(page.locator('text=flujo de efectivo').first()).toBeVisible()
  })

  test('sends a message and gets response', async ({ page }) => {
    const input = page.locator('input[placeholder*="finanzas"]')
    await input.fill('¿Cómo está mi flujo de efectivo?')
    await input.press('Enter')

    await page.waitForTimeout(3000)

    const messages = page.locator('[class*="rounded-xl"][class*="p-4"]')
    await expect(messages).toHaveCount(3, { timeout: 10000 })
  })
})
