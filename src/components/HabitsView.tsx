import { useState } from 'react';
import { eachDayOfInterval, format, subDays } from 'date-fns';
import { Plus, Flame, Trash2, Bell } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Habit, HabitFrequency } from '../types';

const COLORS = ['#e11d48', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
const WEEKDAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function computeStreak(habit: Habit): number {
  let streak = 0;
  let day = new Date();
  // if today isn't done yet, start counting from yesterday
  const todayKey = format(day, 'yyyy-MM-dd');
  if (!habit.completions[todayKey]) day = subDays(day, 1);

  for (let i = 0; i < 3650; i++) {
    const key = format(day, 'yyyy-MM-dd');
    const dow = day.getDay();
    const applies = habit.frequency.type === 'daily' || habit.frequency.daysOfWeek.includes(dow);
    if (!applies) {
      day = subDays(day, 1);
      continue;
    }
    if (habit.completions[key]) {
      streak++;
      day = subDays(day, 1);
    } else {
      break;
    }
  }
  return streak;
}

function Last7Days({ habit }: { habit: Habit }) {
  const days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });
  const toggle = useStore((s) => s.toggleHabitToday);
  return (
    <div className="flex gap-1.5">
      {days.map((d) => {
        const key = format(d, 'yyyy-MM-dd');
        const dow = d.getDay();
        const applies = habit.frequency.type === 'daily' || habit.frequency.daysOfWeek.includes(dow);
        const done = habit.completions[key];
        return (
          <button
            key={key}
            disabled={!applies}
            onClick={() => toggle(habit.id, key)}
            title={format(d, 'dd/MM')}
            className={`flex h-8 w-8 flex-col items-center justify-center rounded-md text-[10px] ${
              !applies
                ? 'bg-gray-50 text-gray-300 dark:bg-gray-900'
                : done
                ? 'text-white'
                : 'border border-gray-200 text-gray-500 dark:border-gray-700'
            }`}
            style={applies && done ? { backgroundColor: habit.color } : undefined}
          >
            <span>{WEEKDAY_LABELS[dow]}</span>
          </button>
        );
      })}
    </div>
  );
}

function NewHabitForm({ onClose }: { onClose: () => void }) {
  const addHabit = useStore((s) => s.addHabit);
  const [name, setName] = useState('');
  const [freqType, setFreqType] = useState<'daily' | 'weekly'>('daily');
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [reminderOn, setReminderOn] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');

  function toggleDay(d: number) {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  }

  function submit() {
    if (!name.trim()) return;
    const frequency: HabitFrequency =
      freqType === 'daily' ? { type: 'daily' } : { type: 'weekly', daysOfWeek: days };
    addHabit({
      name: name.trim(),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      frequency,
      reminderTime: reminderOn ? reminderTime : null,
    });
    onClose();
  }

  return (
    <div className="mt-2 rounded-lg border border-gray-100 p-3 dark:border-gray-800">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome do hábito (ex: Beber água)"
        className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
      />
      <div className="mt-2 flex items-center gap-2 text-xs">
        <select
          value={freqType}
          onChange={(e) => setFreqType(e.target.value as 'daily' | 'weekly')}
          className="rounded border border-gray-200 px-2 py-1 dark:border-gray-700 dark:bg-gray-800"
        >
          <option value="daily">Todos os dias</option>
          <option value="weekly">Dias específicos</option>
        </select>
        {freqType === 'weekly' && (
          <div className="flex gap-1">
            {WEEKDAY_LABELS.map((label, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleDay(i)}
                className={`h-6 w-6 rounded-full text-[11px] ${
                  days.includes(i) ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500 dark:bg-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
      <label className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
        <input type="checkbox" checked={reminderOn} onChange={(e) => setReminderOn(e.target.checked)} />
        Lembrete diário
        {reminderOn && (
          <input
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="rounded border border-gray-200 px-2 py-1 dark:border-gray-700 dark:bg-gray-800"
          />
        )}
      </label>
      <div className="mt-3 flex justify-end gap-2">
        <button onClick={onClose} className="rounded px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300">
          Cancelar
        </button>
        <button
          onClick={submit}
          disabled={!name.trim()}
          className="rounded bg-red-500 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
        >
          Criar hábito
        </button>
      </div>
    </div>
  );
}

export default function HabitsView() {
  const habits = useStore((s) => s.habits);
  const deleteHabit = useStore((s) => s.deleteHabit);
  const toggleHabitToday = useStore((s) => s.toggleHabitToday);
  const [showForm, setShowForm] = useState(false);
  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="mx-auto max-w-2xl px-6 py-6">
      <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Hábitos</h1>

      <div className="mt-4 space-y-3">
        {habits.length === 0 && !showForm && (
          <p className="text-sm text-gray-400">Nenhum hábito ainda. Crie o primeiro!</p>
        )}
        {habits.map((h) => {
          const streak = computeStreak(h);
          const doneToday = h.completions[today];
          return (
            <div
              key={h.id}
              className="group rounded-lg border border-gray-100 p-3 dark:border-gray-800"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleHabitToday(h.id)}
                    className="h-6 w-6 rounded-full border-2 transition-colors"
                    style={{
                      borderColor: h.color,
                      backgroundColor: doneToday ? h.color : 'transparent',
                    }}
                  />
                  <span className="font-medium text-gray-800 dark:text-gray-100">{h.name}</span>
                  {h.reminderTime && (
                    <span className="flex items-center gap-0.5 text-xs text-amber-500">
                      <Bell size={11} /> {h.reminderTime}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {streak > 0 && (
                    <span className="flex items-center gap-1 text-xs font-medium text-orange-500">
                      <Flame size={13} /> {streak}
                    </span>
                  )}
                  <button
                    onClick={() => deleteHabit(h.id)}
                    className="rounded p-1 text-gray-300 opacity-0 hover:text-red-500 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="mt-2">
                <Last7Days habit={h} />
              </div>
            </div>
          );
        })}
      </div>

      {showForm ? (
        <NewHabitForm onClose={() => setShowForm(false)} />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="mt-3 flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <Plus size={18} /> Adicionar hábito
        </button>
      )}
    </div>
  );
}
