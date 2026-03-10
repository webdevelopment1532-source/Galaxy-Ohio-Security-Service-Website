import { test, expect } from '@playwright/test';

const backendApiBaseUrl = 'http://localhost:4000';

test.describe('Auth And Enrollments Flows', () => {
  test('logs in and redirects to the dashboard', async ({ page }) => {
    test.setTimeout(90000);

    await page.route(`${backendApiBaseUrl}/api/login`, async (route) => {
      const request = route.request();
      const body = request.postDataJSON();

      expect(body).toEqual({
        email: 'admin@galaxyguard.com',
        password: 'super-secret',
      });

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 7,
          full_name: 'Admin User',
          email: 'admin@galaxyguard.com',
          role: 'admin',
          status: 'active',
          created_at: '2026-03-08T12:00:00.000Z',
        }),
      });
    });

    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.locator('input[name="email"]').fill('admin@galaxyguard.com');
    await page.locator('input[name="password"]').fill('super-secret');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Login successful! Redirecting to dashboard...')).toBeVisible();
    await page.waitForURL('**/dashboard', { timeout: 30000 });
    await expect(page.getByText('Admin Dashboard')).toBeVisible();

    const storedUser = await page.evaluate(() => window.localStorage.getItem('user'));
    expect(storedUser).toContain('admin@galaxyguard.com');
  });

  test('loads and displays enrollments for the signed-in user', async ({ page }) => {
    test.setTimeout(90000);

    await page.addInitScript(() => {
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          id: 42,
          full_name: 'Enrollment User',
          email: 'learner@galaxyguard.com',
          role: 'customer',
          status: 'active',
        })
      );
    });

    await page.route(`${backendApiBaseUrl}/api/enrollments?userId=42`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            program_name: 'Cyber Security Fundamentals',
            status: 'active',
            enrolled_date: '2026-03-01T00:00:00.000Z',
          },
          {
            id: 2,
            program_name: 'Full Stack Web Bootcamp',
            status: 'completed',
            enrolled_date: '2026-01-15T00:00:00.000Z',
            completion_date: '2026-02-15T00:00:00.000Z',
          },
        ]),
      });
    });

    const enrollmentsResponse = page.waitForResponse(
      `${backendApiBaseUrl}/api/enrollments?userId=42`
    );

    await page.goto('/enrollments', { waitUntil: 'domcontentloaded' });
    await enrollmentsResponse;

    await expect(page.getByText('Cyber Security Fundamentals')).toBeVisible();
    await expect(page.getByText('Full Stack Web Bootcamp')).toBeVisible();
    await expect(page.getByText('active')).toBeVisible();
    await expect(page.getByText('completed', { exact: true })).toBeVisible();
  });
});