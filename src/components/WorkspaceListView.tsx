import React from 'react';
import { useApp } from '../context/AppContext';
import { Plus, ArrowRight, LayoutGrid, ShieldCheck } from 'lucide-react';

interface WorkspaceListViewProps {
  onOpenCreateWorkspace: () => void;
}

export const WorkspaceListView: React.FC<WorkspaceListViewProps> = ({ onOpenCreateWorkspace }) => {
  const { currentUser, workspaces, tasks, navigate, isLoadingSkeleton } = useApp();

  // Filter workspaces the current user belongs to
  const userWorkspaces = workspaces.filter((w) =>
    w.members.some((m) => m.userId === currentUser?.id)
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            My Workspaces
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Select a workspace to open your team&apos;s task board.
          </p>
        </div>

        <button
          onClick={onOpenCreateWorkspace}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create workspace</span>
        </button>
      </div>

      {/* Skeletons Loading State */}
      {isLoadingSkeleton ? (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-6 bg-white border border-slate-200 rounded-xl animate-pulse space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-5 w-40 bg-slate-200 rounded" />
                <div className="h-4 w-14 bg-slate-100 rounded" />
              </div>
              <div className="h-4 w-32 bg-slate-100 rounded" />
              <div className="h-8 w-full bg-slate-50 rounded" />
            </div>
          ))}
        </div>
      ) : userWorkspaces.length === 0 ? (
        /* Empty State */
        <div className="mt-12 text-center py-16 px-4 bg-white border border-dashed border-slate-300 rounded-2xl max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            You are not in any workspace yet
          </h2>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
            Create one to get started, or ask your project lead to add your email to their workspace.
          </p>
          <div className="mt-6">
            <button
              onClick={onOpenCreateWorkspace}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create workspace</span>
            </button>
          </div>
        </div>
      ) : (
        /* Workspace Card Grid */
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {userWorkspaces.map((workspace) => {
            const memberInfo = workspace.members.find((m) => m.userId === currentUser?.id);
            const isOwner = memberInfo?.role === 'Owner';
            const workspaceTasks = tasks.filter((t) => t.workspaceId === workspace.id);
            const doneTasks = workspaceTasks.filter((t) => t.status === 'Done');

            return (
              <div
                key={workspace.id}
                onClick={() => navigate({ type: 'board', workspaceId: workspace.id })}
                className="group relative bg-white border border-slate-200/90 hover:border-slate-400/90 rounded-xl p-5 transition-all shadow-xs hover:shadow-sm cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h2 className="text-base font-bold text-slate-900 group-hover:text-slate-900 transition-colors line-clamp-1">
                      {workspace.name}
                    </h2>
                    <span
                      className={`text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded text-xs ${
                        isOwner
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isOwner ? 'Owner' : 'Member'}
                    </span>
                  </div>

                  {/* Clean unboxed metadata (anti-pill) */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <span>{workspace.members.length} members</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{workspaceTasks.length} tasks</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{doneTasks.length} completed</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Private board</span>
                  </div>
                  <span className="font-semibold text-slate-900 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Open board</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
