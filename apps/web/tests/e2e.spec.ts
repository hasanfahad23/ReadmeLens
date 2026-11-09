import { test, expect } from '@playwright/test';

test.describe('ReadmeLens Pro E2E Suite', () => {
  test('loads home page and displays title and health score', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/ReadmeLens Pro/);
    await expect(page.locator('h1')).toContainText('ReadmeLens Pro');

    // Health score ribbon
    const healthStatus = page.locator('[role="status"]');
    await expect(healthStatus).toBeVisible();
    await expect(healthStatus).toContainText('out of 100');
  });

  test('switches across tabs seamlessly', async ({ page }) => {
    await page.goto('/');

    // Tab: Analysis & Health
    await page.getByRole('tab', { name: 'Analysis & Health' }).click();
    await expect(page.locator('text=Explainable Health Breakdown')).toBeVisible();

    // Tab: Security Audit
    await page.getByRole('tab', { name: 'Security Audit' }).click();
    await expect(page.locator('text=No Security Threats Detected')).toBeVisible();

    // Tab: Quick Start
    await page.getByRole('tab', { name: 'Quick Start Extractor' }).click();
    await expect(page.locator('text=Detected Package Managers')).toBeVisible();

    // Tab: Linter & SARIF
    await page.getByRole('tab', { name: 'Linter & SARIF' }).click();
    await expect(page.locator('text=Download SARIF Report')).toBeVisible();

    // Tab: Editor Source
    await page.getByRole('tab', { name: 'Editor Source' }).click();
    await expect(page.locator('textarea')).toBeVisible();
  });

  test('loads vulnerable sample and displays detected threats', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Security Threats Sample' }).click();
    await page.getByRole('tab', { name: 'Security Audit' }).click();

    // Should detect curl | bash and hidden chars
    await expect(page.locator('text=Dangerous Remote Script Execution')).toBeVisible();
  });
});
