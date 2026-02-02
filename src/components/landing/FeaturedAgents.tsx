'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { getFeaturedAgents } from '@/data/agents';
import { CATEGORY_LABELS } from '@/types/agent';

export default function FeaturedAgents() {
  const featured = getFeaturedAgents();

  return (
    <section className="relative py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            🔥 인기 에이전트
          </h2>
          <p className="text-zinc-400 text-lg">
            지금 바로 사용할 수 있는 AI 에이전트들
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featured.map((agent, i) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={`/agents/${agent.id}`}>
                <div className="gradient-border group cursor-pointer">
                  <div className="relative bg-surface rounded-2xl p-6 h-full hover:bg-surface-2 transition-colors">
                    {/* Status badge */}
                    {agent.status === 'beta' && (
                      <span className="absolute top-4 right-4 px-2 py-0.5 text-xs rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30">
                        BETA
                      </span>
                    )}

                    {/* Icon */}
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform"
                      style={{ background: `${agent.color}20` }}
                    >
                      {agent.icon}
                    </div>

                    {/* Name */}
                    <h3 className="text-xl font-bold text-white mb-2">
                      {agent.nameKo}
                    </h3>

                    {/* Category */}
                    <span className="text-xs text-zinc-500">
                      {CATEGORY_LABELS[agent.category]}
                    </span>

                    {/* Description */}
                    <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
                      {agent.descriptionKo}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {agent.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs rounded-md bg-white/5 text-zinc-400"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Pricing */}
                    <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-sm text-zinc-500">
                        {agent.pricing.type === 'free'
                          ? '무료'
                          : agent.pricing.freeMessages
                            ? `${agent.pricing.freeMessages}회 무료`
                            : `월 ₩${agent.pricing.monthlyPrice?.toLocaleString()}`}
                      </span>
                      <span className="text-sm text-violet-400 group-hover:text-violet-300 transition-colors">
                        사용해보기 →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View all */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/agents"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-2/80 border border-border text-zinc-300 hover:text-white hover:bg-surface-2 transition-all"
          >
            전체 에이전트 보기
            <span className="text-violet-400">→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
