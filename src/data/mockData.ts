import { User, Workspace, Task } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-ayesha',
    name: 'Ayesha Khan',
    email: 'ayesha@university.edu',
    avatarColor: 'bg-emerald-600',
  },
  {
    id: 'user-bilal',
    name: 'Bilal Ahmed',
    email: 'bilal@university.edu',
    avatarColor: 'bg-blue-600',
  },
  {
    id: 'user-clara',
    name: 'Clara Chen',
    email: 'clara@university.edu',
    avatarColor: 'bg-indigo-600',
  },
  {
    id: 'user-david',
    name: 'David Miller',
    email: 'david@university.edu',
    avatarColor: 'bg-amber-600',
  },
  {
    id: 'user-elena',
    name: 'Elena Rostova',
    email: 'elena@university.edu',
    avatarColor: 'bg-purple-600',
  },
  {
    id: 'user-farhan',
    name: 'Farhan Tariq',
    email: 'farhan@university.edu',
    avatarColor: 'bg-teal-600',
  },
  {
    id: 'user-grace',
    name: 'Grace Hopper',
    email: 'grace@university.edu',
    avatarColor: 'bg-rose-600',
  },
  {
    id: 'user-outsider',
    name: 'Sam Outsider',
    email: 'sam@outsider.org',
    avatarColor: 'bg-slate-600',
  },
];

export const INITIAL_WORKSPACES: Workspace[] = [
  {
    id: 'w-final-project',
    name: 'Final Project Team',
    ownerId: 'user-ayesha',
    createdAt: '2026-10-12T09:00:00.000Z',
    members: [
      { userId: 'user-ayesha', role: 'Owner', joinedAt: '2026-10-12T09:00:00.000Z' },
      { userId: 'user-bilal', role: 'Member', joinedAt: '2026-10-12T09:15:00.000Z' },
      { userId: 'user-clara', role: 'Member', joinedAt: '2026-10-12T09:20:00.000Z' },
      { userId: 'user-david', role: 'Member', joinedAt: '2026-10-12T09:25:00.000Z' },
      { userId: 'user-elena', role: 'Member', joinedAt: '2026-10-12T09:30:00.000Z' },
    ],
  },
  {
    id: 'w-robotics',
    name: 'Robotics Society Bot Build',
    ownerId: 'user-ayesha',
    createdAt: '2026-10-14T14:00:00.000Z',
    members: [
      { userId: 'user-ayesha', role: 'Owner', joinedAt: '2026-10-14T14:00:00.000Z' },
      { userId: 'user-clara', role: 'Member', joinedAt: '2026-10-14T14:10:00.000Z' },
    ],
  },
];

// Helper for dates relative to Oct 19, 2026
export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    workspaceId: 'w-final-project',
    title: 'Write literature review',
    assigneeId: 'user-bilal',
    status: 'In progress',
    dueDate: '2026-10-21',
    createdAt: '2026-10-13T10:00:00.000Z',
    updatedAt: '2026-10-18T14:30:00.000Z',
  },
  {
    id: 'task-2',
    workspaceId: 'w-final-project',
    title: 'Design database schema & ER diagram',
    assigneeId: 'user-clara',
    status: 'Done',
    dueDate: '2026-10-16',
    createdAt: '2026-10-13T10:05:00.000Z',
    updatedAt: '2026-10-16T17:00:00.000Z',
  },
  {
    id: 'task-3',
    workspaceId: 'w-final-project',
    title: 'Draft user interview questions',
    assigneeId: 'user-ayesha',
    status: 'To do',
    dueDate: '2026-10-23',
    createdAt: '2026-10-13T10:10:00.000Z',
    updatedAt: '2026-10-13T10:10:00.000Z',
  },
  {
    id: 'task-4',
    workspaceId: 'w-final-project',
    title: 'Implement authentication middleware',
    assigneeId: 'user-david',
    status: 'In progress',
    dueDate: '2026-10-22',
    createdAt: '2026-10-14T11:00:00.000Z',
    updatedAt: '2026-10-17T09:15:00.000Z',
  },
  {
    id: 'task-5',
    workspaceId: 'w-final-project',
    title: 'Compile bibliography and citations',
    assigneeId: null, // Unassigned
    status: 'To do',
    dueDate: '2026-10-17', // Past due -> Overdue!
    createdAt: '2026-10-14T11:15:00.000Z',
    updatedAt: '2026-10-14T11:15:00.000Z',
  },
  {
    id: 'task-6',
    workspaceId: 'w-final-project',
    title: 'Prepare midterm presentation slides',
    assigneeId: 'user-bilal',
    status: 'To do',
    dueDate: '2026-10-25',
    createdAt: '2026-10-15T15:20:00.000Z',
    updatedAt: '2026-10-15T15:20:00.000Z',
  },
  {
    id: 'task-7',
    workspaceId: 'w-final-project',
    title: 'Run unit tests on submission bundle',
    assigneeId: 'user-elena',
    status: 'Done',
    dueDate: '2026-10-15',
    createdAt: '2026-10-15T16:00:00.000Z',
    updatedAt: '2026-10-15T18:30:00.000Z',
  },
  {
    id: 'task-8',
    workspaceId: 'w-robotics',
    title: 'Source ultrasonic range sensors',
    assigneeId: 'user-ayesha',
    status: 'In progress',
    dueDate: '2026-10-24',
    createdAt: '2026-10-15T10:00:00.000Z',
    updatedAt: '2026-10-16T12:00:00.000Z',
  },
  {
    id: 'task-9',
    workspaceId: 'w-robotics',
    title: 'Calibrate motor PWM drivers',
    assigneeId: 'user-clara',
    status: 'To do',
    dueDate: '2026-10-26',
    createdAt: '2026-10-15T11:00:00.000Z',
    updatedAt: '2026-10-15T11:00:00.000Z',
  },
];
