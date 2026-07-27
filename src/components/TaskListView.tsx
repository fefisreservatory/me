import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useStore } from '../store/useStore';
import type { Task } from '../types';
import TaskItem from './TaskItem';
import TaskModal from './TaskModal';

export default function TaskListView({
  title,
  filter,
  defaultProjectId,
  defaultDate,
}: {
  title: string;
  filter: (task: Task) => boolean;
  defaultProjectId?: string;
  defaultDate?: string;
}) {
  const tasks = useStore((s) => s.tasks);
  const [showModal, setShowModal] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const filtered = useMemo(() => tasks.filter(filter), [tasks, filter]);
  const pending = filtered.filter((t) => !t.completed);
  const completed = filtered.filter((t) => t.completed);

  return (
    <div className="mx-auto max-w-2xl px-6 py-6">
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{title}</h1>
        <span className="text-sm text-gray-400">{format(new Date(), "dd 'de' MMMM", { locale: ptBR })}</span>
      </div>

      <div className="mt-4 rounded-lg border border-gray-100 dark:border-gray-800">
        {pending.length === 0 && (
          <p className="px-2 py-6 text-center text-sm text-gray-400">Nenhuma tarefa por aqui 🎉</p>
        )}
        {pending
          .sort((a, b) => (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999'))
          .map((t) => (
            <TaskItem key={t.id} task={t} />
          ))}
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="mt-3 flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
      >
        <Plus size={18} /> Adicionar tarefa
      </button>

      {completed.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setShowCompleted((v) => !v)}
            className="text-xs font-medium text-gray-400 hover:text-gray-600"
          >
            {showCompleted ? 'Ocultar' : 'Mostrar'} concluídas ({completed.length})
          </button>
          {showCompleted && (
            <div className="mt-2 rounded-lg border border-gray-100 dark:border-gray-800">
              {completed.map((t) => (
                <TaskItem key={t.id} task={t} />
              ))}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <TaskModal
          defaultProjectId={defaultProjectId}
          defaultDate={defaultDate}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
