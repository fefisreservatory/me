import { format, isPast, isToday, parseISO } from 'date-fns';
import { Repeat, Bell, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Task } from '../types';
import PriorityFlag from './PriorityFlag';
import { describeRecurrence } from '../utils/recurrence';

export default function TaskItem({ task }: { task: Task }) {
  const toggleTask = useStore((s) => s.toggleTask);
  const deleteTask = useStore((s) => s.deleteTask);

  const overdue =
    !task.completed && task.dueDate && isPast(parseISO(task.dueDate)) && !isToday(parseISO(task.dueDate));

  return (
    <div className="group flex items-start gap-3 border-b border-gray-100 dark:border-gray-800 px-2 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-900/50">
      <button
        onClick={() => toggleTask(task.id)}
        className={`mt-0.5 h-[18px] w-[18px] shrink-0 rounded-full border-2 transition-colors ${
          task.completed
            ? 'border-green-500 bg-green-500'
            : 'border-gray-300 dark:border-gray-600 hover:border-red-400'
        }`}
        aria-label="Concluir tarefa"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span
            className={`text-sm ${
              task.completed ? 'text-gray-400 line-through' : 'text-gray-800 dark:text-gray-100'
            }`}
          >
            {task.title}
          </span>
          <PriorityFlag priority={task.priority} size={13} />
        </div>
        {task.description && (
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{task.description}</p>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
          {task.dueDate && (
            <span className={overdue ? 'text-red-500 font-medium' : 'text-gray-500 dark:text-gray-400'}>
              {format(parseISO(task.dueDate), 'dd/MM/yyyy')}
              {task.dueTime ? ` às ${task.dueTime}` : ''}
            </span>
          )}
          {task.recurrence && (
            <span className="flex items-center gap-1 text-purple-500">
              <Repeat size={12} /> {describeRecurrence(task.recurrence)}
            </span>
          )}
          {task.reminderMinutesBefore != null && (
            <span className="flex items-center gap-1 text-amber-500">
              <Bell size={12} /> {task.reminderMinutesBefore} min antes
            </span>
          )}
        </div>
      </div>
      <button
        onClick={() => deleteTask(task.id)}
        className="shrink-0 rounded p-1 text-gray-300 opacity-0 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-950"
        aria-label="Excluir tarefa"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
