import React from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

interface ErrorViewProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorView: React.FC<ErrorViewProps> = ({ message, onRetry }) => {
  const { navigate, resetAllData } = useApp();

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center bg-white border border-slate-200 rounded-2xl p-8 shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <AlertTriangle className="w-6 h-6 text-rose-600" />
        </div>

        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Something went wrong
        </h1>

        <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
          {message || 'An unexpected error occurred. Your data is safe. Please try again.'}
        </p>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try again</span>
            </button>
          )}

          <button
            onClick={() => navigate({ type: 'workspaces' })}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go to my workspaces</span>
          </button>
        </div>
      </div>
    </div>
  );
};
