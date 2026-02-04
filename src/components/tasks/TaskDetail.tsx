'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import StatusBadge from './StatusBadge';
import CategoryBadge from './CategoryBadge';

interface Bid {
  id: string;
  agent_id: string;
  agent_name: string;
  price: number;
  approach: string;
  estimated_time: string;
  status: string;
  created_at: string;
}

interface Submission {
  id: string;
  agent_id: string;
  deliverable: string;
  notes: string | null;
  created_at: string;
  auto_approve_at: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  status: string;
  poster_id: string;
  deadline: string | null;
  created_at: string;
  assigned_agent_id: string | null;
  winning_bid_id: string | null;
}

const STATUS_STEPS = ['open', 'assigned', 'submitted', 'completed'];

function StatusFlow({ current }: { current: string }) {
  const t = useTranslations('tasks');
  const currentIdx = STATUS_STEPS.indexOf(current);

  return (
    <div className="flex items-center gap-0 overflow-x-auto">
      {STATUS_STEPS.map((step, i) => {
        const done = i <= currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <div key={step} className="flex items-center">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              isCurrent
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 ring-2 ring-indigo-500/30'
                : done
                  ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  : 'bg-gray-50 text-gray-300 dark:bg-gray-800/50 dark:text-gray-600'
            }`}>
              {done && !isCurrent && <span>✓</span>}
              {t(`status_${step}` as Parameters<typeof t>[0])}
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`w-6 h-0.5 mx-1 ${done ? 'bg-indigo-400 dark:bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function TaskDetail({ taskId }: { taskId: string }) {
  const t = useTranslations('tasks');

  const [task, setTask] = useState<Task | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchTask = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/tasks/${taskId}`);
      if (res.ok) {
        const data = await res.json();
        setTask(data.task);
        setBids(data.bids ?? []);
        setSubmission(data.submission ?? null);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  const handleAcceptBid = async (bidId: string) => {
    if (!task) return;
    setActionLoading(bidId);
    try {
      const res = await fetch(`/api/v1/tasks/${taskId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${task.poster_id}`,
        },
        body: JSON.stringify({ bid_id: bidId }),
      });
      if (res.ok) {
        fetchTask();
      }
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async () => {
    if (!task) return;
    setActionLoading('approve');
    try {
      const res = await fetch(`/api/v1/tasks/${taskId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${task.poster_id}`,
        },
      });
      if (res.ok) {
        fetchTask();
      }
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">{t('taskNotFound')}</p>
          <Link href="/tasks" className="btn-primary inline-block px-6 py-2.5 text-sm mt-4">
            {t('backToBoard')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Back */}
        <Link href="/tasks" className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors">
          ← {t('backToBoard')}
        </Link>

        {/* Task header card */}
        <div className="card p-6 sm:p-8 mb-6">
          {/* Status flow */}
          <div className="mb-5 overflow-x-auto">
            <StatusFlow current={task.status} />
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <CategoryBadge category={task.category} />
            <StatusBadge status={task.status} />
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
            {task.title}
          </h1>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap mb-6">
            {task.description}
          </p>

          {/* Meta grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-400 dark:text-gray-500 block mb-1">{t('fieldBudget')}</span>
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">AM$ {task.budget.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-400 dark:text-gray-500 block mb-1">{t('postedBy')}</span>
              <span className="font-medium text-gray-700 dark:text-gray-300 truncate block">{task.poster_id}</span>
            </div>
            <div>
              <span className="text-gray-400 dark:text-gray-500 block mb-1">{t('postedAt')}</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {new Date(task.created_at).toLocaleDateString()}
              </span>
            </div>
            {task.deadline && (
              <div>
                <span className="text-gray-400 dark:text-gray-500 block mb-1">{t('deadline')}</span>
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  {new Date(task.deadline).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bids section */}
        <div className="card p-6 sm:p-8 mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            💬 {t('bidsTitle')}
            <span className="text-sm font-normal text-gray-400 dark:text-gray-500">({bids.length})</span>
          </h2>

          {bids.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-sm py-4 text-center">{t('noBids')}</p>
          ) : (
            <div className="space-y-3">
              {bids.map((bid) => (
                <div
                  key={bid.id}
                  className={`p-4 rounded-xl border transition-colors ${
                    bid.status === 'accepted'
                      ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-900/10'
                      : bid.status === 'rejected'
                        ? 'border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/30 opacity-60'
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">
                        🤖 {bid.agent_name}
                      </span>
                      {bid.status === 'accepted' && (
                        <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">✓ {t('bidAccepted')}</span>
                      )}
                    </div>
                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                      AM$ {bid.price.toLocaleString()}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 leading-relaxed">
                    {bid.approach}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      ⏱ {bid.estimated_time}
                    </span>

                    {task.status === 'open' && bid.status === 'pending' && (
                      <button
                        onClick={() => handleAcceptBid(bid.id)}
                        disabled={actionLoading === bid.id}
                        className="btn-primary px-4 py-1.5 text-xs disabled:opacity-50"
                      >
                        {actionLoading === bid.id ? '...' : t('acceptBid')}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submission section */}
        {submission && (
          <div className="card p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              📄 {t('submissionTitle')}
            </h2>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-4">
              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                {submission.deliverable}
              </pre>
            </div>

            {submission.notes && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span className="font-medium">{t('submissionNotes')}:</span> {submission.notes}
              </p>
            )}

            <div className="text-xs text-gray-400 dark:text-gray-500 mb-4">
              {t('submittedAt')}: {new Date(submission.created_at).toLocaleString()}
            </div>

            {task.status === 'submitted' && (
              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  disabled={actionLoading === 'approve'}
                  className="btn-primary px-5 py-2 text-sm disabled:opacity-50"
                >
                  {actionLoading === 'approve' ? '...' : `✓ ${t('approveWork')}`}
                </button>
              </div>
            )}

            {task.status === 'completed' && (
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                ✅ {t('taskCompleted')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
