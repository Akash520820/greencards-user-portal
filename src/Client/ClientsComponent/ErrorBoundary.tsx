import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";


interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px 20px", textAlign: "center", fontFamily: "sans-serif" }}>
          <h2>Oops! Something went wrong.</h2>
          <p style={{ color: "#64748b" }}>
            An unexpected error occurred. Please refresh the page or return home.
          </p>
          <button
            onClick={() => window.location.assign("/")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#10b981",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600,
              marginTop: "16px",
            }}
          >
            Return to Homepage
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
