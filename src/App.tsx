import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import Sidebar from './components/Sidebar';
import TaskListView from './components/TaskListView';
import CalendarView from './components/CalendarView';
import HabitsView from './components/HabitsView';
import { useStore } from './store/useStore';
import type { ViewId } from './types';
import { checkReminders, requestNotificationPermission } from './utils/notifications';

function useDarkMode() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);
  return [dark, setDark] as const;
}

export default function App() {
  const [view, setView] = useState<ViewId>({ kind: 'today' });
  const [dark, setDark] = useDarkMode();

  const tasks = useStore((s) => s.tasks);
  const habits = useStore((s) => s.habits);
  const projects = useStore((s) => s.projects);
  const notifiedIds = useStore((s) => s.notifiedIds);
  const markNotified = useStore((s) => s.markNotified);

  useEffect(() => {
    requestNotificationPermission();
    const id = setInterval(() => {
      checkReminders(tasks, habits, notifiedIds, markNotified);
    }, 30_000);
    return () => clearInterval(id);
  }, [tasks, habits, notifiedIds, markNotified]);

  const today = new Date().toISOString().slice(0, 10);

  let content;
  if (view.kind === 'today') {
    content = (
      <TaskListView
        title="Hoje"
        filter={(t) => !!t.dueDate && t.dueDate <= today}
        defaultDate={today}
      />
    );
  } else if (view.kind === 'upcoming') {
    content = <TaskListView title="Em breve" filter={(t) => !!t.dueDate && t.dueDate > today} />;
  } else if (view.kind === 'calendar') {
    content = <CalendarView />;
  } else if (view.kind === 'habits') {
    content = <HabitsView />;
  } else {
    const project = projects.find((p) => p.id === view.id);
    content = (
      <TaskListView
        title={project?.name ?? 'Entrada'}
        filter={(t) => t.projectId === view.id}
        defaultProjectId={view.id}
      />
    );
  }

  return (
    <div className="flex h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Sidebar view={view} setView={setView} />
      <main className="flex-1 overflow-y-auto">
        <div className="flex justify-end px-4 pt-3">
          <button
            onClick={() => setDark(!dark)}
            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
        {content}
      </main>
    </div>
  );
}
