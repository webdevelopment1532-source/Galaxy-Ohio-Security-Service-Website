import React from 'react';

export interface AsyncStateNoticeProps {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyMessage?: string;
  loadingMessage?: string;
  retryAction?: () => void;
  children?: React.ReactNode;
}

/**
 * AsyncStateNotice - Reusable accessibility-first async state component
 * 
 * Handles loading, error, empty, and success states with proper ARIA semantics:
 * - Loading: aria-busy, role="status", live region
 * - Error: role="alert", retry button with clear action
 * - Empty: role="status" for graceful empty state
 * - Success: renders children
 * 
 * Based on Sales Center's proven pattern for consistent async feedback.
 */
export default function AsyncStateNotice({
  loading = false,
  error = null,
  empty = false,
  emptyMessage = 'No data available',
  loadingMessage = 'Loading...',
  retryAction,
  children,
}: AsyncStateNoticeProps) {
  if (loading) {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-live="polite"
        style={{ padding: '2rem', textAlign: 'center' }}
      >
        <span className="loading-spinner" aria-hidden="true">
          ⏳
        </span>
        <span style={{ marginLeft: '0.5rem' }}>{loadingMessage}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        style={{
          padding: '1.5rem',
          background: '#fee',
          border: '2px solid #c33',
          borderRadius: '8px',
          margin: '1rem 0',
        }}
      >
        <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#c33' }}>
          Error
        </strong>
        <p style={{ margin: '0.5rem 0' }}>{error}</p>
        {retryAction && (
          <button
            onClick={retryAction}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#c33',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#a22')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#c33')}
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (empty) {
    return (
      <div
        role="status"
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#666',
          fontStyle: 'italic',
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  return <>{children}</>;
}
