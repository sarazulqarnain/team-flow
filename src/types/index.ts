export type TaskStatus = 'To do' | 'In progress' | 'Done';

export type WorkspaceRole = 'Owner' | 'Member';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarColor?: string;
}

export interface WorkspaceMember {
  userId: string;
  role: WorkspaceRole;
  joinedAt: string;
}

export interface Workspace {
  id: string;
  name: string; // 1-80 chars
  ownerId: string;
  members: WorkspaceMember[];
  createdAt: string;
}

export interface Task {
  id: string;
  workspaceId: string;
  title: string; // 1-120 chars
  assigneeId: string | null; // null = Unassigned
  status: TaskStatus;
  dueDate: string | null; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

export type AppRoute =
  | { type: 'sign-in'; returnTo?: string; expired?: boolean }
  | { type: 'workspaces' }
  | { type: 'board'; workspaceId: string; taskId?: string }
  | { type: 'members'; workspaceId: string }
  | { type: 'access-denied' }
  | { type: 'not-found' }
  | { type: 'system-error'; message?: string };
