import React from 'react';
import { useApp } from '../context/AppContext';
import { LogOut, Users, Plus, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  onOpenCreateTask?: () => void;
  onOpenCreateWorkspace?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCreateTask, onOpenCreateWorkspace }) => {
  const { currentUser, route, navigate, signOut, getWorkspaceById, isOwner } = useApp();

  const currentWorkspace =
    (route.type === 'board' || route.type === 'members') ? getWorkspaceById(route.workspaceId) : undefined;
  const isWorkspaceOwner = currentWorkspace ? isOwner(currentWorkspace.id) : false;

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand wordmark & Context */}
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => {
              if (currentUser) {
                navigate({ type: 'workspaces' });
              } else {
                navigate({ type: 'sign-in' });
              }
            }}
            className="flex items-center gap-2 text-left hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 rounded"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-tight">
              TF
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              TeamFlow
            </span>
          </button>

          {/* Breadcrumbs for active workspace */}
          {currentUser && currentWorkspace && (
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 min-w-0">
              <span className="text-slate-300">/</span>
              <button
                onClick={() => navigate({ type: 'workspaces' })}
                className="hover:text-slate-900 truncate transition-colors"
              >
                Workspaces
              </button>
              <span className="text-slate-300">/</span>
              <button
                onClick={() => navigate({ type: 'board', workspaceId: currentWorkspace.id })}
                className={`font-medium truncate transition-colors ${
                  route.type === 'board' ? 'text-slate-900' : 'hover:text-slate-900 text-slate-600'
                }`}
              >
                {currentWorkspace.name}
              </button>
              {route.type === 'members' && (
                <>
                  <span className="text-slate-300">/</span>
                  <span className="font-medium text-slate-900">Members</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Zone 2: Navigation links / contextual actions */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {currentUser && currentWorkspace && route.type === 'board' && (
            <>
              {isWorkspaceOwner && (
                <button
                  onClick={() => navigate({ type: 'members', workspaceId: currentWorkspace.id })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                >
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>Members</span>
                </button>
              )}

              {onOpenCreateTask && (
                <button
                  onClick={onOpenCreateTask}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add task</span>
                </button>
              )}
            </>
          )}

          {currentUser && route.type === 'members' && (
            <button
              onClick={() => navigate({ type: 'board', workspaceId: currentWorkspace?.id || '' })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to board</span>
            </button>
          )}

          {currentUser && route.type === 'workspaces' && onOpenCreateWorkspace && (
            <button
              onClick={onOpenCreateWorkspace}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create workspace</span>
            </button>
          )}

          {/* User profile & Sign out */}
          {currentUser ? (
            <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-slate-200">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[140px]">
                  {currentUser.name}
                </span>
                <span className="text-[11px] text-slate-500 leading-tight truncate max-w-[140px]">
                  {currentUser.email}
                </span>
              </div>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                  currentUser.avatarColor || 'bg-slate-700'
                }`}
                title={`${currentUser.name} (${currentUser.email})`}
              >
                {currentUser.name.charAt(0)}
              </div>
              <button
                onClick={signOut}
                title="Sign out"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                <LogOut className="w-4 h-4" />
                <span className="sr-only">Sign out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate({ type: 'sign-in' })}
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
