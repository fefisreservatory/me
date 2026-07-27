export type Priority = 1 | 2 | 3 | 4; // 1 = highest (red), 4 = lowest (none)

export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'weekdays';

export interface RecurrenceRule {
  type: RecurrenceType;
  interval: number; // every N days/weeks/months
  daysOfWeek?: number[]; // 0=Sun..6=Sat, used when type === 'weekly'
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string; // 'inbox' or a project id
  dueDate?: string; // ISO date (yyyy-MM-dd)
  dueTime?: string; // HH:mm
  priority: Priority;
  completed: boolean;
  completedAt?: string;
  recurrence?: RecurrenceRule | null;
  reminderMinutesBefore?: number | null; // null = no reminder
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  order: number;
}

export type HabitFrequency =
  | { type: 'daily' }
  | { type: 'weekly'; daysOfWeek: number[] }; // 0=Sun..6=Sat

export interface Habit {
  id: string;
  name: string;
  color: string;
  frequency: HabitFrequency;
  reminderTime?: string | null; // HH:mm
  completions: Record<string, boolean>; // date ISO -> done
  createdAt: string;
}

export type ViewId =
  | { kind: 'today' }
  | { kind: 'upcoming' }
  | { kind: 'calendar' }
  | { kind: 'habits' }
  | { kind: 'project'; id: string };
