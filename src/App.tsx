import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { PersonaBar } from './components/PersonaBar';
import { SignInView } from './components/SignInView';
import { WorkspaceListView } from './components/WorkspaceListView';
import { BoardView } from './components/BoardView';
import { MembersView } from './components/MembersView';
import { CreateWorkspaceModal } from './components/CreateWorkspaceModal';
import { TaskModal } from './components/TaskModal';
import { AccessDeniedView } from './components/AccessDeniedView';
import { NotFoundView } from './components/NotFoundView';
import { ErrorView } from './components/ErrorView';
import { WifiOff } from 'lucide-react';

const AppContent: React.FC = () => {
  const { route, currentUser, isOffline, navigate } = useApp();

  // Modals state
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [activeDetailTaskId, setActiveDetailTaskId] = useState<string | null>(null);

  // If deep link has taskId in route (e.g. #/w/:id/t/:taskId)
  const effectiveTaskId =
    route.type === 'board' && route.taskId ? route.taskId : activeDetailTaskId;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-slate-900 font-sans">
      {/* Simulation & Persona Verification Bar */}
      <PersonaBar />

      {/* Offline Status Warning Banner */}
      {isOffline && (
        <div className="bg-rose-600 text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2 sticky top-0 z-40">
          <WifiOff className="w-3.5 h-3.5" />
          <span>You appear to be offline. Actions requiring network save will be rejected.</span>
        </div>
      )}

      {/* Header */}
      <Header
        onOpenCreateTask={
          currentUser && route.type === 'board' ? () => setIsCreateTaskOpen(true) : undefined
        }
        onOpenCreateWorkspace={
          currentUser && route.type === 'workspaces' ? () => setIsCreateWorkspaceOpen(true) : undefined
        }
      />

      {/* Main View Router */}
      <main className="flex-1">
        {route.type === 'sign-in' && (
          <SignInView expired={route.expired} returnTo={route.returnTo} />
        )}

        {route.type === 'workspaces' && currentUser && (
          <WorkspaceListView
            onOpenCreateWorkspace={() => setIsCreateWorkspaceOpen(true)}
          />
        )}

        {route.type === 'board' && currentUser && (
          <BoardView
            workspaceId={route.workspaceId}
            onOpenCreateTask={() => setIsCreateTaskOpen(true)}
            onOpenTaskDetail={(taskId) => {
              setActiveDetailTaskId(taskId);
              // Also sync URL to deep link format #/w/:id/t/:taskId
              window.location.hash = `#/w/${route.workspaceId}/t/${taskId}`;
            }}
          />
        )}

        {route.type === 'members' && currentUser && (
          <MembersView workspaceId={route.workspaceId} />
        )}

        {route.type === 'access-denied' && <AccessDeniedView />}

        {route.type === 'not-found' && <NotFoundView />}

        {route.type === 'system-error' && (
          <ErrorView
            message={route.message}
            onRetry={() => navigate({ type: 'workspaces' })}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">TeamFlow</span>
            <span aria-hidden="true">·</span>
            <span>Simple, private task board for small teams</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>To do · In progress · Done</span>
            <span aria-hidden="true">·</span>
            <span>Private by default</span>
          </div>
        </div>
      </footer>

      {/* S03: Create Workspace Modal */}
      <CreateWorkspaceModal
        isOpen={isCreateWorkspaceOpen}
        onClose={() => setIsCreateWorkspaceOpen(false)}
      />

      {/* S05: Task Modal (Create & Detail) */}
      {(isCreateTaskOpen || effectiveTaskId) && route.type === 'board' && (
        <TaskModal
          isOpen={true}
          workspaceId={route.workspaceId}
          taskId={effectiveTaskId}
          onClose={() => {
            setIsCreateTaskOpen(false);
            setActiveDetailTaskId(null);
            // restore hash without /t/:taskId
            window.location.hash = `#/w/${route.workspaceId}`;
          }}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
