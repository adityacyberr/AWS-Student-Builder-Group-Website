import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface BoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface BoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * A standard React Error Boundary for CMS dashboard components and public widgets.
 */
export class CMSErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  public state: BoundaryState = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): BoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught CMS error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="border border-red-500/20 bg-red-950/10 rounded-xl p-6 text-center space-y-4 my-4 animate-fade-in">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-zinc-200">Something went wrong</h3>
            <p className="text-xs text-zinc-500">
              An unexpected error occurred while loading this section.
            </p>
          </div>
          {this.state.error && (
            <pre className="text-[10px] text-red-400 bg-black/30 p-2 rounded border border-red-500/10 max-w-full overflow-x-auto text-left font-mono">
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 px-3.5 py-2 rounded-lg hover:bg-zinc-850 transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

interface StateProps {
  message: string;
  onRetry?: () => void;
}

/**
 * A functional error state indicator component for display when asynchronous operations fail.
 */
export function CMSErrorState({ message, onRetry }: StateProps) {
  return (
    <div className="border border-zinc-900 bg-zinc-950/20 rounded-xl p-6 text-center space-y-4 my-4 animate-fade-in">
      <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-850">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-zinc-200">Content Unavailable</h3>
        <p className="text-xs text-zinc-500">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 px-3.5 py-2 rounded-lg hover:bg-zinc-850 transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry Connection
        </button>
      )}
    </div>
  );
}
