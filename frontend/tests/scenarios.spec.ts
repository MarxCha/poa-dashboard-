import { test, expect } from '@playwright/test'
import { skipAuth } from './helpers'

test.describe('Demo Scenario Switching', () => {
  test.beforeEach(async ({ page }) => {
    await skipAuth(page)
  })

  test('defaults to Scenario A with SME button active', async ({ page }) => {
    const smeButton = page.locator('button:has-text("SME")').first()
    await expect(smeButton).toBeVisible()
  })

  test('switches to Scenario B (Scale-up)', async ({ page }) => {
    const scaleUpButton = page.locator('button:has-text("Scale-up")')
    await scaleUpButton.click()
    await page.waitForTimeout(1500)
    await expect(scaleUpButton).toHaveClass(/emerald/)
  })

  test('switches to Scenario C (Despacho)', async ({ page }) => {
    const despachoButton = page.locator('button:has-text("Despacho")')
    await despachoButton.click()
    await page.waitForTimeout(1500)
    await expect(despachoButton).toHaveClass(/emerald/)
  })
})
