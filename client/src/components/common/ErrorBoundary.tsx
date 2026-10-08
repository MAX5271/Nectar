import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-linen p-6 text-ink">
          <Card variant="quiet" padding="lg" className="w-full max-w-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-tomato" aria-hidden="true" />
              <h2 className="font-display text-xl font-semibold text-ink">Something went wrong</h2>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              {this.state.error?.message || "This page ran into a problem loading."}
            </p>
            <div className="mt-6 flex gap-3">
              <Button variant="primary" onClick={() => window.location.reload()}>
                Reload page
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = "/";
                }}
              >
                Go home
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
