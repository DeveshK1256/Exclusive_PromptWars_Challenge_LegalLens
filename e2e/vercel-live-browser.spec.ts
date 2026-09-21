import { test, expect } from '@playwright/test';

const VERCEL_URL = 'https://exclusive-prompt-wars-challenge-leg-xi.vercel.app';

test.describe('Live Vercel Production Deployment — Real Un-Mocked Browser E2E Verification', () => {

  test('1. Live Vercel Browser: Random unregistered email login is rejected with visible UI error', async ({ page }) => {
    await page.goto(`${VERCEL_URL}/login`);

    // Ensure we are on Sign In tab
    await expect(page.getByRole('heading', { name: 'Sign in to LegalLens AI' })).toBeVisible();

    const randomEmail = `unregistered_browser_${Date.now()}@domain.com`;
    const emailInput = page.locator('input[placeholder="demo@legallens.ai"]');
    const passwordInput = page.locator('input[placeholder="••••••••"]');

    await emailInput.fill(randomEmail);
    await passwordInput.fill('InvalidPass123!');

    const signInBtn = page.getByRole('button', { name: 'Sign In' }).last();
    await signInBtn.click();

    // Assert error message visible in UI
    await expect(page.getByText(/Invalid email or password/)).toBeVisible({ timeout: 15000 });

    // Assert user remains on /login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('2. Live Vercel Browser: Brand new account signup and immediate signin succeeds', async ({ page }) => {
    await page.goto(`${VERCEL_URL}/login`);

    const uniqueEmail = `vercel_ui_user_${Date.now()}@domain.com`;
    const password = 'StrongP@ssw0rd2026!';

    // Switch to Create Account tab
    await page.getByRole('button', { name: 'Create Account' }).first().click();
    await expect(page.getByRole('heading', { name: 'Create Your Account' })).toBeVisible();

    // Fill signup form
    await page.locator('input[placeholder="Jane Doe"]').fill('Live Vercel Tester');
    await page.locator('input[placeholder="jane@example.com"]').fill(uniqueEmail);

    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill(password);
    await passwordInputs.nth(1).fill(password);

    // Submit Signup
    const regSubmitBtn = page.locator('form').getByRole('button', { name: 'Create Account' });
    await regSubmitBtn.click();

    // Assert UI switches to Sign In tab or displays success notification
    await expect(page.getByRole('heading', { name: 'Sign in to LegalLens AI' })).toBeVisible({ timeout: 10000 });

    // Immediately Sign In with newly created credentials
    const emailInput = page.locator('input[placeholder="demo@legallens.ai"]');
    const passwordInput = page.locator('input[placeholder="••••••••"]');

    await emailInput.fill(uniqueEmail);
    await passwordInput.fill(password);

    const signInBtn = page.getByRole('button', { name: 'Sign In' }).last();
    await signInBtn.click();

    // Assert successful authentication navigation to /dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
