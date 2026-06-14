import { test, expect } from '@playwright/test';

test.describe('Carbon Calculator', () => {
  test.beforeEach(async ({ page }) => {
    // Set up onboarding as done so we go straight to dashboard
    await page.goto('/');
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
    await page.goto('/calculator');
  });

  test('calculator page loads', async ({ page }) => {
    await expect(page).toHaveTitle(/CarbonWise/i);
    await expect(page.locator('h2')).toContainText('Calculator');
  });

  test('category tabs are visible', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /transportation/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /energy/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /food/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /shopping/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /waste/i })).toBeVisible();
  });

  test('live CO2e preview appears when value entered', async ({ page }) => {
    // Select subcategory
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: /Car \(Petrol\)/i }).first().click();

    // Enter value
    await page.getByLabel(/Amount/i).fill('50');

    // Preview should appear
    await expect(page.getByRole('status')).toBeVisible();
    await expect(page.getByRole('status')).toContainText('CO₂e');
  });

  test('submitting logs an activity', async ({ page }) => {
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: /Car \(Petrol\)/i }).first().click();
    await page.getByLabel(/Amount/i).fill('30');
    await page.getByRole('button', { name: /Log Activity/i }).click();

    // Success indicator
    await expect(page.getByText(/\+\d+ pts/i)).toBeVisible({ timeout: 5000 });
  });

  test('validation shows error for negative value', async ({ page }) => {
    await page.getByRole('combobox').click();
    await page.getByRole('option').first().click();
    await page.getByLabel(/Amount/i).fill('-5');
    await page.getByRole('button', { name: /Log Activity/i }).click();
    await expect(page.getByRole('alert')).toBeVisible();
  });

  test('switching category tabs works', async ({ page }) => {
    await page.getByRole('tab', { name: /food/i }).click();
    await expect(page.getByRole('combobox')).toBeVisible();

    // Food subcategory options should be available
    await page.getByRole('combobox').click();
    await expect(page.getByRole('option', { name: /Beef/i })).toBeVisible();
  });
});
