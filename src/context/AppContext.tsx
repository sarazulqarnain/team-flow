import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Workspace, Task, AppRoute, TaskStatus } from '../types';
import { INITIAL_USERS, INITIAL_WORKSPACES, INITIAL_TASKS } from '../data/mockData';

interface AppContextType {
  currentUser: User | null;
  registeredUsers: User[];
  workspaces: Workspace[];
  tasks: Task[];
  route: AppRoute;
  rememberedUrl: string | null;
  isOffline: boolean;
  isLoadingSkeleton: boolean;
  
  // Navigation & Routing
  navigate: (route: AppRoute) => void;
  navigateToUrl: (path: string) => void;
  
  // Auth flows (F1)
  signIn: (email: string) => { success: boolean; error?: string };
  signInAsUser: (userId: string) => void;
  signOut: () => void;
  simulateSessionExpired: () => void;
  
  // Offline & Testing controls
  toggleOffline: () => void;
  toggleLoadingSkeleton: () => void;
  resetAllData: () => void;
  
  // Workspace flows (F2)
  createWorkspace: (name: string) => Promise<{ success: boolean; error?: string; workspaceId?: string }>;
  
  // Task flows (F3, F4, F8, F9, F10)
  createTask: (workspaceId: string, title: string, assigneeId: string | null, dueDate: string | null) => Promise<{ success: boolean; error?: string; taskId?: string }>;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => Promise<{ success: boolean; error?: string }>;
  updateTaskDetails: (taskId: string, updates: { title: string; assigneeId: string | null; dueDate: string | null; status: TaskStatus }) => Promise<{ success: boolean; error?: string }>;
  deleteTask: (taskId: string) => Promise<{ success: boolean; error?: string }>;
  
  // Member management (F7)
  addMember: (workspaceId: string, email: string) => Promise<{ success: boolean; error?: string }>;
  removeMember: (workspaceId: string, userId: string) => Promise<{ success: boolean; error?: string }>;
  
  // Helpers
  getUserById: (userId: string | null) => User | null;
  getWorkspaceById: (workspaceId: string) => Workspace | undefined;
  isOwner: (workspaceId: string, userId?: string) => boolean;
  isMember: (workspaceId: string, userId?: string) => boolean;
  isTaskOverdue: (task: Task) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_WORKSPACES = 'teamflow_workspaces_v1';
const STORAGE_KEY_TASKS = 'teamflow_tasks_v1';
const STORAGE_KEY_CURRENT_USER = 'teamflow_current_user_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Registered users database
  const [registeredUsers] = useState<User[]>(INITIAL_USERS);

