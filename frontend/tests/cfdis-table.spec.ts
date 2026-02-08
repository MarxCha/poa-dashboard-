import { test, expect } from '@playwright/test'
import { skipAuth } from './helpers'

test.describe('CFDIs Table', () => {
  test.beforeEach(async ({ page }) => {
    await skipAuth(page)
    await page.locator('button:has-text("CFDIs")').first().click()
    await page.waitForTimeout(1000)
  })

  test('shows CFDIs section', async ({ page }) => {
    await expect(page.locator('text=CFDI').first()).toBeVisible()
  })

  test('shows filter buttons', async ({ page }) => {
    await expect(page.locator('button:has-text("Todos")').first()).toBeVisible()
  })
})
