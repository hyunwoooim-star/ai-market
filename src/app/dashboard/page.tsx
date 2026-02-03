'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  projectMeta,
  keyStats,
  tracks,
  milestones,
  recentActivity,
  type Track,
  type ActivityItem,
} from '@/data/project-status';

function getDaysLeft(target: string) {
  const now = new Date();
  const end = new Date(target + 'T23:59:59+09:00');
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function getDaysSince(start: string) {
  const s = new Date(start + 'T00:00:00+09:00');
  const now = new Date();
  return Math.floor((now.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}

function getProgress(tasks: { done: boolean }[]) {
  if (tasks.length === 0) return 0;
  return Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100);
}

function ProgressBar({ percent, color }: { percent: number; color: string }) {
  return (
    <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div
        className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-700 ease-out`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function TrackCard({ track }: { track: Track }) {
  const [expanded, setExpanded] = useState(false);
  const progress = getProgress(track.tasks);
  const done = track.tasks.filter((t) => t.done).length;
  const total = track.tasks.length;

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 hover:shadow-lg transition-shadow">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{track.emoji}</span>
          <div>
            <h3 className="font-bold text-[var(--text-primary)]">{track.name}</h3>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{track.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-[var(--text-primary)]">{progress}%</span>
          <span className="text-xs text-[var(--text-tertiary)]">
            {done}/{total}
          </span>
          <svg
            className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <div className="mt-3">
        <ProgressBar percent={progress} color={track.color} />
      </div>

      {expanded && (
        <ul className="mt-4 space-y-2">
          {track.tasks.map((task, i) => (
            <li key={i} className="flex items-center gap-2.5 text-sm">
              {task.done ? (
                <span className="text-green-500 flex-shrink-0">✅</span>
              ) : task.current ? (
                <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
                </span>
              ) : (
                <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  <span className="w-2.5 h-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-full" />
                </span>
              )}
              <span
                className={
                  task.done
                    ? 'text-[var(--text-tertiary)] line-through'
                    : task.current
                      ? 'text-blue-500 dark:text-blue-400 font-medium'
                      : 'text-[var(--text-secondary)]'
                }
              >
                {task.name}
                {task.current && (
                  <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full">
                    진행 중
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ActivityBadge({ type }: { type: ActivityItem['type'] }) {
  const styles = {
    feat: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
    fix: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
    info: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
    milestone: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
  };
  const labels = { feat: '기능', fix: '수정', info: '정보', milestone: '마일스톤' };

  return (
    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${styles[type]}`}>
      {labels[type]}
    </span>
  );
}

export default function DashboardPage() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const daysToHashed = getDaysLeft(projectMeta.dDay);
  const daysToHackathon = getDaysLeft(projectMeta.hackathonDeadline);
  const daysSinceStart = getDaysSince(projectMeta.startDate);

  const allTasks = tracks.flatMap((t) => t.tasks);
  const totalProgress = getProgress(allTasks);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  ← 홈
                </Link>
              </div>
              <h1 className="text-2xl font-bold mt-2 flex items-center gap-2">
                🐾 {projectMeta.name}
                <span className="text-base font-normal text-[var(--text-tertiary)]">
                  — {projectMeta.tagline}
                </span>
              </h1>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                Day {daysSinceStart + 1} · 마지막 업데이트{' '}
                {new Date(projectMeta.lastUpdated).toLocaleString('ko-KR', {
                  month: 'numeric',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <a
                href={projectMeta.liveUrl}
                target="_blank"
                className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full font-medium hover:opacity-80 transition"
              >
                🟢 라이브
              </a>
              <a
                href={projectMeta.github}
                target="_blank"
                className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-full font-medium hover:opacity-80 transition"
              >
                GitHub ↗
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* D-Day + Overall Progress */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white">
            <p className="text-xs opacity-80 uppercase tracking-wider">전체 진행률</p>
            <p className="text-4xl font-black mt-1">{totalProgress}%</p>
            <div className="mt-3 w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-700"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
            <p className="text-xs opacity-70 mt-2">
              {allTasks.filter((t) => t.done).length}/{allTasks.length} 태스크 완료
            </p>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
            <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">
              Hashed Vibe Labs
            </p>
            <p className="text-4xl font-black text-red-500 mt-1">D-{daysToHashed}</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-2">
              지원서 마감 {projectMeta.dDay}
            </p>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
            <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">
              솔라나 해커톤
            </p>
            <p className="text-4xl font-black text-orange-500 mt-1">D-{daysToHackathon}</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-2">
              제출 마감 {projectMeta.hackathonDeadline} · $100K
            </p>
          </div>
        </section>

        {/* Key Stats */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {keyStats.map((stat) => (
            <div
              key={stat.label}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 text-center"
            >
              <span className="text-2xl">{stat.emoji}</span>
              <p className="text-xl font-bold text-[var(--text-primary)] mt-1">{stat.value}</p>
              <p className="text-xs text-[var(--text-tertiary)]">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* Tracks */}
        <section>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">📋 트랙 현황</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tracks.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">🗓️ 마일스톤</h2>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
            <div className="space-y-3">
              {milestones.map((ms, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[var(--text-tertiary)] w-12 flex-shrink-0">
                    {ms.date}
                  </span>
                  <div className="flex-shrink-0">
                    {ms.done ? (
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                    ) : (
                      <div className="w-3 h-3 border-2 border-gray-300 dark:border-gray-600 rounded-full" />
                    )}
                  </div>
                  {i < milestones.length - 1 && (
                    <div className="absolute ml-[4.25rem] mt-6 w-0.5 h-4 bg-gray-200 dark:bg-gray-700" />
                  )}
                  <span
                    className={`text-sm ${
                      ms.done
                        ? 'text-[var(--text-tertiary)]'
                        : 'text-[var(--text-primary)] font-medium'
                    }`}
                  >
                    {ms.emoji} {ms.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">⚡ 오늘 활동</h2>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
            <div className="space-y-3">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[var(--text-tertiary)] w-12 flex-shrink-0">
                    {item.time}
                  </span>
                  <ActivityBadge type={item.type} />
                  <span className="text-sm text-[var(--text-secondary)]">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="pb-8">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">🛠️ 기술 스택</h2>
          <div className="flex flex-wrap gap-2">
            {[
              'Next.js 16',
              'TypeScript',
              'Tailwind CSS',
              'Supabase',
              'Gemini 2.0 Flash',
              'Solana Web3.js',
              'Phantom Wallet',
              'USDC (SPL)',
              'Vercel',
              '카카오 OAuth',
              'Framer Motion',
            ].map((tech) => (
              <span
                key={tech}
                className="text-xs bg-[var(--surface-2)] text-[var(--text-secondary)] px-3 py-1.5 rounded-full border border-[var(--border)]"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-6 text-center text-xs text-[var(--text-tertiary)]">
        <p>
          Built by Han + 🐾 Clo · Powered by{' '}
          <a href="https://openclaw.ai" className="underline hover:text-[var(--text-primary)]">
            OpenClaw
          </a>
        </p>
      </footer>
    </div>
  );
}
