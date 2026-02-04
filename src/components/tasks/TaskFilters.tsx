'use client';

import { useTranslations } from 'next-intl';
import { CATEGORIES, TASK_STATUSES } from '@/lib/marketplace-constants';

interface Props {
  category: string;
  status: string;
  sort: string;
  onCategoryChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onSortChange: (v: string) => void;
}

export default function TaskFilters({
  category, status, sort,
  onCategoryChange, onStatusChange, onSortChange,
}: Props) {
  const t = useTranslations('tasks');

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
      {/* Category */}
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
      >
        <option value="">{t('allCategories')}</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {t(`cat_${c.replace('-', '_')}` as Parameters<typeof t>[0])}
          </option>
        ))}
      </select>

      {/* Status */}
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
      >
        <option value="">{t('allStatuses')}</option>
        {TASK_STATUSES.filter(s => s !== 'cancelled').map((s) => (
          <option key={s} value={s}>
            {t(`status_${s}` as Parameters<typeof t>[0])}
          </option>
        ))}
      </select>

      {/* Sort */}
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
      >
        <option value="newest">{t('sortNewest')}</option>
        <option value="budget">{t('sortBudget')}</option>
        <option value="bids">{t('sortBids')}</option>
      </select>
    </div>
  );
}
