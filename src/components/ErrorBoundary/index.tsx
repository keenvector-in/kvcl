import { Component, type ErrorInfo, type ReactNode } from 'react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Replacement UI. Default: a one-line alert with the error message. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  /** Report the error (logging, telemetry). Default: console.error. */
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  error: Error | null;
}

/**
 * Keeps one crashing section from blanking the page: no silent failures.
 * Wrap each independent card or screen, not only the app root.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (this.props.onError) this.props.onError(error, info);
    else console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(error, this.reset);
    return (
      <p role="alert" className="text-sm text-danger">
        Something went wrong: {error.message}
      </p>
    );
  }
}
