'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import StatusBadge from './StatusBadge';
import CategoryBadge from './CategoryBadge';

export interface TaskData {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  status: string;
  poster_id: string;
  deadline: string | null;
  created_at: string;
  bid_count?: number;
}

function timeAgo(dateStr: string, t: ReturnType<typeof useTranslations<'tasks'>>) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t('justNow');
  if (mins < 60) return t('minutesAgo', { count: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t('hoursAgo', { count: hours });
  const days = Math.floor(hours / 24);
  return t('daysAgo', { count: days });
}

export default function TaskCard({ task }: { task: TaskData }) {
  const t = useTranslations('tasks');

  return (
    <Link href={`/tasks/${task.id}`}>
      <div className="card p-5 h-full flex flex-col gap-3 cursor-pointer">
        {/* Top: category + status */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CategoryBadge category={task.category} />
          <StatusBadge status={task.status} />
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug">
          {task.title}
        </h3>

        {/* Description preview */}
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 flex-1">
          {task.description}
        </p>

        {/* Bottom: budget + meta */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700/50">
          <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            AM$ {task.budget.toLocaleString()}
          </span>
          <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
            {task.bid_count !== undefined && (
              <span className="flex items-center gap-1">
                💬 {task.bid_count} {t('bids')}
              </span>
            )}
            <span>{timeAgo(task.created_at, t)}</span>
          </div>
        </div>

        {/* Deadline (if set) */}
        {task.deadline && (
          <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
            ⏰ {t('deadline')}: {new Date(task.deadline).toLocaleDateString()}
          </div>
        )}
      </div>
    </Link>
  );
}
