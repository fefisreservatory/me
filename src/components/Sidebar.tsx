import { useState } from 'react';
import { Inbox, CalendarDays, CalendarClock, Repeat, Plus, Hash, Trash2, ListChecks } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { ViewId } from '../types';

const COLORS = ['#e11d48', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

function isSameView(a: ViewId, b: ViewId) {
  if (a.kind !== b.kind) return false;
  if (a.kind === 'project' && b.kind === 'project') return a.id === b.id;
  return true;
}

export default function Sidebar({
  view,
  setView,
  open,
  onClose,
}: {
  view: ViewId;
  setView: (v: ViewId) => void;
  open: boolean;
  onClose: () => void;
}) {
  const projects = useStore((s) => s.projects);
  const tasks = useStore((s) => s.tasks);
  const addProject = useStore((s) => s.addProject);
  const deleteProject = useStore((s) => s.deleteProject);
  const [addingProject, setAddingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const go = (v: ViewId) => {
    setView(v);
    onClose();
  };

  const countFor = (projectId: string) =>
    tasks.filter((t) => t.projectId === projectId && !t.completed).length;

  const todayCount = tasks.filter((t) => {
    if (t.completed || !t.dueDate) return false;
    return t.dueDate <= new Date().toISOString().slice(0, 10);
  }).length;

  const NavItem = ({
    icon,
    label,
    active,
    onClick,
    count,
  }: {
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
    count?: number;
  }) => (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm ${
        active
          ? 'bg-red-50 font-medium text-red-600 dark:bg-red-950/40 dark:text-red-400'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
      }`}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {!!count && <span className="text-xs text-gray-400">{count}</span>}
    </button>
  );

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          aria-hidden="true"
        />
      )}
      <aside
        className={`safe-area-shell fixed inset-y-0 left-0 z-40 flex h-full w-64 shrink-0 -translate-x-full flex-col gap-1 overflow-y-auto border-r border-gray-100 bg-gray-50/60 p-3 transition-transform duration-200 dark:border-gray-800 dark:bg-gray-950 md:static md:translate-x-0 md:transition-none ${
          open ? 'translate-x-0' : ''
        }`}
      >
      <NavItem
        icon={<Inbox size={17} />}
        label="Entrada"
        active={isSameView(view, { kind: 'project', id: 'inbox' })}
        onClick={() => go({ kind: 'project', id: 'inbox' })}
        count={countFor('inbox')}
      />
      <NavItem
        icon={<CalendarDays size={17} />}
        label="Hoje"
        active={isSameView(view, { kind: 'today' })}
        onClick={() => go({ kind: 'today' })}
        count={todayCount}
      />
      <NavItem
        icon={<CalendarClock size={17} />}
        label="Em breve"
        active={isSameView(view, { kind: 'upcoming' })}
        onClick={() => go({ kind: 'upcoming' })}
      />
      <NavItem
        icon={<ListChecks size={17} />}
        label="Calendário"
        active={isSameView(view, { kind: 'calendar' })}
        onClick={() => go({ kind: 'calendar' })}
      />
      <NavItem
        icon={<Repeat size={17} />}
        label="Hábitos"
        active={isSameView(view, { kind: 'habits' })}
        onClick={() => go({ kind: 'habits' })}
      />

      <div className="mt-4 flex items-center justify-between px-2.5">
        <span className="text-xs font-semibold uppercase text-gray-400">Projetos</span>
        <button
          onClick={() => setAddingProject((v) => !v)}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
        >
          <Plus size={15} />
        </button>
      </div>

      {addingProject && (
        <div className="flex gap-1 px-2.5">
          <input
            autoFocus
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newProjectName.trim()) {
                addProject(newProjectName.trim(), COLORS[projects.length % COLORS.length]);
                setNewProjectName('');
                setAddingProject(false);
              }
            }}
            placeholder="Nome do projeto"
            className="w-full rounded border border-gray-200 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800"
          />
        </div>
      )}

      {projects
        .filter((p) => p.id !== 'inbox')
        .map((p) => (
          <div key={p.id} className="group flex items-center">
            <div className="flex-1">
              <NavItem
                icon={<Hash size={16} color={p.color} />}
                label={p.name}
                active={isSameView(view, { kind: 'project', id: p.id })}
                onClick={() => go({ kind: 'project', id: p.id })}
                count={countFor(p.id)}
              />
            </div>
            <button
              onClick={() => deleteProject(p.id)}
              className="mr-1 hidden rounded p-1 text-gray-300 hover:text-red-500 group-hover:block"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </aside>
    </>
  );
}
