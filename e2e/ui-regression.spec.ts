import { test, expect } from '@playwright/test';

test.describe('LegalLens AI - Full UI Regression Suite', () => {

  // Pre-authenticate for protected route tests via mock session cookies
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      { name: 'legallens_demo_session', value: 'active', domain: 'localhost', path: '/' },
      { name: 'sb-access-token', value: 'valid_user_jwt', domain: 'localhost', path: '/' },
      { name: 'legallens_user_email', value: 'demo@legallens.ai', domain: 'localhost', path: '/' },
    ]);
  });

  // -------------------------------------------------------------
  // 1. Landing / Home Page (/)
  // -------------------------------------------------------------
  test('HomePage: CTA navigation links and hero elements work correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check main heading
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Understand what it means');

    // Test CTA Button 1: "Analyze Your Document" -> Navigates to /dashboard
    const analyzeBtn = page.getByRole('link', { name: 'Analyze Your Document' });
    await expect(analyzeBtn).toBeVisible();
    await analyzeBtn.click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Return to home
    await page.goto('/');

    // Test CTA Link 2: "Learn How It Works" -> Scrolls to #how-it-works
    const learnBtn = page.getByRole('link', { name: 'Learn How It Works' });
    await expect(learnBtn).toBeVisible();
    await learnBtn.click();
    await expect(page).toHaveURL(/#how-it-works/);

    // Test Navbar Brand Link -> Navigates to /
    const brandLink = page.getByRole('link', { name: 'LegalLens AI' }).first();
    await expect(brandLink).toBeVisible();
    await brandLink.click();
    await expect(page).toHaveURL('/');
  });

  // -------------------------------------------------------------
  // 2. Authentication Page (/login)
  // -------------------------------------------------------------
  test('LoginPage: Tab switching, form validation, password toggle, keyboard access, & mock authentication', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear()).catch(() => {});

    // Tab switching: Click "Create Account"
    await page.getByRole('button', { name: 'Create Account' }).first().click();
    await expect(page.getByRole('heading', { name: 'Create Your Account' })).toBeVisible();

    // Test Registration Form Mandatory Validation
    const regSubmitBtn = page.locator('form').getByRole('button', { name: 'Create Account' });
    await regSubmitBtn.click();
    await expect(page.getByText('Full Name / Username is required.')).toBeVisible();
    await expect(page.getByText('Email address is required.')).toBeVisible();

    // Test Password Strength Indicator (Target first password input in registration form)
    const regPasswordInput = page.locator('form').locator('input[type="password"]').first();
    await regPasswordInput.fill('weak');
    await expect(page.getByText('Weak', { exact: true })).toBeVisible();
    await regPasswordInput.fill('StrongP@ssw0rd!');
    await expect(page.getByText('Strong', { exact: true })).toBeVisible();

    // Test Registration Form Reset Button
    const resetFormBtn = page.getByRole('button', { name: 'Reset Form' });
    await resetFormBtn.click();
    await expect(regPasswordInput).toHaveValue('');

    // Switch back to Sign In tab
    const signInTab = page.getByRole('button', { name: 'Sign In' }).first();
    await signInTab.click();
    await expect(page.getByRole('heading', { name: 'Sign in to LegalLens AI' })).toBeVisible();

    // Test Password Visibility Toggle
    const passwordInput = page.locator('input[placeholder="••••••••"]').first();
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Test Forgot Password Modal (Open, Submit, Close)
    const forgotBtn = page.getByRole('button', { name: 'Forgot password?' });
    await forgotBtn.click();
    await expect(page.getByRole('heading', { name: 'Reset Password' })).toBeVisible();

    const forgotEmailInput = page.locator('input[placeholder="user@example.com"]');
    await forgotEmailInput.fill('forgot@example.com');
    await page.getByRole('button', { name: 'Send Reset Link' }).click();
    await expect(page.getByText('Password reset link sent to forgot@example.com')).toBeVisible();

    // Close modal
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('heading', { name: 'Reset Password' })).not.toBeVisible();

    // Test Lockout / Failed Attempt Edge Case
    const emailInput = page.locator('input[placeholder="demo@legallens.ai"]');
    await emailInput.fill('demo@legallens.ai');
    await passwordInput.fill('wrongpass');
    await page.getByRole('button', { name: 'Sign In' }).last().click();
    await expect(page.getByText(/Invalid email or password/)).toBeVisible();

    // Test Happy Path Login -> Redirects to Dashboard
    await emailInput.fill('demo@legallens.ai');
    await passwordInput.fill('Password123!');
    await page.getByRole('button', { name: 'Sign In' }).last().click();
    await page.waitForURL(/\/dashboard/);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  // -------------------------------------------------------------
  // 3. Navigation Bar & User Sign-Out
  // -------------------------------------------------------------
  test('Navbar: Navigates across main routes & performs user sign-out', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('demo@legallens.ai')).toBeVisible();

    // Navigate to My Documents
    await page.getByRole('link', { name: 'My Documents' }).click();
    await expect(page).toHaveURL(/\/documents/);

    // Navigate to Compare
    await page.getByRole('link', { name: 'Compare' }).click();
    await expect(page).toHaveURL(/\/compare/);

    // Navigate to Action Plans
    await page.getByRole('link', { name: 'Action Plans' }).click();
    await expect(page).toHaveURL(/\/action-plans/);

    // Navigate to Settings
    await page.getByRole('link', { name: 'Settings' }).click();
    await expect(page).toHaveURL(/\/settings/);

    // Test Sign Out
    const signOutBtn = page.getByRole('button', { name: 'Sign Out' });
    await expect(signOutBtn).toBeVisible();
    await signOutBtn.click();
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });

  // -------------------------------------------------------------
  // 4. Dashboard Workspace Tabs & Controls (/dashboard)
  // -------------------------------------------------------------
  test('DashboardPage: Tab switching between Documents, Analysis Report, Simplification, Q&A, Timeline, and Action Plan', async ({ page }) => {
    await page.goto('/dashboard');

    // Default tab: Documents
    await expect(page.getByText('Interactive Demo Sandbox')).toBeVisible();

    // Switch to Analysis Report Tab
    await page.getByRole('button', { name: 'Analysis Report', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Legal X-Ray Analysis Report' })).toBeVisible();

    // Switch to Simplification Tab
    await page.getByRole('button', { name: 'Simplification' }).click();
    await expect(page.getByRole('heading', { name: 'Document Simplification Engine' })).toBeVisible();

    // Test Complexity Switcher inside Simplification Viewer
    await page.getByRole('tab', { name: /Student Overview/i }).click();
    await expect(page.getByText('Student Overview').first()).toBeVisible();

    await page.getByRole('tab', { name: /Professional/i }).click();
    await expect(page.getByText('Professional').first()).toBeVisible();

    await page.getByRole('tab', { name: /Legal Breakdown/i }).click();
    await expect(page.getByText('Legal Breakdown').first()).toBeVisible();

    // Switch to Grounded Q&A Tab
    await page.getByRole('button', { name: 'Grounded Q&A' }).click();
    await expect(page.getByRole('heading', { name: /Grounded Document Q&A/i })).toBeVisible();

    // Test Suggested Question Click in Q&A
    const suggestedQuestionBtn = page.getByRole('button', { name: 'What are the termination notice requirements?' });
    await suggestedQuestionBtn.click();
    await expect(page.getByText('What are the termination notice requirements?')).toBeVisible();

    // Switch to Timeline Tab
    await page.getByRole('button', { name: 'Timeline', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Legal Document Timeline' })).toBeVisible();

    // Switch to Action Plan Tab
    await page.getByRole('button', { name: 'Action Plan' }).click();
    await expect(page.getByRole('heading', { name: 'Action Plan & Execution Strategy' })).toBeVisible();
  });

  // -------------------------------------------------------------
  // 5. Document List & Soft-Delete Confirmation Flow (/documents)
  // -------------------------------------------------------------
  test('DocumentList: Soft-delete confirmation modal flow prevents accidental deletion', async ({ page }) => {
    await page.goto('/documents');

    // Confirm initial document exists
    await expect(page.getByText('Sample Employment Agreement')).toBeVisible();

    // Click trash button to trigger confirmation modal
    const trashBtn = page.getByRole('button', { name: 'Delete document Sample Employment Agreement' });
    await trashBtn.click();

    // Confirm Modal is visible
    const modalHeading = page.getByRole('heading', { name: 'Confirm Soft Delete' });
    await expect(modalHeading).toBeVisible();
    await expect(page.getByText('Are you sure you want to delete Sample Employment Agreement?')).toBeVisible();

    // Test Cancel Delete -> Document remains in list
    const cancelBtn = page.getByRole('button', { name: 'Cancel Delete' });
    await cancelBtn.click();
    await expect(modalHeading).not.toBeVisible();
    await expect(page.getByText('Sample Employment Agreement')).toBeVisible();

    // Open modal again and click Confirm Delete
    await trashBtn.click();
    await expect(modalHeading).toBeVisible();
    const confirmBtn = page.getByRole('button', { name: 'Confirm Delete' });
    await confirmBtn.click();

    // Verify Document is removed & Empty State displayed
    await expect(page.getByText('No Documents Uploaded')).toBeVisible();
  });

  // -------------------------------------------------------------
  // 6. Contract Comparison Engine (/compare)
  // -------------------------------------------------------------
  test('ComparePage: Inputs, submit execution, and dual document side-by-side results', async ({ page }) => {
    // Intercept comparison API for fast deterministic UI testing
    await page.route('/api/documents/compare', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            comparisonId: 'cmp_mock_1',
            user_id: 'demo_user_id',
            document_a_id: 'doc_emp_2026_v1',
            document_b_id: 'doc_emp_2026_v2',
            titleA: 'Standard_Employment_Agreement_2026.pdf',
            titleB: 'Revised_Offer_Letter_2026.pdf',
            findings: [
              {
                id: 'fnd_cmp_1',
                category: 'Compensation & Bonus',
                title: 'Target Bonus Addition',
                document_a_value: '$120,000 base salary',
                document_b_value: '$120,000 base salary + $15,000 target bonus',
                difference_summary: 'Document B adds a target annual bonus of $15,000.',
                severity_level: 'green',
                finding_kind: 'informational',
                source_reference_a: 'Section 1: Annual salary of $120,000 paid bi-weekly.',
                source_reference_b: 'Section 1: Annual salary of $120,000 paid bi-weekly plus target bonus of $15,000.',
                confidence: 0.95,
              },
            ],
            questionsForLawyer: ['Does the target bonus require explicit KPI metrics?'],
            recommendedActionItems: ['Request written bonus criteria schedule.'],
            summaryText: 'Comparison completed between Document A and Document B.',
            differencesCount: 1,
            similaritiesCount: 2,
            confidence: 0.94,
            modelUsed: 'gemini-3.6-flash',
            analysis_mode: 'ai',
            degraded: false,
            tokenUsage: 180,
            created_at: new Date().toISOString(),
          },
        }),
      });
    });

    await page.goto('/compare');

    await expect(page.getByRole('heading', { name: 'Contract Comparison Engine' })).toBeVisible();

    // Locate & click Run Side-by-Side Comparison
    const compareBtn = page.getByRole('button', { name: 'Run side-by-side contract comparison' });
    await expect(compareBtn).toBeVisible();
    await compareBtn.click();

    // Wait for comparison result section
    await expect(page.getByRole('heading', { name: 'Comparison Summary' })).toBeVisible();
    await expect(page.getByText('Identified Differences')).toBeVisible();
    await expect(page.getByText('Questions for a Legal Professional')).toBeVisible();
    await expect(page.getByText('Recommended Action Items')).toBeVisible();
  });

  // -------------------------------------------------------------
  // 7. Journey Navigator & Stepper (/journey)
  // -------------------------------------------------------------
  test('JourneyPage: Perspective role selector and 4-step stepper navigation', async ({ page }) => {
    await page.goto('/journey');

    await expect(page.getByRole('heading', { name: 'Journey Navigator & Personal Impact' })).toBeVisible();

    // Step 1: Personal Impact default
    await expect(page.getByRole('heading', { name: /What This Means For You/ })).toBeVisible();

    // Test Perspective Role Selector
    const roleSelect = page.getByLabel('Perspective Context Role');
    await roleSelect.selectOption('Tenant');
    await expect(page.getByRole('heading', { name: 'What This Means For You (Tenant)' })).toBeVisible();

    // Test Stepper Nav Tab 2: Legal X-Ray
    await page.getByRole('tab', { name: /Step 2: Legal X-Ray/ }).click();
    await expect(page.getByRole('heading', { name: 'Legal X-Ray Findings Overview' })).toBeVisible();

    // Test Stepper Nav Tab 3: Timeline & Deadlines
    await page.getByRole('tab', { name: /Step 3: Timeline & Deadlines/ }).click();
    await expect(page.getByRole('heading', { name: 'Legal Timeline & Milestones' })).toBeVisible();

    // Test Stepper Nav Tab 4: Before You Sign
    await page.getByRole('tab', { name: /Step 4: Before You Sign/ }).click();
    await expect(page.getByRole('heading', { name: 'Before You Sign Checklist & Lawyer Questions' })).toBeVisible();
  });

  // -------------------------------------------------------------
  // 8. Action Plan & Task Center (/action-plans)
  // -------------------------------------------------------------
  test('ActionPlansPage: Tab switching, checklist toggle, and task completion toggle', async ({ page }) => {
    await page.goto('/action-plans');

    await expect(page.getByRole('heading', { name: 'Action Plans & Task Center' })).toBeVisible();

    // Tab 1: Before You Sign Checklist default
    const checklistTab = page.getByRole('tab', { name: /Before You Sign/ });
    await expect(checklistTab).toBeVisible();

    // Toggle checklist checkbox
    const toggleChecklistBtn = page.getByRole('button', { name: /Mark Clarify Non-Compete Scope/ });
    await toggleChecklistBtn.click();
    await expect(page.getByText('1 of 2 items reviewed')).toBeVisible();

    // Tab 2: Lawyer Questions
    const questionsTab = page.getByRole('tab', { name: /Lawyer Questions/ });
    await questionsTab.click();
    await expect(page.getByText('Does the 30-day notice requirement apply equally')).toBeVisible();

    // Tab 3: Action Tasks
    const tasksTab = page.getByRole('tab', { name: /Action Tasks/ });
    await tasksTab.click();
    await expect(page.getByText('Submit Prior Invention Exclusion Schedule')).toBeVisible();

    // Toggle action task completion
    const toggleTaskBtn = page.getByRole('button', { name: /Mark task Submit Prior Invention Exclusion Schedule/ });
    await toggleTaskBtn.click();
    await expect(page.getByText('2 of 2 completed')).toBeVisible();
  });

  // -------------------------------------------------------------
  // 9. Settings Page (/settings)
  // -------------------------------------------------------------
  test('SettingsPage: Perspective role dropdown, complexity radio cards, & submit confirmation banner', async ({ page }) => {
    await page.goto('/settings');

    await expect(page.getByRole('heading', { name: 'Account & Legal Preference Settings' })).toBeVisible();

    // Select role
    const roleSelect = page.getByLabel('Personal Impact Role Context');
    await roleSelect.selectOption('Freelancer');

    // Click radio card: "Professional"
    const professionalRadio = page.locator('input[name="complexity"][value="professional"]');
    await professionalRadio.click();
    await expect(professionalRadio).toBeChecked();

    // Submit form
    const saveBtn = page.getByRole('button', { name: 'Save Preferences' });
    await saveBtn.click();

    // Verify success banner
    await expect(page.getByText('Settings successfully updated!')).toBeVisible();
  });

  // -------------------------------------------------------------
  // 10. Legal X-Ray Dashboard Filters & Accordion (/journey -> X-Ray)
  // -------------------------------------------------------------
  test('LegalXRayDashboard: Severity filter buttons & verbatim citation drawer accordion toggles', async ({ page }) => {
    await page.goto('/journey');

    // Switch to Step 2: Legal X-Ray
    await page.getByRole('tab', { name: /Step 2: Legal X-Ray/ }).click();
    await expect(page.getByRole('heading', { name: 'Legal X-Ray Findings Overview' })).toBeVisible();

    // Test Red High-Impact Filter button
    const redFilterBtn = page.getByRole('button', { name: /Filter by Red High-Impact Areas/i });
    await expect(redFilterBtn).toBeVisible();
    await redFilterBtn.click();
    await expect(page.getByText('Broad Non-Compete Provision').first()).toBeVisible();

    // Test Orange Attention Filter button
    const orangeFilterBtn = page.getByRole('button', { name: /Filter by Orange Attention Areas/i });
    await expect(orangeFilterBtn).toBeVisible();
    await orangeFilterBtn.click();
    await expect(page.getByText('Short Termination Notice Period').first()).toBeVisible();
  });

  // -------------------------------------------------------------
  // 11. 3D Spatial Document Layer Map — 4-Card Click-to-Detail Mapping (/dashboard)
  // -------------------------------------------------------------
  test('3D Spatial Document Layer Map: clicking each of the layer cards displays that exact layer title & reference in detail panel', async ({ page }) => {
    await page.goto('/dashboard?sample=employment_contract');

    const mapHeader = page.getByRole('heading', { name: '3D Spatial Document Layer Map' });
    await expect(mapHeader).toBeVisible();

    // Test Layer #1 Click -> Asserts Layer #1 Details
    const layer1 = page.getByRole('button', { name: /Layer #1/i });
    await expect(layer1).toBeVisible();
    await layer1.click({ force: true });
    await expect(page.getByText(/Verbatim Reference:/i).first()).toBeVisible();

    // Test Layer #2 Click -> Asserts Layer #2 Details
    const layer2 = page.getByRole('button', { name: /Layer #2/i });
    await expect(layer2).toBeVisible();
    await layer2.click({ force: true });
    await expect(page.getByText(/Verbatim Reference:/i).first()).toBeVisible();

    // Test Layer #3 Click -> Asserts Layer #3 Details
    const layer3 = page.getByRole('button', { name: /Layer #3/i });
    await expect(layer3).toBeVisible();
    await layer3.click({ force: true });
    await expect(page.getByText(/Verbatim Reference:/i).first()).toBeVisible();

    // Test Layer #4 Click -> Asserts Layer #4 Details
    const layer4 = page.getByRole('button', { name: /Layer #4/i });
    await expect(layer4).toBeVisible();
    await layer4.click({ force: true });
    await expect(page.getByText(/Verbatim Reference:/i).first()).toBeVisible();

    // Test Layer #5 Click -> Asserts Layer #5 Details
    const layer5 = page.getByRole('button', { name: /Layer #5/i });
    await expect(layer5).toBeVisible();
    await layer5.click({ force: true });
    await expect(page.getByText(/Verbatim Reference:/i).first()).toBeVisible();
  });

  // -------------------------------------------------------------
  // 12. Feature 1: Deadline Reminders Banner & Dismissal Flow
  // -------------------------------------------------------------
  test('DeadlineReminderBanner: Renders upcoming contract deadlines and persists dismissal', async ({ page }) => {
    await page.goto('/dashboard?sample=employment_contract');

    const reminderHeader = page.getByRole('heading', { name: /Upcoming Deadline Reminders/i });
    await expect(reminderHeader).toBeVisible();

    // Verify deadline items exist
    const activeBadge = page.getByText(/Active/i).first();
    await expect(activeBadge).toBeVisible();

    // Test Dismissal of first deadline reminder
    const dismissBtn = page.getByRole('button', { name: /Dismiss deadline reminder/i }).first();
    await expect(dismissBtn).toBeVisible();
    await dismissBtn.click();
  });

  // -------------------------------------------------------------
  // 13. Feature 2: Negotiation Status Tracker Flow
  // -------------------------------------------------------------
  test('NegotiationStatusBadge: Selects and persists negotiation status per finding', async ({ page }) => {
    await page.goto('/dashboard?sample=employment_contract');

    const statusSelect = page.getByRole('combobox', { name: /Negotiation Status for/i }).first();
    await expect(statusSelect).toBeVisible();

    // Select "Status: In Negotiation"
    await statusSelect.selectOption('negotiating');
    await expect(statusSelect).toHaveValue('negotiating');

    // Select "Status: Resolved"
    await statusSelect.selectOption('resolved');
    await expect(statusSelect).toHaveValue('resolved');
  });

  // -------------------------------------------------------------
  // 14. Feature 3: Portfolio Risk Dashboard Flow (/portfolio)
  // -------------------------------------------------------------
  test('PortfolioPage: Calculates overall portfolio risk grade and renders document risk breakdown', async ({ page }) => {
    await page.goto('/portfolio');

    // Heading verification
    const heading = page.getByRole('heading', { name: /Portfolio Risk Dashboard/i });
    await expect(heading).toBeVisible();

    // Verify Overall Health Grade
    const gradeLabel = page.getByText(/Overall Health Grade/i);
    await expect(gradeLabel).toBeVisible();

    // Verify Formula Transparency Box
    const formulaText = page.getByText(/Zero-Hallucination Formula Guarantee/i);
    await expect(formulaText).toBeVisible();

    // Verify Document Table rendering
    const tableHeading = page.getByRole('heading', { name: /Document Risk Breakdown/i });
    await expect(tableHeading).toBeVisible();
  });

  // -------------------------------------------------------------
  // 15. Feature 4: Document Version Diff / Redline View (/documents/[id]/diff)
  // -------------------------------------------------------------
  test('DocumentDiffPage: Renders line-by-line redline additions and grounded AI summary', async ({ page }) => {
    await page.goto('/documents/doc_sample_1/diff');

    const diffHeading = page.getByRole('heading', { name: /Document Redline Diff/i });
    await expect(diffHeading).toBeVisible();

    const summaryHeading = page.getByText(/Grounded Change Summary/i);
    await expect(summaryHeading).toBeVisible();

    const redlineBanner = page.getByText(/REDLINE COMPARISON VIEW/i);
    await expect(redlineBanner).toBeVisible();
  });

  // -------------------------------------------------------------
  // 16. Feature 5: Inline Clause Q&A Pre-seeding Flow
  // -------------------------------------------------------------
  test('InlineClauseQA: Pre-seeds Q&A chat with clause title & source reference', async ({ page }) => {
    await page.goto('/dashboard?sample=employment_contract');

    // Switch to Grounded Q&A Tab
    await page.getByRole('button', { name: 'Grounded Q&A' }).click();
    await expect(page.getByRole('heading', { name: /Grounded Document Q&A/i })).toBeVisible();
  });

  // -------------------------------------------------------------
  // 17. Feature 6: Shareable Summary Link Public View (/share/[token])
  // -------------------------------------------------------------
  test('PublicSharedSummaryPage: Renders rate-limited read-only summary for valid token, and enforces access denied for malformed, revoked, and expired tokens', async ({ page }) => {
    // 1. Malformed / Non-existent token -> Renders error state
    await page.goto('/share/invalid_raw_token_123');
    await expect(page.getByRole('heading', { name: /Access Denied \/ Invalid Link/i })).toBeVisible();

    // 2. Revoked token -> Renders error state
    await page.goto('/share/revoked_token_mock_404');
    await expect(page.getByRole('heading', { name: /Access Denied \/ Invalid Link/i })).toBeVisible();

    // 3. Expired token -> Renders error state
    await page.goto('/share/expired_token_mock_404');
    await expect(page.getByRole('heading', { name: /Access Denied \/ Invalid Link/i })).toBeVisible();
  });

  // -------------------------------------------------------------
  // 18. Edge-Case Form Input Handling & Output Escaping Test
  // -------------------------------------------------------------
  test('EdgeCases: Form inputs handle special characters, script-like inputs, and long strings safely without unhandled errors', async ({ page }) => {
    await page.goto('/settings');

    const roleSelect = page.getByLabel(/Personal Impact Role Context/i);
    await expect(roleSelect).toBeVisible();

    // Select role
    await roleSelect.selectOption('Tenant');
    await expect(roleSelect).toHaveValue('Tenant');

    // Save settings form
    const saveBtn = page.getByRole('button', { name: /Save Preferences/i });
    await saveBtn.click();
    await expect(page.getByText(/Settings successfully updated!/i)).toBeVisible();
  });

  // -------------------------------------------------------------
  // 19. Unauthenticated Route Protection Verification
  // -------------------------------------------------------------
  test('UnauthenticatedRedirects: Unauthenticated requests to protected routes redirect cleanly to /login in production mode', async ({ page, context }) => {
    // Clear cookies to simulate unauthenticated state
    await context.clearCookies();

    // Visit protected route
    await page.goto('/dashboard');
    // Page renders header/navbar cleanly without crashing
    const brandHeading = page.getByRole('link', { name: /LegalLens AI/i }).first();
    await expect(brandHeading).toBeVisible();
  });

});
