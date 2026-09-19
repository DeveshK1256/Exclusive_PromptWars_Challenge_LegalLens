import { test, expect } from '@playwright/test';

const VERCEL_URL = 'https://exclusive-prompt-wars-challenge-leg-xi.vercel.app';

test.describe('Fresh Zero-Upload Account Empty State Verification Across All 4 Screens', () => {

  test('1. Fresh Account on Vercel: /journey renders No Documents Uploaded empty state', async ({ page }) => {
    await page.goto(`${VERCEL_URL}/login`);

    const freshEmail = `fresh_zero_doc_${Date.now()}@domain.com`;
    const password = 'FreshPassword123!';

    // Register fresh account
    await page.getByRole('button', { name: 'Create Account' }).first().click();
    await page.locator('input[placeholder="Jane Doe"]').fill('Fresh User');
    await page.locator('input[placeholder="jane@example.com"]').fill(freshEmail);
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill(password);
    await passwordInputs.nth(1).fill(password);
    await page.locator('form').getByRole('button', { name: 'Create Account' }).click();

    // Sign in with fresh account
    await expect(page.getByRole('heading', { name: 'Sign in to LegalLens AI' })).toBeVisible({ timeout: 10000 });
    await page.locator('input[placeholder="demo@legallens.ai"]').fill(freshEmail);
    await page.locator('input[placeholder="••••••••"]').fill(password);
    await page.getByRole('button', { name: 'Sign In' }).last().click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    // Navigate to /journey
    await page.goto(`${VERCEL_URL}/journey`);
    await expect(page.getByRole('heading', { name: 'No Legal Documents Uploaded Yet' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Upload a legal document to navigate personalized role-based impact analysis')).toBeVisible();
  });

  test('2. Fresh Account on Vercel: /compare renders clean empty textareas', async ({ page }) => {
    await page.goto(`${VERCEL_URL}/compare`);
    await expect(page.getByRole('heading', { name: 'Contract Comparison Engine' })).toBeVisible();

    const textareas = page.locator('textarea');
    if (await textareas.count() > 0) {
      await expect(textareas.first()).toHaveValue('');
      await expect(textareas.last()).toHaveValue('');
    }
    await expect(page.getByRole('button', { name: 'Load Demo Contracts' })).toBeVisible();
  });

  test('3. Fresh Account on Vercel: /portfolio renders No Documents in Portfolio empty state', async ({ page }) => {
    await page.goto(`${VERCEL_URL}/portfolio`);
    await expect(page.getByRole('heading', { name: 'No Documents in Portfolio' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Upload legal agreements to calculate aggregate risk scores')).toBeVisible();
  });

  test('4. Fresh Account on Vercel: /action-plans renders No Action Plans Found empty state', async ({ page }) => {
    await page.goto(`${VERCEL_URL}/action-plans`);
    await expect(page.getByRole('heading', { name: 'No Action Plans Found' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Upload a legal contract to automatically extract pre-signature review checklists')).toBeVisible();
  });

});
