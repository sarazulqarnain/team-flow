import React from 'react';
import { useApp } from '../context/AppContext';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export const NotFoundView: React.FC = () => {
  const { navigate } = useApp();

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center bg-white border border-slate-200 rounded-2xl p-8 shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-4">
          <FileQuestion className="w-6 h-6 text-slate-700" />
        </div>

        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Page not found
        </h1>

        <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
          We couldn&apos;t find this page or the item does not exist.
        </p>

        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
          <button
            onClick={() => navigate({ type: 'workspaces' })}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go to my workspaces</span>
          </button>
        </div>
      </div>
    </div>
  );
};
