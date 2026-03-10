# Testing Guide - Ohio Frontend

This document describes the testing infrastructure and practices for the Galaxy Guard Ohio Next.js application, aligned with Sales Center's proven patterns.

## Overview

The Ohio frontend implements a comprehensive testing strategy:

1. **Unit & Accessibility Tests** - Vitest + jsdom + Axe
2. **E2E & Integration Tests** - Playwright
3. **Linting with A11y Rules** - ESLint + jsx-a11y plugin
4. **CI/CD Automation** - GitHub Actions

## Testing Stack

### Vitest (Unit & Component Tests)
- **Framework**: Vitest 4.x
- **DOM Environment**: jsdom
- **React Testing**: Testing Library
- **Accessibility**: jest-axe (Axe-core)

### Playwright (E2E Tests)
- **Browser**: Chromium (extendable to Firefox/Safari)
- **Tracing**: On first retry
- **Screenshots**: On failure
- **Parallel**: Yes (CI: serial, Local: parallel)

### ESLint (Static Analysis)
- **Config**: `eslint-config-next` + `jsx-a11y`
- **Rules**: WCAG 2.1 AA compliance

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm run test:all

# Run specific test suites
npm run test:unit          # Unit tests
npm run test:a11y          # Accessibility tests (same as unit, verbose output)
npm run test:e2e           # E2E tests
npm run test:backend       # Backend integration tests
npm run lint:check         # Lint with zero warnings

# Watch mode (development)
npm run test:watch         # Vitest watch mode

# E2E UI mode (debugging)
npm run test:e2e:ui        # Playwright UI
npm run test:e2e:debug     # Playwright debug mode
```

## Writing Tests

### Unit & Accessibility Tests

#### Basic Component Test

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import MyComponent from './MyComponent';

expect.extend(toHaveNoViolations);

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent title="Hello" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<MyComponent title="Hello" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

#### Async State Testing

```tsx
describe('AsyncComponent', () => {
  it('should show loading state initially', () => {
    render(<AsyncComponent />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });

  it('should show error with retry button', async () => {
    const retryFn = vi.fn();
    render(<AsyncStateNotice error="Failed" retryAction={retryFn} />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    
    const retryButton = screen.getByRole('button', { name: /retry/i });
    await user.click(retryButton);
    expect(retryFn).toHaveBeenCalled();
  });
});
```

#### Testing with User Interactions

```tsx
import userEvent from '@testing-library/user-event';

describe('Form', () => {
  it('should submit form with keyboard', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    
    render(<MyForm onSubmit={onSubmit} />);
    
    await user.type(screen.getByLabelText('Name'), 'John Doe');
    await user.keyboard('{Enter}');
    
    expect(onSubmit).toHaveBeenCalledWith({ name: 'John Doe' });
  });
});
```

### Playwright E2E Tests

#### Basic Navigation Test

```ts
import { test, expect } from '@playwright/test';

test('should navigate from home to dashboard', async ({ page }) => {
  await page.goto('/');
  
  await page.getByRole('link', { name: /dashboard/i }).click();
  
  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
});
```

#### Accessibility Smoke Test

```ts
test('should have no critical a11y violations', async ({ page }) => {
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');

  // Inject axe-core
  await page.addScriptTag({
    url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js',
  });

  // Run axe
  const results = await page.evaluate(() => {
    return (window as any).axe.run();
  });

  const criticalViolations = results.violations.filter(
    (v: any) => v.impact === 'critical' || v.impact === 'serious'
  );

  expect(criticalViolations).toHaveLength(0);
});
```

#### Keyboard Navigation Test

```ts
test('should be fully keyboard accessible', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Tab to first interactive element
  await page.keyboard.press('Tab');
  
  // Verify focus is visible
  const focusedElement = await page.evaluateHandle(() => document.activeElement);
  const tagName = await focusedElement.evaluate((el) => el?.tagName);
  
  expect(['A', 'BUTTON', 'INPUT']).toContain(tagName);
});
```

## Testing Patterns

### AsyncStateNotice Pattern

Use `AsyncStateNotice` for all async data-loading components:

```tsx
function MyDataComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchData();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AsyncStateNotice
      loading={loading}
      error={error}
      empty={!data && !loading && !error}
      retryAction={loadData}
    >
      <DataDisplay data={data} />
    </AsyncStateNotice>
  );
}
```

### Menu Navigation Hook

Use `useMenuNavigation` for all dropdown/menu components:

```tsx
function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useMenuNavigation({
    isOpen,
    onClose: () => setIsOpen(false),
    triggerRef,
  });

  return (
    <>
      <button ref={triggerRef} onClick={() => setIsOpen(!isOpen)}>
        Menu
      </button>
      {isOpen && (
        <div ref={menuRef} role="menu">
          <button role="menuitem">Item 1</button>
          <button role="menuitem">Item 2</button>
        </div>
      )}
    </>
  );
}
```

## Accessibility Checklist

Before merging any component:

- [ ] All interactive elements have accessible names
- [ ] Forms have associated labels
- [ ] Loading states use `aria-busy` and `role="status"`
- [ ] Errors use `role="alert"`
- [ ] Keyboard navigation works (Tab, Arrow keys, Escape, Enter)
- [ ] Focus is visible and logical
- [ ] Color contrast meets WCAG AA (4.5:1 minimum)
- [ ] No axe violations in tests
- [ ] Screen reader tested (NVDA, Narrator, or VoiceOver)

## CI/CD Integration

### Frontend CI (`frontend-ci.yml`)

Runs on every push/PR:
1. **Lint** - ESLint with a11y rules
2. **Unit Tests** - Vitest with coverage
3. **A11y Tests** - Axe integration tests
4. **E2E Tests** - Playwright smoke tests
5. **Build** - Production build validation

### Backend CI (`backend-ci.yml`)

Runs on backend changes:
1. **Backend Tests** - Node.js test runner
2. **Security Scan** - npm audit (blocks on critical)

### Artifacts

CI preserves:
- Playwright HTML report (30 days)
- Playwright traces on failure (7 days)
- Screenshots on failure (7 days)

## Coverage Goals

- **Unit Tests**: 80%+ statement coverage
- **A11y Tests**: 100% of interactive components
- **E2E Tests**: All critical user flows
- **Lint**: Zero warnings

## Troubleshooting

### Tests Failing Locally

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm ci

# Ensure browsers are installed
npx playwright install --with-deps chromium
```

### Axe Violations

1. Run tests with `--reporter=verbose` to see details
2. Fix violations starting with critical/serious
3. Consult WCAG 2.1 docs: https://www.w3.org/WAI/WCAG21/quickref/

### E2E Flakiness

1. Add explicit waits: `await page.waitForLoadState('networkidle')`
2. Use specific locators: `getByRole`, `getByLabel`
3. Check traces in `test-results/` directory
4. Run in UI mode: `npm run test:e2e:ui`

## Best Practices

1. **Unit test business logic** - Pure functions, hooks, utilities
2. **A11y test components** - All user-facing components with axe
3. **E2E test user flows** - Critical paths, not every interaction
4. **Mock external dependencies** - Use Vitest `vi.mock()` for APIs
5. **Test loading/error/empty states** - Not just happy path
6. **Use semantic queries** - `getByRole`, `getByLabelText` (not `getByTestId`)
7. **Avoid implementation details** - Test behavior, not internals

## Resources

- [Testing Library Best Practices](https://testing-library.com/docs/queries/about)
- [Playwright Documentation](https://playwright.dev/)
- [Axe Rules Reference](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
