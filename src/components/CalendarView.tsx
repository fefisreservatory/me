import { useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useStore } from '../store/useStore';
import PriorityFlag from './PriorityFlag';
import TaskModal from './TaskModal';

export default function CalendarView() {
  const tasks = useStore((s) => s.tasks);
  const toggleTask = useStore((s) => s.toggleTask);
  const [cursor, setCursor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor));
    const end = endOfWeek(endOfMonth(cursor));
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, typeof tasks> = {};
    for (const t of tasks) {
      if (!t.dueDate) continue;
      (map[t.dueDate] ??= []).push(t);
    }
    return map;
  }, [tasks]);

  const weekdayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold capitalize text-gray-800 dark:text-gray-100">
          {format(cursor, 'MMMM yyyy', { locale: ptBR })}
        </h1>
        <div className="flex gap-1">
          <button
            onClick={() => setCursor((c) => subMonths(c, 1))}
            className="rounded p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setCursor(new Date())}
            className="rounded px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Hoje
          </button>
          <button
            onClick={() => setCursor((c) => addMonths(c, 1))}
            className="rounded p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-gray-100 bg-gray-100 dark:border-gray-800 dark:bg-gray-800">
        {weekdayLabels.map((d) => (
          <div
            key={d}
            className="bg-gray-50 py-1.5 text-center text-xs font-medium text-gray-500 dark:bg-gray-900 dark:text-gray-400"
          >
            {d}
          </div>
        ))}
        {days.map((day) => {
          const iso = format(day, 'yyyy-MM-dd');
          const dayTasks = tasksByDate[iso] ?? [];
          return (
            <div
              key={iso}
              onClick={() => setSelectedDate(iso)}
              className={`min-h-24 cursor-pointer bg-white p-1.5 dark:bg-gray-950 ${
                !isSameMonth(day, cursor) ? 'opacity-40' : ''
              } ${selectedDate === iso ? 'ring-2 ring-inset ring-red-400' : ''}`}
            >
              <span
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                  isToday(day) ? 'bg-red-500 text-white' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {format(day, 'd')}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayTasks.slice(0, 3).map((t) => (
                  <div
                    key={t.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTask(t.id);
                    }}
                    className={`flex items-center gap-1 truncate rounded px-1 py-0.5 text-[11px] ${
                      t.completed
                        ? 'text-gray-300 line-through'
                        : 'bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-200'
                    }`}
                  >
                    <PriorityFlag priority={t.priority} size={10} />
                    <span className="truncate">{t.title}</span>
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <span className="text-[10px] text-gray-400">+{dayTasks.length - 3} mais</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDate && (
        <div className="mt-4 rounded-lg border border-gray-100 p-3 dark:border-gray-800">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {format(parseISO(selectedDate), "dd 'de' MMMM", { locale: ptBR })}
            </h2>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1 text-xs font-medium text-red-500 hover:underline"
            >
              <Plus size={14} /> Adicionar
            </button>
          </div>
          {(tasksByDate[selectedDate] ?? []).length === 0 && (
            <p className="text-xs text-gray-400">Sem tarefas nesta data.</p>
          )}
          {(tasksByDate[selectedDate] ?? []).map((t) => (
            <div key={t.id} className="flex items-center gap-2 py-1 text-sm">
              <button
                onClick={() => toggleTask(t.id)}
                className={`h-4 w-4 rounded-full border-2 ${
                  t.completed ? 'border-green-500 bg-green-500' : 'border-gray-300'
                }`}
              />
              <span className={t.completed ? 'text-gray-400 line-through' : ''}>{t.title}</span>
              {isSameDay(parseISO(t.dueDate!), new Date()) && (
                <span className="text-xs text-gray-400">{t.dueTime}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && selectedDate && (
        <TaskModal defaultDate={selectedDate} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
