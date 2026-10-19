import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, AlertCircle } from 'lucide-react';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({ isOpen, onClose }) => {
  const { createWorkspace } = useApp();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setError('Enter a name (1-80 characters).');
      return;
    }
    if (trimmed.length > 80) {
      setError(`Workspace name cannot exceed 80 characters (${trimmed.length}/80).`);
      return;
    }

    setIsSaving(true);
    try {
      const res = await createWorkspace(trimmed);
      setIsSaving(false);
      if (res.success && res.workspaceId) {
        setName('');
        onClose();
        // Automatically redirects to the new workspace board in S04
        window.location.hash = `#/w/${res.workspaceId}`;
      } else {
        setError(res.error || "We couldn't save. Your name is kept. Try again.");
      }
    } catch {
      setIsSaving(false);
      setError("We couldn't save. Your name is kept. Try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div
        role="dialog"
        aria-labelledby="create-workspace-title"
        className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-lg p-6 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 id="create-workspace-title" className="text-base font-bold text-slate-900">
            Create workspace
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="workspace-name" className="text-xs font-semibold text-slate-700">
                Workspace name
              </label>
              <span className={`text-[11px] tabular-nums ${name.length > 80 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                {name.length}/80
              </span>
            </div>
            <input
              id="workspace-name"
              type="text"
              autoFocus
              maxLength={100}
              placeholder="e.g. Final Project Team"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Pick a clear name for your team or project. You will become the Owner.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
