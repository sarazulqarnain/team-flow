import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskStatus, User } from '../types';
import { X, AlertCircle, Trash2, Calendar, User as UserIcon, Clock, CheckCircle } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  workspaceId: string;
  taskId?: string | null; // If provided, viewing/editing existing task; if null, creating new task
  onClose: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, workspaceId, taskId, onClose }) => {
  const {
    tasks,
    workspaces,
    createTask,
    updateTaskDetails,
    updateTaskStatus,
    deleteTask,
    getUserById,
    isTaskOverdue,
  } = useApp();

  const workspace = workspaces.find((w) => w.id === workspaceId);
  const existingTask = taskId ? tasks.find((t) => t.id === taskId) : null;

  // Form states
  const [title, setTitle] = useState('');
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [status, setStatus] = useState<TaskStatus>('To do');
  const [dueDate, setDueDate] = useState<string>('');
  
  // UI states
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditingExisting, setIsEditingExisting] = useState(false);

  // Populate data when opening
  useEffect(() => {
    if (existingTask) {
      setTitle(existingTask.title);
      setAssigneeId(existingTask.assigneeId);
      setStatus(existingTask.status);
      setDueDate(existingTask.dueDate || '');
      setIsEditingExisting(false);
      setError(null);
      setShowDeleteConfirm(false);
    } else {
      setTitle('');
      setAssigneeId(null);
      setStatus('To do');
      setDueDate('');
      setIsEditingExisting(true);
      setError(null);
      setShowDeleteConfirm(false);
    }
  }, [existingTask, taskId, isOpen]);

  if (!isOpen) return null;

  // If taskId was requested but not found in tasks (e.g., deleted or invalid deep link)
  if (taskId && !existingTask) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Task details</h2>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="py-6 text-center">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">This task no longer exists</p>
            <p className="text-xs text-slate-500 mt-1">
              It may have been deleted or moved by another team member.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
            >
              Return to board
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isPastDue = dueDate && dueDate < '2026-10-19';

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = title.trim();
    if (!trimmed) {
      setError('Enter a title (1-120 characters).');
      return;
    }
    if (trimmed.length > 120) {
      setError(`Task title cannot exceed 120 characters (${trimmed.length}/120).`);
      return;
    }

    setIsSaving(true);
    try {
      const res = await createTask(workspaceId, trimmed, assigneeId, dueDate || null);
      setIsSaving(false);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || "We couldn't save. Your title is kept. Try again.");
      }
    } catch {
      setIsSaving(false);
      setError("We couldn't save. Your title is kept. Try again.");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingTask) return;
    setError(null);

    const trimmed = title.trim();
    if (!trimmed) {
      setError('Enter a title (1-120 characters).');
      return;
    }
    if (trimmed.length > 120) {
      setError(`Task title cannot exceed 120 characters (${trimmed.length}/120).`);
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateTaskDetails(existingTask.id, {
        title: trimmed,
        assigneeId,
        dueDate: dueDate || null,
        status,
      });
      setIsSaving(false);
      if (res.success) {
        setIsEditingExisting(false);
        onClose();
      } else {
        setError(res.error || 'Failed to update task.');
      }
    } catch {
      setIsSaving(false);
      setError('Failed to update task.');
    }
  };

  const handleQuickStatusChange = async (newStatus: TaskStatus) => {
    if (!existingTask) return;
    setStatus(newStatus);
    const res = await updateTaskStatus(existingTask.id, newStatus);
    if (!res.success) {
      setError(res.error || 'Failed to update status.');
    }
  };

  const handleDelete = async () => {
    if (!existingTask) return;
    setIsDeleting(true);
    try {
      const res = await deleteTask(existingTask.id);
      setIsDeleting(false);
      if (res.success) {
        setShowDeleteConfirm(false);
        onClose();
      } else {
        setError(res.error || 'Failed to delete task.');
      }
    } catch {
      setIsDeleting(false);
      setError('Failed to delete task.');
    }
  };

  const members =
    workspace?.members
      .map((m) => getUserById(m.userId))
      .filter((u): u is User => u !== null) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div
        role="dialog"
        aria-labelledby="task-modal-title"
        className="w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-lg p-6 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 id="task-modal-title" className="text-base font-bold text-slate-900">
              {existingTask ? 'Task Details' : 'Add Task'}
            </h2>
            {existingTask && (
              <span className="text-xs text-slate-400 font-mono">
                #{existingTask.id.replace('task-', '')}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        {/* Delete Confirmation Modal (V1.0 F8) */}
        {showDeleteConfirm ? (
          <div className="mt-4 p-4 bg-rose-50/60 border border-rose-200 rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <Trash2 className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-rose-900">Delete this task?</p>
                <p className="mt-1 text-xs text-rose-800">
                  This task will be removed for everyone in the workspace. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-1.5"
              >
                {isDeleting ? 'Deleting...' : 'Yes, delete task'}
              </button>
            </div>
          </div>
        ) : null}

        {/* Existing Task Detail View Mode */}
        {existingTask && !isEditingExisting && !showDeleteConfirm ? (
          <div className="mt-4 space-y-5">
            {/* Title & Status */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 leading-snug">
                {existingTask.title}
              </h3>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                {/* 1-Tap Status Switcher */}
                <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
                  {(['To do', 'In progress', 'Done'] as TaskStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleQuickStatusChange(st)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                        existingTask.status === st
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                {/* Overdue Indicator */}
                {isTaskOverdue(existingTask) && (
                  <span className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Overdue</span>
                  </span>
                )}
              </div>
            </div>

            {/* Properties List */}
            <div className="grid grid-cols-2 gap-4 p-3.5 bg-slate-50 border border-slate-100 rounded-lg text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Assignee</span>
                <div className="flex items-center gap-2 font-medium text-slate-800">
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {existingTask.assigneeId
                      ? getUserById(existingTask.assigneeId)?.name || 'Unassigned'
                      : 'Unassigned'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Due Date</span>
                <div className="flex items-center gap-2 font-medium text-slate-800">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{existingTask.dueDate || 'No due date'}</span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete task</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingExisting(true)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Edit task
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Create or Edit Form */
          <form onSubmit={existingTask ? handleUpdate : handleCreate} className="mt-4 space-y-4">
            {/* Title field (1-120 chars) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="task-title" className="text-xs font-semibold text-slate-700">
                  Task title
                </label>
                <span className={`text-[11px] tabular-nums ${title.length > 120 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                  {title.length}/120
                </span>
              </div>
              <input
                id="task-title"
                type="text"
                autoFocus
                maxLength={140}
                placeholder="e.g. Write literature review"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>

            {/* Assignee selector (Current workspace members + Unassigned) */}
            <div>
              <label htmlFor="task-assignee" className="block text-xs font-semibold text-slate-700 mb-1">
                Assignee
              </label>
              <select
                id="task-assignee"
                value={assigneeId || ''}
                onChange={(e) => setAssigneeId(e.target.value || null)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              >
                <option value="">Unassigned</option>
                {members.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status (If editing existing) */}
            {existingTask && (
              <div>
                <label htmlFor="task-status" className="block text-xs font-semibold text-slate-700 mb-1">
                  Status
                </label>
                <select
                  id="task-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                >
                  <option value="To do">To do</option>
                  <option value="In progress">In progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
            )}

            {/* Due Date (Optional V1.0 F9) */}
            <div>
              <label htmlFor="task-due-date" className="block text-xs font-semibold text-slate-700 mb-1">
                Due date (Optional)
              </label>
              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
              {/* D37: past due date warning */}
              {isPastDue && (
                <p className="mt-1 text-[11px] text-amber-700 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>This date is in the past, but can still be saved.</span>
                </p>
              )}
            </div>

            {/* Form Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  if (existingTask) {
                    setIsEditingExisting(false);
                  } else {
                    onClose();
                  }
                }}
                disabled={isSaving}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{existingTask ? 'Save changes' : 'Save'}</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
