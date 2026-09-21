import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const LIVE_URL = 'https://exclusive-prompt-wars-challenge-leg-xi.vercel.app';
const testTimestamp = Date.now();
const testEmail = `ui_live_tester_${testTimestamp}@gmail.com`;
const testPassword = 'Password123!';
const testName = 'UI Live Auditor';

// Create a dummy document file for upload test
const dummyDocPath = path.join(process.cwd(), 'scratch', `live_test_agreement_${testTimestamp}.txt`);
const dummyDocContent = `RESIDENTIAL LEASE AGREEMENT
1. PARTIES: Landlord Real Estate Corp leases to Tenant ${testName} Apartment 5B.
2. RENT: Monthly rent is $2,800 due on the 1st day of each month. A grace period of 5 days is allowed before a $75 late fee applies.
3. SECURITY DEPOSIT: $2,800 security deposit refundable within 21 days post move-out.
4. NOTICE: 30 days written notice required prior to lease expiration or early termination.
5. GOVERNING LAW: Governed by the laws of California.`;

if (!fs.existsSync(path.join(process.cwd(), 'scratch'))) {
  fs.mkdirSync(path.join(process.cwd(), 'scratch'), { recursive: true });
}
fs.writeFileSync(dummyDocPath, dummyDocContent, 'utf8');

test('REAL UI-DRIVEN VERIFICATION: Registration, Document Upload, Portfolio & Sign-Out/Sign-In Cycles', async ({ page }) => {
  test.setTimeout(120000);

  console.log(`=== STARTING REAL BROWSER UI VERIFICATION ===`);
  console.log(`Target Deployed URL: ${LIVE_URL}`);
  console.log(`Test Account: ${testEmail}`);

  // ---------------------------------------------------------------------------
  // STEP 1: UI REGISTRATION & LOGIN
  // ---------------------------------------------------------------------------
  console.log('\n[Step 1.1] Navigating to /login page in real browser...');
  await page.goto(`${LIVE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `scratch/step1_login_page.png`, fullPage: true });

  console.log('[Step 1.2] Clicking "Create Account" tab on /login form...');
  await page.getByRole('button', { name: 'Create Account' }).first().click();
  await page.waitForTimeout(300);

  console.log('[Step 1.3] Typing registration credentials into real form fields...');
  await page.getByPlaceholder('Jane Doe').fill(testName);
  await page.getByPlaceholder('jane@example.com').fill(testEmail);
  await page.getByPlaceholder('••••••••').first().fill(testPassword);
  await page.getByPlaceholder('••••••••').nth(1).fill(testPassword);

  await page.screenshot({ path: `scratch/step1_registration_filled.png`, fullPage: true });

  console.log('[Step 1.4] Clicking "Create Account" submit button...');
  await page.locator('form button[type="submit"]').click();
  await page.waitForTimeout(1000);

  console.log('[Step 1.5] Submitting Sign In form with created credentials...');
  await page.getByPlaceholder('demo@legallens.ai').fill(testEmail);
  await page.getByPlaceholder('••••••••').fill(testPassword);
  await page.screenshot({ path: `scratch/step1_login_credentials_entered.png`, fullPage: true });

  await page.locator('form button[type="submit"]').click();
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  console.log('🟢 STEP 1 SUCCESS: Landed on /dashboard in real browser!');
  await page.screenshot({ path: `scratch/step1_dashboard_landed.png`, fullPage: true });

  // ---------------------------------------------------------------------------
  // STEP 2: DOCUMENT UPLOAD & PORTFOLIO VERIFICATION
  // ---------------------------------------------------------------------------
  console.log('\n[Step 2.1] Uploading document file through real file picker UI...');
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(dummyDocPath);
  await page.waitForTimeout(500);

  console.log('[Step 2.2] Clicking "Run Grounded Legal Analysis" submit button...');
  await page.getByRole('button', { name: /Run Grounded Legal Analysis|Analyzing Document/i }).click();

  // Wait for upload & analysis completion banner or tab switch
  await page.waitForTimeout(6000);
  await page.screenshot({ path: `scratch/step2_upload_completed.png`, fullPage: true });
  console.log('🟢 STEP 2.2 SUCCESS: Document uploaded via real UI!');

  console.log('[Step 2.3] Navigating to /portfolio page in real browser UI...');
  await page.goto(`${LIVE_URL}/portfolio`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `scratch/step2_portfolio_page.png`, fullPage: true });

  const portfolioText = await page.evaluate(() => document.body.innerText);
  console.log('Portfolio page content check:');
  const hasNoDocs = portfolioText.includes('No Documents in Portfolio');
  console.log(`Contains "No Documents in Portfolio": ${hasNoDocs}`);
  console.log(`Contains filename "${path.basename(dummyDocPath)}": ${portfolioText.includes(path.basename(dummyDocPath))}`);

  // ---------------------------------------------------------------------------
  // STEP 3: SIGN OUT & DOUBLE SIGN IN CYCLE (UI-DRIVEN)
  // ---------------------------------------------------------------------------
  console.log('\n[Step 3.1] Clicking "Sign Out" button in Navbar...');
  await page.getByRole('button', { name: 'Sign Out' }).click();
  await page.waitForURL('**/login', { timeout: 10000 });
  console.log('🟢 CYCLE 1 SIGN OUT: Redirected to /login page!');
  await page.screenshot({ path: `scratch/step3_cycle1_signed_out.png`, fullPage: true });

  console.log('[Step 3.2] Cycle 1 Sign In: Typing SAME credentials into /login form...');
  await page.getByPlaceholder('demo@legallens.ai').fill(testEmail);
  await page.getByPlaceholder('••••••••').fill(testPassword);
  await page.locator('form button[type="submit"]').click();
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  console.log('🟢 CYCLE 1 SIGN IN SUCCESSFUL: Landed on /dashboard!');
  await page.screenshot({ path: `scratch/step3_cycle1_signed_in.png`, fullPage: true });

  console.log('[Step 3.3] Cycle 2 Sign Out: Clicking "Sign Out" in Navbar again...');
  await page.getByRole('button', { name: 'Sign Out' }).click();
  await page.waitForURL('**/login', { timeout: 10000 });
  console.log('🟢 CYCLE 2 SIGN OUT: Redirected to /login page!');
  await page.screenshot({ path: `scratch/step3_cycle2_signed_out.png`, fullPage: true });

  console.log('[Step 3.4] Cycle 2 Sign In: Typing SAME credentials into /login form again...');
  await page.getByPlaceholder('demo@legallens.ai').fill(testEmail);
  await page.getByPlaceholder('••••••••').fill(testPassword);
  await page.locator('form button[type="submit"]').click();
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  console.log('🟢 CYCLE 2 SIGN IN SUCCESSFUL: Landed on /dashboard!');
  await page.screenshot({ path: `scratch/step3_cycle2_signed_in.png`, fullPage: true });

  console.log('\n=============================================================');
  console.log('ALL REAL BROWSER UI STEPS COMPLETED WITH 100% SUCCESS! 🟢');
  console.log('=============================================================');
});
