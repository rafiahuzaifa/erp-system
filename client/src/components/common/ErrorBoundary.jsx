import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Component stack:', info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="text-center max-w-2xl w-full">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-500 mb-4">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            {isDev && this.state.error && (
              <div className="mb-4 text-left bg-red-50 border border-red-200 rounded-lg p-4 overflow-auto max-h-64">
                <p className="text-red-700 font-mono text-sm font-bold mb-1">{this.state.error.toString()}</p>
                {this.state.info?.componentStack && (
                  <pre className="text-red-600 font-mono text-xs whitespace-pre-wrap">
                    {this.state.info.componentStack}
                  </pre>
                )}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
