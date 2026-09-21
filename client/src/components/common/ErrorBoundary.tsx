import { Component, type ErrorInfo, type ReactNode } from "react";

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
    console.error("[SYSTEM ERROR CAUGHT BY BOUNDARY]", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
          <div className="border-4 border-red-600 bg-black p-8 max-w-lg w-full shadow-[8px_8px_0px_0px_rgba(255,0,0,0.3)]">
            <h2 className="text-xl font-black uppercase tracking-widest text-red-500 mb-4 border-b-2 border-zinc-800 pb-2">
              [ Critical Interface Fault ]
            </h2>
            <p className="text-xs font-mono text-zinc-400 mb-6 leading-relaxed">
              {this.state.error?.message || "An unexpected system anomaly occurred."}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-3 bg-red-600 text-black font-black uppercase tracking-widest text-xs hover:bg-red-500 transition-colors"
              >
                Reboot System
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = "/";
                }}
                className="flex-1 py-3 border-2 border-zinc-700 text-zinc-300 font-black uppercase tracking-widest text-xs hover:border-zinc-500 hover:text-white transition-colors"
              >
                Return to Base
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
