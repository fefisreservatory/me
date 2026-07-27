import {
  addDays,
  addMonths,
  addWeeks,
  format,
  getDay,
  parseISO,
} from 'date-fns';
import type { RecurrenceRule } from '../types';

const ISO = 'yyyy-MM-dd';

/** Given a completed task's due date and its recurrence rule, compute the next due date. */
export function getNextDueDate(currentDueDate: string, rule: RecurrenceRule): string {
  const base = parseISO(currentDueDate);

  if (rule.type === 'daily') {
    return format(addDays(base, Math.max(1, rule.interval)), ISO);
  }

  if (rule.type === 'weekdays') {
    let next = addDays(base, 1);
    while (getDay(next) === 0 || getDay(next) === 6) {
      next = addDays(next, 1);
    }
    return format(next, ISO);
  }

  if (rule.type === 'weekly') {
    const days = rule.daysOfWeek && rule.daysOfWeek.length > 0 ? rule.daysOfWeek : [getDay(base)];
    const sorted = [...days].sort((a, b) => a - b);
    const currentDow = getDay(base);

    // find next day-of-week after currentDow within the same week
    const nextInWeek = sorted.find((d) => d > currentDow);
    if (nextInWeek !== undefined) {
      return format(addDays(base, nextInWeek - currentDow), ISO);
    }
    // otherwise jump to the first configured day in the next interval-th week
    const daysUntilWeekStart = 7 * Math.max(1, rule.interval) - currentDow + sorted[0];
    return format(addDays(base, daysUntilWeekStart), ISO);
  }

  if (rule.type === 'monthly') {
    return format(addMonths(base, Math.max(1, rule.interval)), ISO);
  }

  return format(addWeeks(base, 1), ISO);
}

export function describeRecurrence(rule: RecurrenceRule | null | undefined): string {
  if (!rule) return '';
  switch (rule.type) {
    case 'daily':
      return rule.interval > 1 ? `A cada ${rule.interval} dias` : 'Todos os dias';
    case 'weekdays':
      return 'Dias de semana';
    case 'weekly': {
      if (rule.interval > 1) return `A cada ${rule.interval} semanas`;
      const names = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
        return rule.daysOfWeek
          .slice()
          .sort((a, b) => a - b)
          .map((d) => names[d])
          .join(', ');
      }
      return 'Toda semana';
    }
    case 'monthly':
      return rule.interval > 1 ? `A cada ${rule.interval} meses` : 'Todo mês';
    default:
      return '';
  }
}
