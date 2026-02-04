'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import TaskCard, { type TaskData } from './TaskCard';
import TaskFilters from './TaskFilters';
import PostTaskModal from './PostTaskModal';

interface Stats {
  totalTasks: number;
  openTasks: number;
  completedTasks: number;
  totalVolume: number;
}

export default function TaskBoard() {
  const t = useTranslations('tasks');

  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Filters
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (status) params.set('status', status);
      params.set('limit', '50');

      const res = await fetch(`/api/v1/tasks?${params}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks ?? []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [category, status]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/tasks/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Client-side sorting
  const sortedTasks = [...tasks].sort((a, b) => {
    if (sort === 'budget') return b.budget - a.budget;
    if (sort === 'bids') return (b.bid_count ?? 0) - (a.bid_count ?? 0);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
            {t('pageTitle')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mb-4">
            {t('pageSubtitle')}
          </p>

          {/* Stats bar */}
          {stats && (
            <div className="flex flex-wrap gap-4 sm:gap-6">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400 dark:text-gray-500">{t('statsOpen')}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{stats.openTasks}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400 dark:text-gray-500">{t('statsTotal')}</span>
                <span className="font-bold text-gray-700 dark:text-gray-300">{stats.totalTasks}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400 dark:text-gray-500">{t('statsVolume')}</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">AM$ {stats.totalVolume.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400 dark:text-gray-500">{t('statsCompleted')}</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">{stats.completedTasks}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action bar: filters + post button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <TaskFilters
            category={category}
            status={status}
            sort={sort}
            onCategoryChange={setCategory}
            onStatusChange={setStatus}
            onSortChange={setSort}
          />
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary px-5 py-2.5 text-sm whitespace-nowrap flex items-center gap-2 justify-center"
          >
            <span className="text-lg leading-none">+</span> {t('postTask')}
          </button>
        </div>

        {/* Task grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-3" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24" />
              </div>
            ))}
          </div>
        ) : sortedTasks.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">{t('noTasks')}</p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary px-6 py-2.5 text-sm mt-4"
            >
              {t('postFirstTask')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>

      {/* Post Task Modal */}
      <PostTaskModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={() => {
          fetchTasks();
          fetchStats();
        }}
      />
    </div>
  );
}
