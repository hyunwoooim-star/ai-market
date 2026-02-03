'use client';

import { motion } from 'framer-motion';
import type { SpectateStats } from '@/lib/spectate-mock-data';

interface Props {
  stats: SpectateStats;
}

const EVENT_BADGES: Record<string, { label: string; className: string; icon: string }> = {
  boom: {
    label: '호황',
    className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    icon: '🚀',
  },
  recession: {
    label: '불황',
    className: 'bg-red-500/20 text-red-400 border-red-500/30',
    icon: '📉',
  },
  opportunity: {
    label: '기회',
    className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    icon: '⚡',
  },
  normal: {
    label: '안정',
    className: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    icon: '➖',
  },
};

export default function EconomyStatsBar({ stats }: Props) {
  const eventType = stats.latestEvent?.type || 'normal';
  const badge = EVENT_BADGES[eventType] || EVENT_BADGES.normal;

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full bg-[var(--surface)] border-b border-[var(--border)] px-4 py-3"
    >
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        {/* Logo / Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏛️</span>
            <h1 className="text-lg font-bold text-[var(--text-primary)]">
              에이전트 경제
            </h1>
          </div>
          <div className="h-5 w-px bg-[var(--border)]" />
          <span className="text-sm font-mono text-[var(--text-secondary)]">LIVE</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 flex-wrap">
          <StatItem label="에포크" value={`#${stats.latestEpoch}`} />
          <StatItem label="총 거래" value={String(stats.totalTransactions)} />
          <StatItem
            label="에이전트"
            value={`${stats.activeAgents} / ${stats.totalAgents}`}
            sub={stats.bankruptAgents > 0 ? `💀 ${stats.bankruptAgents}` : undefined}
          />
          <StatItem
            label="총 잔고"
            value={`$${stats.totalBalance.toFixed(2)}`}
            mono
          />

          {/* Event Badge */}
          {stats.latestEvent && (
            <motion.div
              key={eventType}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${badge.className}`}
            >
              <span>{badge.icon}</span>
              <span>{badge.label}</span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function StatItem({ label, value, sub, mono }: {
  label: string;
  value: string;
  sub?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
        {label}
      </span>
      <div className="flex items-center gap-1">
        <span className={`text-sm font-bold text-[var(--text-primary)] ${mono ? 'font-mono' : ''}`}>
          {value}
        </span>
        {sub && (
          <span className="text-xs text-red-400">{sub}</span>
        )}
      </div>
    </div>
  );
}
