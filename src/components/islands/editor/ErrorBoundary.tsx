/**
 * React Error Boundary for the Publishing Studio.
 * Per AGENTS.md: icons from lucide-react. All values from CSS tokens.
 * Wraps every major section independently so one crash cannot destroy the session.
 */
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface EditorErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  /** Human-readable section name — shown in the default fallback */
  label?: string;
}

interface EditorErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class EditorErrorBoundary extends React.Component<
  EditorErrorBoundaryProps,
  EditorErrorBoundaryState
> {
  constructor(props: EditorErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): EditorErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // In production this would route to Sentry
    console.error(
      `[EditorErrorBoundary] "${this.props.label ?? 'unknown'}" crashed`,
      error,
      info
    );
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  override render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-xs)',
            padding: 'var(--space-lg)',
            minHeight: '120px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(220, 38, 38, 0.08)',
            }}
            aria-hidden="true"
          >
            <AlertCircle size={16} color="var(--color-error)" strokeWidth={1.75} aria-hidden="true" />
          </div>

          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--fs-caption)',
              fontWeight: 'var(--fw-medium)',
              color: 'var(--color-body-strong)',
              margin: 0,
            }}
          >
            {this.props.label
              ? `The ${this.props.label} encountered an error.`
              : 'Something went wrong.'}
          </p>

          {this.state.error && (
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--fs-caption)',
                color: 'var(--color-muted)',
                margin: 0,
                maxWidth: '320px',
              }}
            >
              {this.state.error.message}
            </p>
          )}

          <button
            onClick={this.handleReset}
            type="button"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--fs-caption)',
              fontWeight: 'var(--fw-medium)',
              color: 'var(--color-body-strong)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
              padding: 0,
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