  // Current logged in user (Default to Ayesha Khan)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_USERS[0]; // Ayesha Khan
  });

  // Workspaces
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WORKSPACES);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_WORKSPACES;
  });

  // Tasks
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TASKS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_TASKS;
  });

  // Simulation states
  const [isOffline, setIsOffline] = useState(false);
  const [isLoadingSkeleton, setIsLoadingSkeleton] = useState(false);
  const [rememberedUrl, setRememberedUrl] = useState<string | null>(null);

  // App routing
  const [route, setRoute] = useState<AppRoute>(() => {
    if (window.location.hash) {
      return parseHash(window.location.hash);
    }
    return { type: 'board', workspaceId: 'w-final-project' };
  });

  // Persist state changes
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
      }
    } catch {
      // ignore
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WORKSPACES, JSON.stringify(workspaces));
    } catch {
      // ignore
    }
  }, [workspaces]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }, [tasks]);

  // Sync route with window hash
  function parseHash(hash: string): AppRoute {
    const clean = hash.replace(/^#/, '');
    if (!clean || clean === '/' || clean === '/workspaces') {
      return { type: 'workspaces' };
    }
    if (clean === '/sign-in') {
      return { type: 'sign-in' };
    }
    if (clean.startsWith('/w/')) {
      const parts = clean.split('/');
      // /w/:id
      const workspaceId = parts[2];
      if (parts[3] === 'members') {
        return { type: 'members', workspaceId };
      }
      if (parts[3] === 't' && parts[4]) {
        return { type: 'board', workspaceId, taskId: parts[4] };
      }
      return { type: 'board', workspaceId };
    }
    if (clean === '/access-denied') {
      return { type: 'access-denied' };
    }
    if (clean === '/not-found') {
      return { type: 'not-found' };
    }
    return { type: 'not-found' };
  }

  function routeToHash(r: AppRoute): string {
    switch (r.type) {
      case 'sign-in':
        return '#/sign-in';
      case 'workspaces':
        return '#/workspaces';
      case 'board':
        return r.taskId ? `#/w/${r.workspaceId}/t/${r.taskId}` : `#/w/${r.workspaceId}`;
      case 'members':
        return `#/w/${r.workspaceId}/members`;
      case 'access-denied':
        return '#/access-denied';
      case 'not-found':
        return '#/not-found';
      case 'system-error':
        return '#/error';
    }
  }

  const navigate = (newRoute: AppRoute) => {
    // Decision D3 & D4 Check
    if (!currentUser && newRoute.type !== 'sign-in') {
      const targetHash = routeToHash(newRoute);
      setRememberedUrl(targetHash);
      const signinRoute: AppRoute = { type: 'sign-in', returnTo: targetHash };
      setRoute(signinRoute);
      window.location.hash = '#/sign-in';
      return;
    }

    // Membership check if board or members
    if (currentUser && (newRoute.type === 'board' || newRoute.type === 'members')) {
      const ws = workspaces.find((w) => w.id === newRoute.workspaceId);
      if (!ws) {
        setRoute({ type: 'not-found' });
        window.location.hash = '#/not-found';
        return;
      }
      const member = ws.members.find((m) => m.userId === currentUser.id);
      if (!member) {
        setRoute({ type: 'access-denied' });
        window.location.hash = '#/access-denied';
        return;
      }
      // If members route, must be Owner
      if (newRoute.type === 'members' && member.role !== 'Owner') {
        setRoute({ type: 'access-denied' });
        window.location.hash = '#/access-denied';
        return;
      }
    }

    setRoute(newRoute);
    window.location.hash = routeToHash(newRoute);
  };

  const navigateToUrl = (path: string) => {
    const parsed = parseHash(path);
    navigate(parsed);
  };

  // Helper check methods
  const getUserById = (userId: string | null): User | null => {
    if (!userId) return null;
    return registeredUsers.find((u) => u.id === userId) || null;
  };

  const getWorkspaceById = (workspaceId: string): Workspace | undefined => {
    return workspaces.find((w) => w.id === workspaceId);
  };

  const isOwner = (workspaceId: string, userId?: string): boolean => {
    const uid = userId || currentUser?.id;
    if (!uid) return false;
    const ws = getWorkspaceById(workspaceId);
    if (!ws) return false;
    const member = ws.members.find((m) => m.userId === uid);
    return member?.role === 'Owner';
  };

  const isMember = (workspaceId: string, userId?: string): boolean => {
    const uid = userId || currentUser?.id;
    if (!uid) return false;
    const ws = getWorkspaceById(workspaceId);
    if (!ws) return false;
    return ws.members.some((m) => m.userId === uid);
  };

  // Overdue calculation (D36): IF due date in past AND status is NOT Done -> Overdue. If Done -> never overdue!
  const isTaskOverdue = (task: Task): boolean => {
    if (!task.dueDate) return false;
    if (task.status === 'Done') return false;
    const today = '2026-10-19'; // Today's date from environment
    return task.dueDate < today;
  };

  // Auth operations
  const signIn = (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const user = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return { success: false, error: "We couldn't sign you in. Please check your email or pick a persona." };
    }
    setCurrentUser(user);

    // D6 / D7: Return to remembered link or /workspaces
    if (rememberedUrl) {
      const target = rememberedUrl;
      setRememberedUrl(null);
      const parsed = parseHash(target);
      navigate(parsed);
    } else {
      navigate({ type: 'workspaces' });
    }
    return { success: true };
  };

  const signInAsUser = (userId: string) => {
    const user = registeredUsers.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      if (rememberedUrl) {
        const target = rememberedUrl;
        setRememberedUrl(null);
        navigate(parseHash(target));
      } else {
        navigate({ type: 'workspaces' });
      }
    }
  };

  const signOut = () => {
    setCurrentUser(null);
    setRoute({ type: 'sign-in' });
    window.location.hash = '#/sign-in';
  };

  const simulateSessionExpired = () => {
    setCurrentUser(null);
    const currentHash = routeToHash(route);
    setRememberedUrl(currentHash);
    setRoute({ type: 'sign-in', expired: true, returnTo: currentHash });
    window.location.hash = '#/sign-in';
  };

  const toggleOffline = () => {
    setIsOffline((prev) => !prev);
  };

  const toggleLoadingSkeleton = () => {
    setIsLoadingSkeleton((prev) => !prev);
  };

  const resetAllData = () => {
    setWorkspaces(INITIAL_WORKSPACES);
    setTasks(INITIAL_TASKS);
    setCurrentUser(INITIAL_USERS[0]);
    setIsOffline(false);
    setIsLoadingSkeleton(false);
    navigate({ type: 'board', workspaceId: 'w-final-project' });
  };

  // Workspace creation (F2)
  const createWorkspace = async (name: string): Promise<{ success: boolean; error?: string; workspaceId?: string }> => {
    if (isOffline) {
      return { success: false, error: 'You appear to be offline. Your workspace was not created.' };
    }

    const trimmed = name.trim();
    if (!trimmed) {
      return { success: false, error: 'Enter a name (1-80 characters).' };
    }
    if (trimmed.length > 80) {
      return { success: false, error: 'Workspace name must be between 1 and 80 characters.' };
    }

    if (!currentUser) {
      return { success: false, error: 'Your session expired. Please sign in again.' };
    }

    const newWs: Workspace = {
      id: `w-${Date.now()}`,
      name: trimmed,
      ownerId: currentUser.id,
      createdAt: new Date().toISOString(),
      members: [
        {
          userId: currentUser.id,
          role: 'Owner',
          joinedAt: new Date().toISOString(),
        },
      ],
    };

    setWorkspaces((prev) => [newWs, ...prev]);
    return { success: true, workspaceId: newWs.id };
  };

  // Task creation (F3)
  const createTask = async (
    workspaceId: string,
    title: string,
    assigneeId: string | null,
    dueDate: string | null
  ): Promise<{ success: boolean; error?: string; taskId?: string }> => {
    if (isOffline) {
      return { success: false, error: 'You appear to be offline. Your task was not saved.' };
    }

    const trimmed = title.trim();
    if (!trimmed) {
      return { success: false, error: 'Enter a title (1-120 characters).' };
    }
    if (trimmed.length > 120) {
      return { success: false, error: 'Task title must be between 1 and 120 characters.' };
    }

    // Verify workspace and membership
    const ws = workspaces.find((w) => w.id === workspaceId);
    if (!ws) {
      return { success: false, error: 'Workspace not found.' };
    }

    if (assigneeId) {
      const isMemberOfWs = ws.members.some((m) => m.userId === assigneeId);
      if (!isMemberOfWs) {
        return { success: false, error: 'Selected assignee is no longer a workspace member.' };
      }
    }

    const newTask: Task = {
      id: `task-${Date.now()}`,
      workspaceId,
      title: trimmed,
      assigneeId: assigneeId || null,
      status: 'To do', // Always saves as To do in MVP
      dueDate: dueDate || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
    return { success: true, taskId: newTask.id };
  };

  // Update status (F4)
  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus): Promise<{ success: boolean; error?: string }> => {
    if (isOffline) {
      return { success: false, error: 'You appear to be offline. Status change was not saved.' };
    }

    if (!['To do', 'In progress', 'Done'].includes(newStatus)) {
      return { success: false, error: 'Invalid status value.' };
    }

    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) {
      return { success: false, error: 'Task not found.' };
    }

    const updated = [...tasks];
    updated[taskIndex] = {
      ...updated[taskIndex],
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    setTasks(updated);
    return { success: true };
  };

  // Edit task details (F8, F9)
  const updateTaskDetails = async (
    taskId: string,
    updates: { title: string; assigneeId: string | null; dueDate: string | null; status: TaskStatus }
  ): Promise<{ success: boolean; error?: string }> => {
    if (isOffline) {
      return { success: false, error: 'You appear to be offline. Changes were not saved.' };
    }

    const trimmed = updates.title.trim();
    if (!trimmed) {
      return { success: false, error: 'Enter a title (1-120 characters).' };
    }
    if (trimmed.length > 120) {
      return { success: false, error: 'Task title must be between 1 and 120 characters.' };
    }

    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) {
      return { success: false, error: 'This task no longer exists.' };
    }

    const targetTask = tasks[taskIndex];
    const ws = workspaces.find((w) => w.id === targetTask.workspaceId);
    if (updates.assigneeId && ws) {
      const isMember = ws.members.some((m) => m.userId === updates.assigneeId);
      if (!isMember) {
        return { success: false, error: 'Selected assignee is no longer a workspace member.' };
      }
    }

    const updated = [...tasks];
    updated[taskIndex] = {
      ...targetTask,
      title: trimmed,
      assigneeId: updates.assigneeId || null,
      dueDate: updates.dueDate || null,
      status: updates.status,
      updatedAt: new Date().toISOString(),
    };

    setTasks(updated);
    return { success: true };
  };

  // Delete task (F8)
  const deleteTask = async (taskId: string): Promise<{ success: boolean; error?: string }> => {
    if (isOffline) {
      return { success: false, error: 'You appear to be offline. Delete was not applied.' };
    }

    const exists = tasks.some((t) => t.id === taskId);
    if (!exists) {
      return { success: false, error: 'This task no longer exists.' };
    }

    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    return { success: true };
  };

  // Member management (F7)
  const addMember = async (workspaceId: string, email: string): Promise<{ success: boolean; error?: string }> => {
    if (isOffline) {
      return { success: false, error: 'You appear to be offline. Could not add member.' };
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return { success: false, error: 'Enter a valid email address.' };
    }

    const wsIndex = workspaces.findIndex((w) => w.id === workspaceId);
    if (wsIndex === -1) {
      return { success: false, error: 'Workspace not found.' };
    }

    const ws = workspaces[wsIndex];

    // D30: limit 25
    if (ws.members.length >= 25) {
      return { success: false, error: 'Workspace member limit reached (25 members max).' };
    }

    // D28: email must belong to a registered user
    const registeredUser = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!registeredUser) {
      return { success: false, error: 'No TeamFlow account found for this email.' };
    }

    // D29: email already a member
    const alreadyMember = ws.members.some((m) => m.userId === registeredUser.id);
    if (alreadyMember) {
      return { success: false, error: 'This person is already a member.' };
    }

    const updatedWorkspaces = [...workspaces];
    updatedWorkspaces[wsIndex] = {
      ...ws,
      members: [
        ...ws.members,
        {
          userId: registeredUser.id,
          role: 'Member',
          joinedAt: new Date().toISOString(),
        },
      ],
    };

    setWorkspaces(updatedWorkspaces);
    return { success: true };
  };

  const removeMember = async (workspaceId: string, userId: string): Promise<{ success: boolean; error?: string }> => {
    if (isOffline) {
      return { success: false, error: 'You appear to be offline. Member was not removed.' };
    }

    const wsIndex = workspaces.findIndex((w) => w.id === workspaceId);
    if (wsIndex === -1) {
      return { success: false, error: 'Workspace not found.' };
    }

    const ws = workspaces[wsIndex];
    const memberToRemove = ws.members.find((m) => m.userId === userId);
    if (!memberToRemove) {
      return { success: false, error: 'Member not found in workspace.' };
    }

    // D32: Sole Owner cannot remove themselves
    if (memberToRemove.role === 'Owner') {
      const ownerCount = ws.members.filter((m) => m.role === 'Owner').length;
      if (ownerCount <= 1) {
        return { success: false, error: 'A workspace needs an Owner. You cannot remove the sole Owner.' };
      }
    }

    // Remove from workspace
    const updatedMembers = ws.members.filter((m) => m.userId !== userId);
    const updatedWorkspaces = [...workspaces];
    updatedWorkspaces[wsIndex] = {
      ...ws,
      members: updatedMembers,
    };
    setWorkspaces(updatedWorkspaces);

    // D31: Set all their tasks in this workspace to Unassigned
    setTasks((prev) =>
      prev.map((t) => {
        if (t.workspaceId === workspaceId && t.assigneeId === userId) {
          return { ...t, assigneeId: null, updatedAt: new Date().toISOString() };
        }
        return t;
      })
    );

    // D10: If current user was the removed member, redirect to access-denied
    if (currentUser?.id === userId) {
      navigate({ type: 'access-denied' });
    }

    return { success: true };
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        registeredUsers,
        workspaces,
        tasks,
        route,
        rememberedUrl,
        isOffline,
        isLoadingSkeleton,
        navigate,
        navigateToUrl,
        signIn,
        signInAsUser,
        signOut,
        simulateSessionExpired,
        toggleOffline,
        toggleLoadingSkeleton,
        resetAllData,
        createWorkspace,
        createTask,
        updateTaskStatus,
        updateTaskDetails,
        deleteTask,
        addMember,
        removeMember,
        getUserById,
        getWorkspaceById,
        isOwner,
        isMember,
        isTaskOverdue,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
