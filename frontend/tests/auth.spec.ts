import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any stored auth state
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.removeItem('poa_token')
      localStorage.removeItem('poa_user')
      localStorage.removeItem('poa_demo_mode')
    })
    await page.reload()
  })

  test('shows login screen when not authenticated', async ({ page }) => {
    await expect(page.locator('text=Iniciar Sesión').first()).toBeVisible({ timeout: 10000 })
  })

  test('shows demo mode skip button', async ({ page }) => {
    await expect(page.locator('text=modo demo').first()).toBeVisible({ timeout: 10000 })
  })

  test('can skip to demo mode', async ({ page }) => {
    await page.locator('text=modo demo').click()
    await page.waitForTimeout(2000)
    await expect(page.locator('text=Sistema POA').first()).toBeVisible({ timeout: 15000 })
  })

  test('can toggle between login and register', async ({ page }) => {
    await page.waitForSelector('text=Iniciar Sesión', { timeout: 10000 })
    await page.locator('text=Regístrate').click()
    await expect(page.locator('text=Crear Cuenta').first()).toBeVisible()
    await page.locator('text=Inicia sesión').click()
    await expect(page.locator('text=Iniciar Sesión').first()).toBeVisible()
  })
})
