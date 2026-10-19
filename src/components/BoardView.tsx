import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskStatus, User } from '../types';
import {
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Users,
  Check,
  User as UserIcon,
  X,
} from 'lucide-react';

interface BoardViewProps {
  workspaceId: string;
  onOpenCreateTask: () => void;
  onOpenTaskDetail: (taskId: string) => void;
}

export const BoardView: React.FC<BoardViewProps> = ({
  workspaceId,
  onOpenCreateTask,
  onOpenTaskDetail,
}) => {
  const {
    currentUser,
    tasks,
    workspaces,
    getUserById,
    isTaskOverdue,
    updateTaskStatus,
    isLoadingSkeleton,
    isOwner,
    navigate,
  } = useApp();

  const workspace = workspaces.find((w) => w.id === workspaceId);
  const isWorkspaceOwner = workspace ? isOwner(workspace.id) : false;

  // Filter state (V1.0 F10)
  // 'all' | 'my-tasks' | 'unassigned' | string (userId)
  const [filterMode, setFilterMode] = useState<string>('all');
  const [statusErrorMessage, setStatusErrorMessage] = useState<string | null>(null);

  if (!workspace) {
    return null;
  }

  // All tasks in this workspace
  const workspaceTasks = tasks.filter((t) => t.workspaceId === workspaceId);

  // Apply assignee filter
  const filteredTasks = workspaceTasks.filter((task) => {
    if (filterMode === 'all') return true;
    if (filterMode === 'my-tasks') return task.assigneeId === currentUser?.id;
    if (filterMode === 'unassigned') return task.assigneeId === null;
    return task.assigneeId === filterMode;
  });

  const todoTasks = filteredTasks.filter((t) => t.status === 'To do');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'In progress');
  const doneTasks = filteredTasks.filter((t) => t.status === 'Done');

  const columns: { status: TaskStatus; title: string; items: Task[]; countColor: string }[] = [
    { status: 'To do', title: 'To do', items: todoTasks, countColor: 'text-slate-600 bg-slate-100' },
    {
      status: 'In progress',
      title: 'In progress',
      items: inProgressTasks,
      countColor: 'text-blue-700 bg-blue-50',
    },
    { status: 'Done', title: 'Done', items: doneTasks, countColor: 'text-emerald-700 bg-emerald-50' },
  ];

  // Quick 1-tap status transition for mobile / fast updates (Flow B-2)
  const handleQuickAdvance = async (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    setStatusErrorMessage(null);
    let nextStatus: TaskStatus = 'In progress';
    if (task.status === 'To do') nextStatus = 'In progress';
    else if (task.status === 'In progress') nextStatus = 'Done';
    else if (task.status === 'Done') nextStatus = 'To do';

    const res = await updateTaskStatus(task.id, nextStatus);
    if (!res.success) {
      setStatusErrorMessage(res.error || 'Failed to update task status.');
    }
  };

  const handleQuickRegress = async (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    setStatusErrorMessage(null);
    let prevStatus: TaskStatus = 'To do';
    if (task.status === 'Done') prevStatus = 'In progress';
    else if (task.status === 'In progress') prevStatus = 'To do';

    const res = await updateTaskStatus(task.id, prevStatus);
    if (!res.success) {
      setStatusErrorMessage(res.error || 'Failed to update task status.');
    }
  };

  const members = workspace.members
    .map((m) => getUserById(m.userId))
    .filter((u): u is User => u !== null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Workspace Header Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {workspace.name}
            </h1>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {isWorkspaceOwner ? 'Owner' : 'Member'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {workspace.members.length} team members · Private workspace
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {isWorkspaceOwner && (
            <button
              onClick={() => navigate({ type: 'members', workspaceId })}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs"
            >
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>Manage Members ({workspace.members.length})</span>
            </button>
          )}

          <button
            onClick={onOpenCreateTask}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add task</span>
          </button>
        </div>
      </div>

      {/* Error alert if status change or action failed */}
      {statusErrorMessage && (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between text-rose-800 text-xs">
          <span>{statusErrorMessage}</span>
          <button
            onClick={() => setStatusErrorMessage(null)}
            className="text-rose-600 hover:text-rose-900 font-bold p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter Bar (V1.0 F10) */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 border border-slate-200/80 rounded-xl shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <div className="flex items-center gap-1 text-slate-400 text-xs font-medium pl-1 pr-2">
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filter:</span>
          </div>

          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              filterMode === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All tasks ({workspaceTasks.length})
          </button>

          {currentUser && (
            <button
              onClick={() => setFilterMode('my-tasks')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                filterMode === 'my-tasks'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              My tasks (
              {workspaceTasks.filter((t) => t.assigneeId === currentUser.id).length}
              )
            </button>
          )}

          <button
            onClick={() => setFilterMode('unassigned')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              filterMode === 'unassigned'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Unassigned (
            {workspaceTasks.filter((t) => t.assigneeId === null).length}
            )
          </button>
        </div>

        {/* Member selector filter dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={filterMode.startsWith('user-') ? filterMode : ''}
            onChange={(e) => setFilterMode(e.target.value || 'all')}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="">Filter by member...</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          {filterMode !== 'all' && (
            <button
              onClick={() => setFilterMode('all')}
              className="text-xs text-slate-500 hover:text-slate-900 underline whitespace-nowrap"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoadingSkeleton ? (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((col) => (
            <div key={col} className="bg-slate-100/60 rounded-xl p-4 space-y-3">
              <div className="h-5 w-24 bg-slate-200 rounded animate-pulse" />
              <div className="h-24 bg-white rounded-lg border border-slate-200 animate-pulse" />
              <div className="h-24 bg-white rounded-lg border border-slate-200 animate-pulse" />
            </div>
          ))}
        </div>
      ) : workspaceTasks.length === 0 ? (
        /* Empty Board State (S04 Empty) */
        <div className="mt-12 text-center py-16 px-4 bg-white border border-dashed border-slate-300 rounded-2xl max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-6 h-6 text-slate-400" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Add your first task</h2>
          <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
            Get your team moving. Create tasks, set clear assignees, and track progress together.
          </p>
          <div className="mt-6">
            <button
              onClick={onOpenCreateTask}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add task</span>
            </button>
          </div>
        </div>
      ) : (
        /* 3-Column Board Grid (S04 Populated) */
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {columns.map((column) => (
            <div
              key={column.status}
              className="bg-slate-100/70 border border-slate-200/60 rounded-xl p-3.5 flex flex-col min-h-[380px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 px-1 mb-2 border-b border-slate-200/80">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-800 tracking-tight">
                    {column.title}
                  </h2>
                  <span
                    className={`text-xs font-semibold tabular-nums px-2 py-0.5 rounded-full ${column.countColor}`}
                  >
                    {column.items.length}
                  </span>
                </div>

                {column.status === 'To do' && (
                  <button
                    onClick={onOpenCreateTask}
                    title="Add task to To do"
                    className="p-1 text-slate-400 hover:text-slate-800 hover:bg-white rounded transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Task Cards */}
              <div className="space-y-2.5 flex-1">
                {column.items.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 font-medium">
                    No tasks in this column
                  </div>
                ) : (
                  column.items.map((task) => {
                    const assignee = getUserById(task.assigneeId);
                    const overdue = isTaskOverdue(task);

                    return (
                      <div
                        key={task.id}
                        onClick={() => onOpenTaskDetail(task.id)}
                        className="group bg-white border border-slate-200 hover:border-slate-300 rounded-lg p-3.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer relative"
                      >
                        {/* Title */}
                        <h3 className="text-sm font-medium text-slate-900 group-hover:text-slate-950 leading-snug line-clamp-2">
                          {task.title}
                        </h3>

                        {/* Unboxed Metadata (Zero-pill discipline) */}
                        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <UserIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate font-medium text-slate-700">
                              {assignee ? assignee.name : 'Unassigned'}
                            </span>
                          </div>

                          {/* Due Date & Overdue */}
                          {task.dueDate && (
                            <div className="flex items-center gap-1 shrink-0 font-medium">
                              {overdue ? (
                                <span className="text-rose-600 font-semibold flex items-center gap-0.5">
                                  <Clock className="w-3 h-3" />
                                  <span>Overdue</span>
                                </span>
                              ) : (
                                <span className="text-slate-500 tabular-nums text-[11px]">
                                  {task.dueDate.slice(5)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Quick 1-Tap Status Advance Bar (Ideal for Bilal on mobile/desktop) */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 font-medium">Move:</span>

                          <div className="flex items-center gap-1">
                            {task.status !== 'To do' && (
                              <button
                                type="button"
                                onClick={(e) => handleQuickRegress(e, task)}
                                title={task.status === 'Done' ? 'Move back to In progress' : 'Move back to To do'}
                                className="px-1.5 py-0.5 rounded bg-slate-50 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-0.5"
                              >
                                <ArrowLeft className="w-3 h-3" />
                                <span className="text-[10px]">Back</span>
                              </button>
                            )}

                            {task.status !== 'Done' ? (
                              <button
                                type="button"
                                onClick={(e) => handleQuickAdvance(e, task)}
                                title={task.status === 'To do' ? 'Start work (In progress)' : 'Mark as Done'}
                                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors flex items-center gap-1 shadow-2xs"
                              >
                                <span className="text-[10px]">
                                  {task.status === 'To do' ? 'In progress' : 'Done'}
                                </span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            ) : (
                              <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                                <Check className="w-3 h-3" />
                                <span>Completed</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
