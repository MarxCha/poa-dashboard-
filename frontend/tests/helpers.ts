import { Page } from '@playwright/test'

/**
 * Sets demo mode in localStorage to bypass login screen.
 * Must be called after page.goto() since localStorage requires a page context.
 */
export async function skipAuth(page: Page) {
  await page.goto('/')
  await page.evaluate(() => localStorage.setItem('poa_demo_mode', 'true'))
  await page.reload()
  await page.waitForSelector('text=Sistema POA', { timeout: 15000 })
}
