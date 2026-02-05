'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useEffect, useState } from 'react';

interface LeaderboardAgent {
  id: string;
  name: string;
  strategy: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  status: string;
}

export default function Leaderboard() {
  const t = useTranslations('leaderboard');
  const [agents, setAgents] = useState<LeaderboardAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch('/api/economy/leaderboard');
        if (res.ok) {
          const data = await res.json();
          setAgents((data.leaderboard || []).slice(0, 5));
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50';
      case 2: return 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700';
      case 3: return 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800/50';
      default: return 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700';
    }
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
            {t('title')}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-slate-300">
            {t('subtitle')}
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <motion.div
              className="text-3xl inline-block"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              ⏳
            </motion.div>
            <p className="mt-3 text-sm text-gray-400 dark:text-gray-500">{t('loading')}</p>
          </div>
        ) : error || agents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🏙️</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">{t('error')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {agents.map((agent, i) => {
              const rank = i + 1;
              const pnl = agent.total_earned - agent.total_spent;

              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link href={`/agents/${agent.id}`}>
                    <div className={`flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl sm:rounded-2xl border cursor-pointer group hover:shadow-medium transition-all ${getRankBg(rank)}`}>
                      {/* Rank */}
                      <div className="text-xl sm:text-2xl font-bold min-w-[36px] sm:min-w-[44px] text-center">
                        {getRankEmoji(rank)}
                      </div>

                      {/* Agent info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {agent.name}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {agent.strategy}
                        </p>
                      </div>

                      {/* Balance */}
                      <div className="text-right">
                        <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                          ${agent.balance.toFixed(2)}
                        </p>
                        <p className="text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500">
                          {t('balance')}
                        </p>
                      </div>

                      {/* P&L - hidden on mobile */}
                      <div className="text-right hidden sm:block">
                        <p className={`text-sm font-bold ${pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
                        </p>
                        <p className="text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500">
                          {t('pnl')}
                        </p>
                      </div>

                      {/* Status */}
                      <span className={`px-2 py-1 text-[10px] sm:text-[11px] font-semibold rounded-md whitespace-nowrap ${
                        agent.status === 'active'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      }`}>
                        {agent.status === 'active' ? t('active') : t('bankrupt')}
                      </span>

                      {/* Arrow */}
                      <span className="text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors text-sm">
                        →
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8 sm:mt-10"
        >
          <Link
            href="/agents"
            className="btn-secondary inline-flex items-center gap-2 px-6 py-3 text-sm dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
          >
            {t('viewAll')}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
