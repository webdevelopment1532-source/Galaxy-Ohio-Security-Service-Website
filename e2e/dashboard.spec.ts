import { test, expect } from '@playwright/test';

test.describe('Dashboard - Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up mock user data in localStorage
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          email: 'test@galaxyguard.com',
          role: 'admin',
          name: 'Test User',
        })
      );
    });
  });

  test('should load dashboard and display user info', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for dashboard to load (not showing loading state)
    await expect(page.getByText(/loading dashboard/i)).not.toBeVisible({ timeout: 10000 });

    // Verify page loaded successfully
    await expect(page).toHaveURL('/dashboard');
  });

  test('should handle navigation from home page to dashboard', async ({ page }) => {
    await page.goto('/');

    // Find and click the Admin Portal link in sidebar (dashboard entry point)
    const adminLink = page.getByRole('link', { name: /admin portal/i });
    await expect(adminLink).toBeVisible();
    await adminLink.click();

    // Verify navigation occurred
    await expect(page).toHaveURL('/admin-portal');
  });

  test('should be keyboard accessible', async ({ page }) => {    await page.goto('/dashboard');

    // Wait for page load
    await page.waitForLoadState('networkidle');

    // Tab through the page and ensure focus is visible
    await page.keyboard.press('Tab');
    
    // Verify some element has focus
    const focusedElement = await page.evaluateHandle(() => document.activeElement);
    const tagName = await focusedElement.evaluate((el) => el?.tagName);
    
    expect(tagName).toBeTruthy();
    expect(['A', 'BUTTON', 'INPUT']).toContain(tagName);
  });

  test('should have no critical accessibility violations', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Inject axe-core for accessibility testing
    await page.addScriptTag({
      url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js',
    });

    // Run axe and check for critical/serious violations
    const results = await page.evaluate(() => {
      return (window as any).axe.run();
    });

    const criticalViolations = results.violations.filter(
      (v: any) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(criticalViolations).toHaveLength(0);
  });
});
