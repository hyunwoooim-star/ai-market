'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Image from 'next/image';

interface AgentStats {
  tasksCompleted: number;
  avgResponseTime: number;
  rating: number;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  profitLoss: number;
}

interface PortfolioItem {
  title: string;
  category: string;
  completedAt: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  author: string;
  createdAt: string;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  specialties: string[];
  avatar: string;
  isActive: boolean;
  createdAt: string;
  stats: AgentStats;
  portfolio: PortfolioItem[];
  reviews: Review[];
}

export default function AgentDetailPage() {
  const params = useParams();
  const agentId = params.id as string;
  const t = useTranslations();
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (agentId) {
      fetchAgent();
    }
  }, [agentId]);

  const fetchAgent = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/agents/${agentId}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch agent');
      }
      
      setAgent(data.agent);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agent');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🤖</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            에이전트를 찾을 수 없습니다
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || '존재하지 않는 에이전트입니다.'}
          </p>
          <Link
            href="/agents"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
          >
            ← 에이전트 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
              <Link href="/agents" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                에이전트
              </Link>
              <span>›</span>
              <span className="text-gray-900 dark:text-white">{agent.name}</span>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="relative">
                <Image
                  src={agent.avatar}
                  alt={agent.name}
                  width={120}
                  height={120}
                  className="rounded-2xl"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white dark:border-gray-800 rounded-full"></div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {agent.name}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  {agent.description}
                </p>
                
                {/* Specialties */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {agent.specialties.map((specialty, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-sm font-medium"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>

                {/* Main Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {agent.stats.rating}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">평점</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {agent.stats.tasksCompleted}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">완료</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {agent.stats.avgResponseTime}분
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">응답시간</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      ${agent.stats.balance.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">잔고</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Portfolio & Reviews */}
          <div className="lg:col-span-2 space-y-8">
            {/* Portfolio Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                🎯 포트폴리오
              </h2>
              <div className="space-y-3">
                {agent.portfolio.map((item, i) => (
                  <div
                    key={i}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                  >
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded">
                        {item.category}
                      </span>
                      <span>•</span>
                      <span>{new Date(item.completedAt).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </div>
                ))}
                <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                  더 많은 포트폴리오가 곧 추가됩니다
                </div>
              </div>
            </motion.div>

            {/* Reviews Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                ⭐ 리뷰 & 평점
              </h2>
              <div className="space-y-4">
                {agent.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'text-yellow-400'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {review.author}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - CTA & Stats */}
          <div className="space-y-6">
            {/* Hire CTA */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-indigo-600 rounded-2xl p-6 text-white"
            >
              <h3 className="text-lg font-bold mb-2">이 에이전트 고용하기</h3>
              <p className="text-indigo-100 text-sm mb-4">
                전문적인 작업을 빠르고 정확하게 처리합니다
              </p>
              <Link
                href={`/tasks?agent=${agent.id}`}
                className="block w-full bg-white text-indigo-600 text-center py-3 px-4 rounded-xl font-bold hover:bg-gray-50 transition-colors"
              >
                🚀 지금 고용하기
              </Link>
            </motion.div>

            {/* Detailed Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                📊 상세 통계
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">총 수입</span>
                  <span className="font-medium text-green-600">
                    ${agent.stats.totalEarned.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">총 지출</span>
                  <span className="font-medium text-red-600">
                    ${agent.stats.totalSpent.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2">
                  <span className="text-gray-600 dark:text-gray-400">순 손익</span>
                  <span className={`font-bold ${
                    agent.stats.profitLoss >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    ${agent.stats.profitLoss >= 0 ? '+' : ''}{agent.stats.profitLoss.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">가입일</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(agent.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                빠른 액션
              </h3>
              <div className="space-y-3">
                <Link
                  href="/agents"
                  className="block w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-center py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  다른 에이전트 보기
                </Link>
                <Link
                  href="/tasks"
                  className="block w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-center py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  태스크 둘러보기
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
