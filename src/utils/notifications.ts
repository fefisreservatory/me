import { format } from 'date-fns';
import type { Habit, Task } from '../types';

export function requestNotificationPermission() {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function notify(title: string, body: string) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  new Notification(title, { body, icon: '/checklist.svg' });
}

/**
 * Checks tasks with reminders and habits with a reminder time, firing a browser
 * notification once per key per day. Meant to be called on an interval (e.g. every 30s).
 */
export function checkReminders(
  tasks: Task[],
  habits: Habit[],
  notifiedIds: string[],
  markNotified: (key: string) => void,
) {
  const now = new Date();
  const today = format(now, 'yyyy-MM-dd');

  for (const task of tasks) {
    if (task.completed || !task.dueDate || !task.dueTime) continue;
    if (task.reminderMinutesBefore == null) continue;

    const due = new Date(`${task.dueDate}T${task.dueTime}:00`);
    const remindAt = new Date(due.getTime() - task.reminderMinutesBefore * 60_000);
    const key = `task:${task.id}:${task.dueDate}`;

    if (now >= remindAt && now <= due && !notifiedIds.includes(key)) {
      notify('Lembrete de tarefa', `${task.title} — vence às ${task.dueTime}`);
      markNotified(key);
    }
  }

  for (const habit of habits) {
    if (!habit.reminderTime) continue;
    if (habit.completions[today]) continue;

    const [h, m] = habit.reminderTime.split(':').map(Number);
    const remindAt = new Date(now);
    remindAt.setHours(h, m, 0, 0);
    const key = `habit:${habit.id}:${today}`;

    if (now >= remindAt && now.getTime() - remindAt.getTime() < 30 * 60_000 && !notifiedIds.includes(key)) {
      notify('Lembrete de hábito', `Não esqueça: ${habit.name}`);
      markNotified(key);
    }
  }
}
