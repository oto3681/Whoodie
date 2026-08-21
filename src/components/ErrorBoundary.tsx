import React, { ErrorInfo, ReactNode } from 'react';
import { clearAppLocalStorage } from '../utils/storage';
import { AlertTriangle, RefreshCw, Trash2, MessageCircle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Woodynat ErrorBoundary] Caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetCache = () => {
    clearAppLocalStorage();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans antialiased text-slate-900">
          <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 text-center space-y-5">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Something went wrong
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                An unexpected interface error occurred. You can easily reload the application or reset local cache to restore full functionality.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left overflow-x-auto max-h-32 text-xs font-mono text-slate-700">
                <span className="font-bold text-red-600 block mb-1">Error message:</span>
                {this.state.error.toString()}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload App</span>
              </button>

              <button
                onClick={this.handleResetCache}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                <span>Reset Cache & Reload</span>
              </button>
            </div>

            <div className="pt-3 border-t border-slate-200">
              <a
                href="https://wa.me/254797939199?text=Hi%20Woodynat%20Designers,%20I%20encountered%20an%20error%20on%20the%20app."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Need support? Chat with us on WhatsApp (0797939199)</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
