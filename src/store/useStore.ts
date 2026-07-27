import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import { format } from 'date-fns';
import type { Habit, Priority, Project, RecurrenceRule, Task } from '../types';
import { getNextDueDate } from '../utils/recurrence';

const todayISO = () => format(new Date(), 'yyyy-MM-dd');

interface StoreState {
  tasks: Task[];
  projects: Project[];
  habits: Habit[];
  notifiedIds: string[]; // ids of task/habit reminders already fired today (key: `${id}:${date}`)

  addTask: (input: {
    title: string;
    description?: string;
    projectId?: string;
    dueDate?: string;
    dueTime?: string;
    priority?: Priority;
    recurrence?: RecurrenceRule | null;
    reminderMinutesBefore?: number | null;
  }) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;

  addProject: (name: string, color: string) => void;
  deleteProject: (id: string) => void;

  addHabit: (input: {
    name: string;
    color: string;
    frequency: Habit['frequency'];
    reminderTime?: string | null;
  }) => void;
  updateHabit: (id: string, patch: Partial<Habit>) => void;
  toggleHabitToday: (id: string, date?: string) => void;
  deleteHabit: (id: string) => void;

  markNotified: (key: string) => void;
}

const defaultProjects: Project[] = [
  { id: 'inbox', name: 'Entrada', color: '#6b7280', order: 0 },
];

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      tasks: [],
      projects: defaultProjects,
      habits: [],
      notifiedIds: [],

      addTask: (input) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              id: uuid(),
              title: input.title,
              description: input.description,
              projectId: input.projectId ?? 'inbox',
              dueDate: input.dueDate,
              dueTime: input.dueTime,
              priority: input.priority ?? 4,
              completed: false,
              recurrence: input.recurrence ?? null,
              reminderMinutesBefore: input.reminderMinutesBefore ?? null,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateTask: (id, patch) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),

      toggleTask: (id) =>
        set((state) => {
          const task = state.tasks.find((t) => t.id === id);
          if (!task) return state;

          if (!task.completed && task.recurrence && task.dueDate) {
            // recurring task: roll forward instead of marking complete
            const nextDue = getNextDueDate(task.dueDate, task.recurrence);
            return {
              tasks: state.tasks.map((t) =>
                t.id === id
                  ? { ...t, dueDate: nextDue, completed: false, completedAt: undefined }
                  : t,
              ),
            };
          }

          return {
            tasks: state.tasks.map((t) =>
              t.id === id
                ? {
                    ...t,
                    completed: !t.completed,
                    completedAt: !t.completed ? new Date().toISOString() : undefined,
                  }
                : t,
            ),
          };
        }),

      deleteTask: (id) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

      addProject: (name, color) =>
        set((state) => ({
          projects: [
            ...state.projects,
            { id: uuid(), name, color, order: state.projects.length },
          ],
        })),

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          tasks: state.tasks.filter((t) => t.projectId !== id),
        })),

      addHabit: (input) =>
        set((state) => ({
          habits: [
            ...state.habits,
            {
              id: uuid(),
              name: input.name,
              color: input.color,
              frequency: input.frequency,
              reminderTime: input.reminderTime ?? null,
              completions: {},
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateHabit: (id, patch) =>
        set((state) => ({
          habits: state.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)),
        })),

      toggleHabitToday: (id, date) =>
        set((state) => {
          const day = date ?? todayISO();
          return {
            habits: state.habits.map((h) =>
              h.id === id
                ? {
                    ...h,
                    completions: { ...h.completions, [day]: !h.completions[day] },
                  }
                : h,
            ),
          };
        }),

      deleteHabit: (id) =>
        set((state) => ({ habits: state.habits.filter((h) => h.id !== id) })),

      markNotified: (key) =>
        set((state) => ({ notifiedIds: [...state.notifiedIds, key].slice(-500) })),
    }),
    { name: 'todo-app-storage' },
  ),
);
