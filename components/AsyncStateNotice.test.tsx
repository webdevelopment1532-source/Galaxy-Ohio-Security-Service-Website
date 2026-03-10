import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import AsyncStateNotice from './AsyncStateNotice';

describe('AsyncStateNotice', () => {
  describe('Accessibility', () => {
    it('should have no axe violations in loading state', async () => {
      const { container } = render(<AsyncStateNotice loading />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no axe violations in error state', async () => {
      const { container } = render(
        <AsyncStateNotice error="Something went wrong" retryAction={() => {}} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no axe violations in empty state', async () => {
      const { container } = render(<AsyncStateNotice empty />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no axe violations with children content', async () => {
      const { container } = render(
        <AsyncStateNotice>
          <div>Content</div>
        </AsyncStateNotice>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Loading State', () => {
    it('should render loading message with proper ARIA attributes', () => {
      render(<AsyncStateNotice loading loadingMessage="Please wait..." />);
      
      const status = screen.getByRole('status');
      expect(status).toBeInTheDocument();
      expect(status).toHaveAttribute('aria-busy', 'true');
      expect(status).toHaveAttribute('aria-live', 'polite');
      expect(screen.getByText('Please wait...')).toBeInTheDocument();
    });

    it('should use default loading message if not provided', () => {
      render(<AsyncStateNotice loading />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should render error message with role="alert"', () => {
      render(<AsyncStateNotice error="Network error occurred" />);
      
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(screen.getByText('Network error occurred')).toBeInTheDocument();
    });

    it('should render retry button when retryAction provided', async () => {
      const user = userEvent.setup();
      const retryFn = vi.fn();
      
      render(<AsyncStateNotice error="Failed to load" retryAction={retryFn} />);
      
      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();
      
      await user.click(retryButton);
      expect(retryFn).toHaveBeenCalledTimes(1);
    });

    it('should not render retry button when retryAction not provided', () => {
      render(<AsyncStateNotice error="Failed to load" />);
      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should render empty message with role="status"', () => {
      render(<AsyncStateNotice empty emptyMessage="No items found" />);
      
      const status = screen.getByRole('status');
      expect(status).toBeInTheDocument();
      expect(screen.getByText('No items found')).toBeInTheDocument();
    });

    it('should use default empty message if not provided', () => {
      render(<AsyncStateNotice empty />);
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    it('should render children when no error, not loading, not empty', () => {
      render(
        <AsyncStateNotice>
          <div data-testid="success-content">Success!</div>
        </AsyncStateNotice>
      );
      
      expect(screen.getByTestId('success-content')).toBeInTheDocument();
      expect(screen.getByText('Success!')).toBeInTheDocument();
    });
  });

  describe('State Priority', () => {
    it('should show loading state first (priority over error)', () => {
      render(<AsyncStateNotice loading error="Error message" />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should show error state over empty', () => {
      render(<AsyncStateNotice error="Error" empty />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.queryByText('No data available')).not.toBeInTheDocument();
    });

    it('should show empty state over children', () => {
      render(
        <AsyncStateNotice empty>
          <div>Content</div>
        </AsyncStateNotice>
      );
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });
  });
});
