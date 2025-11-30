import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full text-center border border-red-100">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              ⚠️
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">אופס, משהו השתבש</h1>
            <p className="text-slate-500 mb-6">
              האפליקציה נתקלה בשגיאה לא צפויה.
            </p>
            <div className="bg-slate-100 p-4 rounded text-left text-xs font-mono text-red-600 overflow-auto max-h-40 mb-6 dir-ltr">
              {this.state.error?.toString()}
            </div>
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
              onClick={() => window.location.reload()}
            >
              רענן את העמוד
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;