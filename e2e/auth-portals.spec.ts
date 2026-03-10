import { test, expect } from '@playwright/test';

const backendApiBaseUrl = 'http://localhost:4000';

test.describe('Account And Portal Flows', () => {
  test('creates an account with the selected role', async ({ page }) => {
    test.setTimeout(90000);

    await page.route(`${backendApiBaseUrl}/api/register`, async (route) => {
      const payload = route.request().postDataJSON();

      expect(payload).toEqual({
        full_name: 'Casey Customer',
        email: 'casey@galaxyguard.com',
        password: 'create-account-secret',
        role: 'customer',
      });

      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Account created successfully.' }),
      });
    });

    const dialogPromise = page.waitForEvent('dialog');

    await page.goto('/create-account', { waitUntil: 'domcontentloaded' });
    await page.locator('input[name="name"]').fill('Casey Customer');
    await page.locator('input[name="email"]').fill('casey@galaxyguard.com');
    await page.locator('input[name="password"]').fill('create-account-secret');
    await page.locator('select[name="role"]').selectOption('customer');
    await page.getByRole('button', { name: 'Sign Up' }).click();

    const dialog = await dialogPromise;
    expect(dialog.message()).toBe('Account created successfully!');
    await dialog.accept();
  });

  test('customer portal accepts customer credentials and redirects', async ({ page }) => {
    test.setTimeout(90000);

    await page.route(`${backendApiBaseUrl}/api/login`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 21,
          full_name: 'Chris Customer',
          email: 'chris@galaxyguard.com',
          role: 'customer',
          status: 'active',
          created_at: '2026-03-08T12:00:00.000Z',
        }),
      });
    });

    await page.goto('/customer-portal', { waitUntil: 'domcontentloaded' });
    await page.locator('input[name="email"]').fill('chris@galaxyguard.com');
    await page.locator('input[name="password"]').fill('customer-secret');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Login successful! Loading your customer dashboard...')).toBeVisible();
    await page.waitForURL('**/dashboard', { timeout: 30000 });
    await expect(page.getByText('Welcome, Chris Customer!')).toBeVisible();
  });

  test('admin portal rejects non-admin credentials with a clear error', async ({ page }) => {
    test.setTimeout(90000);

    await page.route(`${backendApiBaseUrl}/api/login`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 33,
          full_name: 'Morgan Manager',
          email: 'morgan@galaxyguard.com',
          role: 'manager',
          status: 'active',
          created_at: '2026-03-08T12:00:00.000Z',
        }),
      });
    });

    await page.goto('/admin-portal', { waitUntil: 'domcontentloaded' });
    await page.locator('input[name="email"]').fill('morgan@galaxyguard.com');
    await page.locator('input[name="password"]').fill('manager-secret');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.locator('div[role="alert"]').first()).toContainText('Access denied. Administrator privileges required.');
    await expect(page).toHaveURL(/\/admin-portal$/);
  });
});