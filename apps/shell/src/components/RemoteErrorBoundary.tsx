import { Component, type ErrorInfo } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@modulus/ui";

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  remoteName: string;
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

// ─── Component ────────────────────────────────────────────────────────────────

export class RemoteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    // In production this would go to an observability platform
    void Promise.resolve().then(() => {
      // eslint-disable-next-line no-console
      console.error(`[RemoteErrorBoundary] ${this.props.remoteName} failed to load:`, error, info);
    });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            {this.props.remoteName} failed to load
          </h2>
          <p className="mb-6 max-w-sm text-sm text-gray-500">
            This section is temporarily unavailable. The other sections of the platform are unaffected.
          </p>
          <Button variant="outline" size="sm" onClick={this.handleRetry}>
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
