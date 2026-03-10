import '@vitest/expect';

declare module 'jest-axe' {
  export function axe(container: Element | DocumentFragment): Promise<unknown>;
  export const toHaveNoViolations: {
    toHaveNoViolations(results: unknown): { pass: boolean; message: () => string };
  };
}

declare module '@vitest/expect' {
  interface Assertion<T = any> {
    toHaveNoViolations(): T;
  }
}