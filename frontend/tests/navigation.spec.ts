import { test, expect } from '@playwright/test'
import { skipAuth } from './helpers'

test.describe('Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await skipAuth(page)
  })

  const views = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'cfdis', label: 'CFDIs' },
    { id: 'semaforo', label: 'Semáforo Fiscal' },
    { id: 'cfo', label: 'CFO Virtual' },
    { id: 'predicciones', label: 'Predicciones' },
    { id: 'credito', label: 'Crédito' },
  ]

  for (const view of views) {
    test(`navigates to ${view.label}`, async ({ page }) => {
      const button = page.locator(`button:has-text("${view.label}")`).first()
      await button.click()
      await page.waitForTimeout(500)
      const activeButton = page.locator('button.bg-white\\/\\[0\\.08\\]', { hasText: view.label })
      await expect(activeButton).toBeVisible()
    })
  }
})
