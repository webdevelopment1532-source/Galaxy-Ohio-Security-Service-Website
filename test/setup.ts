import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { toHaveNoViolations } from 'jest-axe';
import React from 'react';

// Extend Vitest matchers with jest-dom matchers
expect.extend(matchers);
expect.extend(toHaveNoViolations);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

// Mock Next.js link
vi.mock('next/link', () => {
  return {
    __esModule: true,
    default: ({ children, href }: any) => {
      return React.createElement('a', { href }, children);
    },
  };
});
