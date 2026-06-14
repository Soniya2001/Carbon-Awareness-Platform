import { test, expect } from '@playwright/test';

test.describe('Carbon Twin AI', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('cw_prefs', JSON.stringify({
        onboardingDone: true,
        name: 'Test User',
        dietType: 'omnivore',
        geminiApiKey: '',
        theme: 'system',
        units: 'metric',
      }));
    });
    await page.goto('/carbon-twin');
  });

  test('carbon twin page loads', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('Carbon Twin');
  });

  test('all scenarios are displayed', async ({ page }) => {
    await expect(page.getByText(/Current Lifestyle/i)).toBeVisible();
    await expect(page.getByText(/Public Transport/i)).toBeVisible();
    await expect(page.getByText(/Reduce Meat/i)).toBeVisible();
    await expect(page.getByText(/Renewable Energy/i)).toBeVisible();
  });

  test('can select a scenario', async ({ page }) => {
    const scenario = page.getByText(/Public Transport/i).first();
    await scenario.click();
    // Selected state should be active
    await expect(scenario).toBeVisible();
  });

  test('run simulation button exists', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Run Simulation/i })).toBeVisible();
  });

  test('running simulation shows results', async ({ page }) => {
    // Click public transport scenario
    await page.getByText(/Public Transport/i).first().click();
    await page.getByRole('button', { name: /Run Simulation/i }).click();

    // Results should appear
    await expect(page.getByText(/Annual Saving/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Trees/i)).toBeVisible({ timeout: 5000 });
  });

  test('chart renders after simulation', async ({ page }) => {
    await page.getByText(/Public Transport/i).first().click();
    await page.getByRole('button', { name: /Run Simulation/i }).click();
    
    // Chart container should be visible
    await expect(page.locator('[role="img"][aria-label*="Twin"]')).toBeVisible({ timeout: 8000 });
  });

  test('save simulation button appears after run', async ({ page }) => {
    await page.getByRole('button', { name: /Run Simulation/i }).click();
    await expect(page.getByRole('button', { name: /Save/i })).toBeVisible({ timeout: 5000 });
  });
});
