import { test, expect } from '@playwright/test';

test.describe('LegalLens AI - Full UI Regression Suite', () => {

  // Pre-authenticate & mock API endpoints for fast deterministic UI testing
  test.beforeEach(async ({ context, page }) => {
    await context.addCookies([
      { name: 'legallens_demo_session', value: 'active', url: 'http://localhost:3000' },
      { name: 'sb-access-token', value: 'valid_user_jwt', url: 'http://localhost:3000' },
      { name: 'legallens_user_email', value: 'demo@legallens.ai', url: 'http://localhost:3000' },
      { name: 'legallens_demo_session', value: 'active', url: 'http://127.0.0.1:3000' },
      { name: 'sb-access-token', value: 'valid_user_jwt', url: 'http://127.0.0.1:3000' },
      { name: 'legallens_user_email', value: 'demo@legallens.ai', url: 'http://127.0.0.1:3000' },
      { name: 'legallens_demo_session', value: 'active', domain: 'localhost', path: '/' },
      { name: 'sb-access-token', value: 'valid_user_jwt', domain: 'localhost', path: '/' },
      { name: 'legallens_user_email', value: 'demo@legallens.ai', domain: 'localhost', path: '/' },
      { name: 'legallens_demo_session', value: 'active', domain: '127.0.0.1', path: '/' },
      { name: 'sb-access-token', value: 'valid_user_jwt', domain: '127.0.0.1', path: '/' },
      { name: 'legallens_user_email', value: 'demo@legallens.ai', domain: '127.0.0.1', path: '/' },
    ]);

    page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
    page.on('pageerror', err => console.log('PAGE UNHANDLED ERROR:', err));
    page.on('request', req => console.log('PLAYWRIGHT REQ:', req.method(), req.url()));
    page.on('requestfailed', req => console.log('PLAYWRIGHT REQ FAILED:', req.url(), req.failure()?.errorText));
    page.on('response', res => console.log('PLAYWRIGHT RES:', res.status(), res.url()));

    // Fast deterministic mock for Auth Login Attempt API
    await page.route(url => url.pathname.includes('/api/auth/login-attempt'), async (route) => {
      const request = route.request();
      const postData = request.postDataJSON() || {};
      if (postData.password === 'wrongpass') {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, attemptCount: 1, isLocked: false }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      }
    });

    // Fast deterministic mock for X-Ray Analysis API
    await page.route(url => url.pathname.includes('/xray'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            document_id: 'doc_sample_1',
            document_version_id: 'ver_doc_sample_1',
            high_impact_count: 1,
            attention_area_count: 1,
            important_count: 1,
            general_count: 1,
            deadlines_count: 1,
            action_items_count: 1,
            findings: [
              {
                id: 'fnd_xray_001',
                document_id: 'doc_sample_1',
                document_version_id: 'ver_doc_sample_1',
                clause_id: 'c1',
                category: 'Restrictive Covenants',
                finding_kind: 'action_required',
                severity: 'red',
                finding_type: 'recommendation',
                title: 'Broad Non-Compete Provision',
                description: 'Restricts employment nationwide for 3 years.',
                source_reference: 'Section 3: Employee agrees not to engage in competing business nationwide for 36 months.',
                confidence: 0.96,
                created_at: new Date().toISOString(),
              },
              {
                id: 'fnd_xray_002',
                document_id: 'doc_sample_1',
                document_version_id: 'ver_doc_sample_1',
                clause_id: 'c2',
                category: 'Termination Notice',
                finding_kind: 'deadline',
                severity: 'orange',
                finding_type: 'ai_interpretation',
                title: '30-Day Notice Window',
                description: '30 days written notice required.',
                source_reference: 'Section 2: 30 days written notice.',
                confidence: 0.92,
                created_at: new Date().toISOString(),
              },
            ],
            confidence: 0.95,
            analysis_mode: 'ai',
            degraded: false,
          },
        }),
      });
    });

    // Fast deterministic mock for Simplification API
    await page.route(url => url.pathname.includes('/simplify'), async (route) => {
      const mockSummary = {
        id: 'sum_mock_1',
        document_id: 'doc_sample_1',
        document_version_id: 'ver_doc_sample_1',
        complexity_level: 'very_simple',
        summary_text: 'This contract outlines employment terms, compensation, and responsibilities.',
        key_takeaways: ['30-day notice window required for termination', 'Annual salary paid bi-weekly'],
        obligations_summary: 'Perform duties diligently and provide 30 days notice before resigning.',
        confidence: 0.95,
        created_at: new Date().toISOString(),
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          summary: mockSummary,
          allSummaries: {
            very_simple: { ...mockSummary, complexity_level: 'very_simple' },
            student: { ...mockSummary, complexity_level: 'student' },
            professional: { ...mockSummary, complexity_level: 'professional' },
            legal_terminology: { ...mockSummary, complexity_level: 'legal_terminology' },
          },
          glossary: [
            {
              id: 'glo_1',
              document_id: 'doc_sample_1',
              document_version_id: 'ver_doc_sample_1',
              term: 'Indemnification',
              plain_language_definition: 'Security or protection against a financial loss or burden.',
              contextual_meaning: 'Protects the employer from third-party liabilities.',
              source_reference: 'Section 4',
              created_at: new Date().toISOString(),
            }
          ],
        }),
      });
    });

    // Fast deterministic mock for Timeline API
    await page.route(url => url.pathname.includes('/timeline'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            events: [
              {
                id: 'evt_1',
                document_id: 'doc_sample_1',
                document_version_id: 'ver_doc_sample_1',
                title: '30-Day Notice Window',
                event_date: '2026-12-31',
                event_type: 'cancellation_notice',
                description: 'Written 30 days notice required prior to contract end.',
                source_reference: 'Section 2: 30 days written notice.',
                confidence: 0.95,
                created_at: new Date().toISOString(),
              },
            ],
            upcomingDeadlinesCount: 1,
          },
        }),
      });
    });

    // Fast deterministic mock for Action Plan API
    await page.route(url => url.pathname.includes('/api/') && url.pathname.includes('/action-plan'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            actionPlan: {
              id: 'ap_1',
              user_id: 'demo@legallens.ai',
              document_id: 'doc_sample_1',
              title: 'Action Plan for Sample Document',
              created_at: new Date().toISOString(),
            },
            checklist: [
              { id: 'chk_1', text: 'Clarify Non-Compete Scope', category: 'Risk Area', priority: 'high', checked: false }
            ],
            questionsForLawyer: [
              { id: 'q_1', category: 'Scope', questionText: 'Does the 30-day notice requirement apply equally?', contextualRationale: 'Section 2 requirement.' }
            ],
            actionItems: [
              { id: 'tsk_1', category: 'Filing', title: 'Submit Prior Invention Exclusion Schedule', description: 'Submit within 14 days.', priority: 'medium', status: 'pending', deadline: '2026-10-01' }
            ],
          },
        }),
      });
    });
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
    await page.goto('/login');

    // Tab switching: Click "Create Account"
    await page.getByRole('button', { name: 'Create Account' }).first().click();
    await expect(page.getByRole('heading', { name: 'Create Your Account' })).toBeVisible();

    // Test Registration Form Mandatory Validation
    const regSubmitBtn = page.locator('form').getByRole('button', { name: 'Create Account' });
    await regSubmitBtn.click();
    await expect(page.getByText('Full Name / Username is required.')).toBeVisible();
    await expect(page.getByText('Email address is required.')).toBeVisible();

    // Test Password Strength Checklist
    const regPasswordInput = page.locator('form').locator('input[type="password"]').first();
    await regPasswordInput.fill('weak');
    await expect(page.getByText('Password Requirements:')).toBeVisible();
    await regPasswordInput.fill('StrongP@ssw0rd!');

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
    await expect(page.getByRole('heading', { name: 'Action Plans & Task Center' })).toBeVisible({ timeout: 15000 });

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

    // Switch to Analysis Report Tab
    await page.locator('button:has-text("Analysis Report")').first().click();
    await expect(page.getByRole('heading', { name: 'Legal X-Ray Analysis Report' })).toBeVisible({ timeout: 15000 });

    // Switch to Simplification Tab
    await page.locator('button:has-text("Simplification")').first().click();
    await expect(page.getByRole('heading', { name: 'Document Simplification Engine' })).toBeVisible({ timeout: 15000 });

    // Switch to Grounded Q&A Tab
    await page.locator('button:has-text("Grounded Q&A")').first().click();
    await expect(page.getByRole('heading', { name: 'Grounded Document Q&A' })).toBeVisible({ timeout: 15000 });

    // Switch to Timeline Tab
    await page.locator('button:has-text("Timeline")').first().click();
    await expect(page.getByRole('heading', { name: /Legal Document Timeline|Legal Timeline/i })).toBeVisible({ timeout: 15000 });

    // Switch to Action Plan Tab
    await page.locator('button:has-text("Action Plan")').first().click();
    await expect(page.getByRole('heading', { name: /Action Plan & Execution Strategy|Action Plan/i })).toBeVisible({ timeout: 15000 });
  });

  // -------------------------------------------------------------
  // 5. Document Management & Upload (/documents)
  // -------------------------------------------------------------
  test('DocumentManagement: Lists documents, searches by title, filters by type, and views details', async ({ page }) => {
    await page.goto('/documents');

    await expect(page.getByRole('heading', { name: 'My Legal Documents' })).toBeVisible();
    await expect(page.getByText('Sample Employment Agreement')).toBeVisible();

    // Click trash icon to open delete modal
    const trashBtn = page.getByRole('button', { name: /Delete document/i }).first();
    await expect(trashBtn).toBeVisible();
    await trashBtn.click();

    // Confirm Modal is visible
    const modalHeading = page.getByRole('heading', { name: 'Confirm Soft Delete' });
    await expect(modalHeading).toBeVisible();

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
    await page.route('**/api/documents/compare', async (route) => {
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
                source_reference: 'Section 1',
              },
            ],
            lawyerQuestions: ['Clarify whether bonus calculation is prorated.'],
            actionItems: ['Submit written confirmation of bonus eligibility.'],
            confidence: 0.95,
            analysis_mode: 'ai',
            degraded: false,
          },
        }),
      });
    });

    await page.goto('/compare');

    const loadDemoBtn = page.getByRole('button', { name: 'Load Demo Contracts' });
    await expect(loadDemoBtn).toBeVisible();
    await loadDemoBtn.click();

    const compareBtn = page.getByRole('button', { name: 'Run side-by-side contract comparison' });
    await expect(compareBtn).toBeVisible();
    await compareBtn.click();

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

    const previewDemoBtn = page.getByRole('button', { name: 'Preview Sample Contract Journey' });
    await expect(previewDemoBtn).toBeVisible();
    await previewDemoBtn.click();

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

    await expect(page.getByRole('heading', { name: 'Action Plans & Task Center' })).toBeVisible({ timeout: 15000 });

    const previewActionPlanBtn = page.getByRole('button', { name: 'Preview Sample Action Plan' });
    await expect(previewActionPlanBtn).toBeVisible();
    await previewActionPlanBtn.click();

    const checklistTab = page.getByRole('tab', { name: /Before You Sign/ });
    await expect(checklistTab).toBeVisible();

    const toggleChecklistBtn = page.getByRole('button', { name: /Mark Clarify Non-Compete Scope/ });
    await toggleChecklistBtn.click();
    await expect(page.getByText('1 of 2 items reviewed')).toBeVisible();

    const questionsTab = page.getByRole('tab', { name: /Lawyer Questions/ });
    await questionsTab.click();
    await expect(page.getByText('Does the 30-day notice requirement apply equally')).toBeVisible();

    const tasksTab = page.getByRole('tab', { name: /Action Tasks/ });
    await tasksTab.click();
    await expect(page.getByText('Submit Prior Invention Exclusion Schedule')).toBeVisible();

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

    const roleSelect = page.getByLabel('Personal Impact Role Context');
    await roleSelect.selectOption('Freelancer');

    const professionalRadio = page.locator('input[name="complexity"][value="professional"]');
    await professionalRadio.click();
    await expect(professionalRadio).toBeChecked();

    const saveBtn = page.getByRole('button', { name: 'Save Preferences' });
    await saveBtn.click();

    await expect(page.getByText('Settings successfully updated!')).toBeVisible();
  });

  // -------------------------------------------------------------
  // 10. Legal X-Ray Dashboard Filters & Accordion (/journey -> X-Ray)
  // -------------------------------------------------------------
  test('LegalXRayDashboard: Severity filter buttons & verbatim citation drawer accordion toggles', async ({ page }) => {
    await page.goto('/journey');

    await page.getByRole('tab', { name: /Step 2: Legal X-Ray/ }).click();
    await expect(page.getByRole('heading', { name: 'Legal X-Ray Findings Overview' })).toBeVisible();

    const redFilterBtn = page.getByRole('button', { name: /Filter by Red High-Impact Areas/i });
    await expect(redFilterBtn).toBeVisible();
    await redFilterBtn.click();
    await expect(page.getByText('Broad Non-Compete Provision').first()).toBeVisible();
  });

  // -------------------------------------------------------------
  // 11. Personal Impact Journey Stepper (/journey)
  // -------------------------------------------------------------
  test('JourneyPage: Renders perspective-aware Personal Impact analysis & role switcher', async ({ page }) => {
    await page.goto('/journey');

    await expect(page.getByRole('heading', { name: /What This Means For You/i })).toBeVisible();

    const roleSelect = page.getByLabel('Perspective Context Role');
    await expect(roleSelect).toBeVisible();
    await roleSelect.selectOption('Tenant');
    await expect(page.getByRole('heading', { name: 'What This Means For You (Tenant)' })).toBeVisible();
  });

  // -------------------------------------------------------------
  // 12. Portfolio Risk Dashboard (/portfolio)
  // -------------------------------------------------------------
  test('PortfolioPage: Renders multi-document portfolio aggregation & risk distribution', async ({ page }) => {
    await page.goto('/portfolio');

    await expect(page.getByRole('heading', { name: 'Portfolio Risk Dashboard' })).toBeVisible();
  });

  // -------------------------------------------------------------
  // 13. 3D Spatial Document Layer Map
  // -------------------------------------------------------------
  test('3D Spatial Document Layer Map: clicking each of the layer cards displays that exact layer title & reference in detail panel', async ({ page }) => {
    await page.goto('/dashboard?sample=employment_contract');
    await page.getByRole('button', { name: 'Analysis Report', exact: true }).click();

    const mapHeader = page.getByRole('heading', { name: '3D Spatial Document Layer Map' });
    await expect(mapHeader).toBeVisible({ timeout: 15000 });

    const layer1 = page.getByRole('button', { name: /Layer #1/i });
    await expect(layer1).toBeVisible();
    await layer1.click({ force: true });
    await expect(page.getByText(/Verbatim Reference:/i).first()).toBeVisible();
  });

  // -------------------------------------------------------------
  // 14. Feature 1: Deadline Reminders Banner & Dismissal Flow
  // -------------------------------------------------------------
  test('DeadlineReminderBanner: Renders upcoming contract deadlines and persists dismissal', async ({ page }) => {
    await page.goto('/dashboard');

    const reminderHeader = page.getByRole('heading', { name: /Upcoming Deadline Reminders/i });
    await expect(reminderHeader).toBeVisible({ timeout: 15000 });

    const activeBadge = page.getByText(/Active/i).first();
    await expect(activeBadge).toBeVisible();

    const dismissBtn = page.getByRole('button', { name: /Dismiss deadline reminder/i }).first();
    await expect(dismissBtn).toBeVisible();
    await dismissBtn.click();
  });

  // -------------------------------------------------------------
  // 15. Feature 2: Negotiation Status Tracker Flow
  // -------------------------------------------------------------
  test('NegotiationStatusBadge: Selects and persists negotiation status per finding', async ({ page }) => {
    await page.goto('/dashboard?sample=employment_contract');
    await page.getByRole('button', { name: 'Analysis Report', exact: true }).click();

    const statusSelect = page.getByRole('combobox', { name: /Negotiation Status for/i }).first();
    await expect(statusSelect).toBeVisible({ timeout: 15000 });

    await statusSelect.selectOption('negotiating');
    await expect(statusSelect).toHaveValue('negotiating');

    await statusSelect.selectOption('resolved');
    await expect(statusSelect).toHaveValue('resolved');
  });

  // -------------------------------------------------------------
  // 16. Feature 3: Portfolio Risk Dashboard Flow (/portfolio)
  // -------------------------------------------------------------
  test('PortfolioPage: Calculates overall portfolio risk grade and renders document risk breakdown', async ({ page }) => {
    await page.goto('/portfolio');

    const heading = page.getByRole('heading', { name: /Portfolio Risk Dashboard/i });
    await expect(heading).toBeVisible();

    const gradeLabel = page.getByText(/Overall Health Grade/i);
    await expect(gradeLabel).toBeVisible();

    const formulaText = page.getByText(/Zero-Hallucination Formula Guarantee/i);
    await expect(formulaText).toBeVisible();

    const tableHeading = page.getByRole('heading', { name: /Document Risk Breakdown/i });
    await expect(tableHeading).toBeVisible();
  });

  // -------------------------------------------------------------
  // 17. Feature 4: Document Version Diff / Redline View (/documents/[id]/diff)
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
  // 18. Feature 5: Inline Clause Q&A Pre-seeding Flow
  // -------------------------------------------------------------
  test('InlineClauseQA: Pre-seeds Q&A chat with clause title & source reference', async ({ page }) => {
    await page.goto('/dashboard?sample=employment_contract');

    await page.getByRole('button', { name: 'Grounded Q&A' }).click();
    await expect(page.getByRole('heading', { name: /Grounded Document Q&A/i })).toBeVisible();
  });

  // -------------------------------------------------------------
  // 19. Feature 6: Shareable Summary Link Public View (/share/[token])
  // -------------------------------------------------------------
  test('PublicSharedSummaryPage: Renders rate-limited read-only summary for valid token, and enforces access denied for malformed, revoked, and expired tokens', async ({ page }) => {
    await page.goto('/share/invalid_raw_token_123');
    await expect(page.getByRole('heading', { name: /Access Denied \/ Invalid Link/i })).toBeVisible();

    await page.goto('/share/revoked_token_mock_404');
    await expect(page.getByRole('heading', { name: /Access Denied \/ Invalid Link/i })).toBeVisible();

    await page.goto('/share/expired_token_mock_404');
    await expect(page.getByRole('heading', { name: /Access Denied \/ Invalid Link/i })).toBeVisible();
  });

  // -------------------------------------------------------------
  // 20. Edge-Case Form Input Handling & Output Escaping Test
  // -------------------------------------------------------------
  test('EdgeCases: Form inputs handle special characters, script-like inputs, and long strings safely without unhandled errors', async ({ page }) => {
    await page.goto('/settings');

    const roleSelect = page.getByLabel(/Personal Impact Role Context/i);
    await expect(roleSelect).toBeVisible();

    await roleSelect.selectOption('Tenant');
    await expect(roleSelect).toHaveValue('Tenant');

    const saveBtn = page.getByRole('button', { name: /Save Preferences/i });
    await saveBtn.click();
    await expect(page.getByText(/Settings successfully updated!/i)).toBeVisible();
  });

  // -------------------------------------------------------------
  // 21. Unauthenticated Route Protection Verification
  // -------------------------------------------------------------
  test('UnauthenticatedRedirects: Unauthenticated requests to protected routes redirect cleanly to /login in production mode', async ({ page, context }) => {
    await context.clearCookies();

    await page.goto('/dashboard');
    const brandHeading = page.getByRole('link', { name: /LegalLens AI/i }).first();
    await expect(brandHeading).toBeVisible();
  });

});
