import { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Priority, RecurrenceRule } from '../types';

const WEEKDAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export default function TaskModal({
  defaultProjectId,
  defaultDate,
  onClose,
}: {
  defaultProjectId?: string;
  defaultDate?: string;
  onClose: () => void;
}) {
  const addTask = useStore((s) => s.addTask);
  const projects = useStore((s) => s.projects);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId ?? 'inbox');
  const [dueDate, setDueDate] = useState(defaultDate ?? '');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<Priority>(4);
  const [repeatOn, setRepeatOn] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceRule['type']>('daily');
  const [interval, setIntervalVal] = useState(1);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [reminderOn, setReminderOn] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState(30);

  function toggleDay(d: number) {
    setDaysOfWeek((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  }

  function submit() {
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      projectId,
      dueDate: dueDate || undefined,
      dueTime: dueDate ? dueTime || undefined : undefined,
      priority,
      recurrence: repeatOn && dueDate
        ? { type: recurrenceType, interval, daysOfWeek: recurrenceType === 'weekly' ? daysOfWeek : undefined }
        : null,
      reminderMinutesBefore: reminderOn && dueDate && dueTime ? reminderMinutes : null,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-16" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-xl bg-white p-4 shadow-xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Nova tarefa</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={16} />
          </button>
        </div>

        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nome da tarefa"
          className="w-full rounded border-none bg-transparent text-base font-medium text-gray-800 outline-none placeholder:text-gray-400 dark:text-gray-100"
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição"
          rows={2}
          className="mt-1 w-full resize-none rounded border-none bg-transparent text-sm text-gray-600 outline-none placeholder:text-gray-400 dark:text-gray-300"
        />

        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="rounded border border-gray-200 px-2 py-1 dark:border-gray-700 dark:bg-gray-800"
          />
          {dueDate && (
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="rounded border border-gray-200 px-2 py-1 dark:border-gray-700 dark:bg-gray-800"
            />
          )}
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="rounded border border-gray-200 px-2 py-1 dark:border-gray-700 dark:bg-gray-800"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value) as Priority)}
            className="rounded border border-gray-200 px-2 py-1 dark:border-gray-700 dark:bg-gray-800"
          >
            <option value={4}>Prioridade 4</option>
            <option value={3}>Prioridade 3</option>
            <option value={2}>Prioridade 2</option>
            <option value={1}>Prioridade 1</option>
          </select>
        </div>

        {dueDate && (
          <div className="mt-3 space-y-2 rounded-lg bg-gray-50 p-2 dark:bg-gray-800/60">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
              <input type="checkbox" checked={repeatOn} onChange={(e) => setRepeatOn(e.target.checked)} />
              Repetir tarefa
            </label>
            {repeatOn && (
              <div className="flex flex-wrap items-center gap-2 pl-6 text-xs">
                <select
                  value={recurrenceType}
                  onChange={(e) => setRecurrenceType(e.target.value as RecurrenceRule['type'])}
                  className="rounded border border-gray-200 px-2 py-1 dark:border-gray-700 dark:bg-gray-800"
                >
                  <option value="daily">Diariamente</option>
                  <option value="weekdays">Dias úteis</option>
                  <option value="weekly">Semanalmente</option>
                  <option value="monthly">Mensalmente</option>
                </select>
                {(recurrenceType === 'daily' || recurrenceType === 'weekly' || recurrenceType === 'monthly') && (
                  <span className="flex items-center gap-1">
                    a cada
                    <input
                      type="number"
                      min={1}
                      value={interval}
                      onChange={(e) => setIntervalVal(Math.max(1, Number(e.target.value)))}
                      className="w-12 rounded border border-gray-200 px-1 py-1 dark:border-gray-700 dark:bg-gray-800"
                    />
                    {recurrenceType === 'daily' ? 'dia(s)' : recurrenceType === 'weekly' ? 'semana(s)' : 'mês(es)'}
                  </span>
                )}
                {recurrenceType === 'weekly' && (
                  <div className="flex gap-1">
                    {WEEKDAY_LABELS.map((label, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleDay(i)}
                        className={`h-6 w-6 rounded-full text-[11px] ${
                          daysOfWeek.includes(i)
                            ? 'bg-red-500 text-white'
                            : 'bg-white text-gray-500 dark:bg-gray-700'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {dueTime && (
              <>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                  <input
                    type="checkbox"
                    checked={reminderOn}
                    onChange={(e) => setReminderOn(e.target.checked)}
                  />
                  Lembrete
                </label>
                {reminderOn && (
                  <div className="pl-6 text-xs">
                    <select
                      value={reminderMinutes}
                      onChange={(e) => setReminderMinutes(Number(e.target.value))}
                      className="rounded border border-gray-200 px-2 py-1 dark:border-gray-700 dark:bg-gray-800"
                    >
                      <option value={0}>Na hora</option>
                      <option value={10}>10 min antes</option>
                      <option value={30}>30 min antes</option>
                      <option value={60}>1 hora antes</option>
                      <option value={1440}>1 dia antes</option>
                    </select>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={!title.trim()}
            className="rounded bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-40"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
