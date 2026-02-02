'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { AGENTS } from '@/data/agents';
import { CATEGORY_LABELS, AgentCategory } from '@/types/agent';
import Navbar from '@/components/landing/Navbar';

const categories: { key: string; label: string }[] = [
  { key: 'all', label: '🏠 전체' },
  ...Object.entries(CATEGORY_LABELS).map(([key, label]) => ({ key, label })),
];

export default function AgentsPage() {
  const [selected, setSelected] = useState('all');

  const filtered =
    selected === 'all'
      ? AGENTS
      : AGENTS.filter(a => a.category === selected);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              AI 에이전트 카탈로그
            </h1>
            <p className="text-zinc-400">
              목적에 맞는 AI 에이전트를 찾아보세요. 모든 에이전트는 무료 체험 가능합니다.
            </p>
          </motion.div>

          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setSelected(cat.key)}
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selected === cat.key
                    ? 'bg-violet-600 text-white'
                    : 'bg-surface-2/80 text-zinc-400 hover:text-white hover:bg-surface-2'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Agent grid */}
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((agent, i) => (
                <motion.div
                  key={agent.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={`/agents/${agent.id}`}>
                    <div className="group bg-surface rounded-2xl border border-white/5 p-6 hover:border-violet-500/30 hover:bg-surface-2 transition-all cursor-pointer h-full">
                      {/* Header row */}
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform"
                          style={{ background: `${agent.color}20` }}
                        >
                          {agent.icon}
                        </div>
                        <div className="flex items-center gap-2">
                          {agent.status === 'beta' && (
                            <span className="px-2 py-0.5 text-[10px] rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30 font-medium">
                              BETA
                            </span>
                          )}
                          {agent.status === 'coming_soon' && (
                            <span className="px-2 py-0.5 text-[10px] rounded-full bg-zinc-500/20 text-zinc-400 border border-zinc-500/30 font-medium">
                              SOON
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Name + category */}
                      <h3 className="text-lg font-bold text-white mb-1">
                        {agent.nameKo}
                      </h3>
                      <span className="text-xs text-zinc-500">
                        {CATEGORY_LABELS[agent.category]}
                      </span>

                      {/* Description */}
                      <p className="text-sm text-zinc-400 mt-3 leading-relaxed line-clamp-2">
                        {agent.descriptionKo}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {agent.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-[11px] rounded-md bg-white/5 text-zinc-500"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Bottom */}
                      <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-sm text-zinc-500">
                          {agent.pricing.type === 'free'
                            ? '🆓 무료'
                            : agent.pricing.freeMessages
                              ? `${agent.pricing.freeMessages}회 무료체험`
                              : `월 ₩${agent.pricing.monthlyPrice?.toLocaleString()}`}
                        </span>
                        {agent.status !== 'coming_soon' && (
                          <span className="text-sm text-violet-400 group-hover:text-violet-300 font-medium">
                            시작 →
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </div>
      </main>
    </>
  );
}
