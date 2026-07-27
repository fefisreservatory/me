import { Flag } from 'lucide-react';
import type { Priority } from '../types';

const COLORS: Record<Priority, string> = {
  1: 'text-red-500',
  2: 'text-orange-500',
  3: 'text-blue-500',
  4: 'text-gray-400',
};

export default function PriorityFlag({ priority, size = 16 }: { priority: Priority; size?: number }) {
  if (priority === 4) return null;
  return <Flag size={size} className={COLORS[priority]} fill="currentColor" />;
}
