'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { motion } from 'framer-motion';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { createClient } from '@/lib/supabase';
import StatusBadge from '@/components/tasks/StatusBadge';
import CategoryBadge from '@/components/tasks/CategoryBadge';
import { Link } from '@/i18n/routing';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
  };
}

interface Task {
  id: string;
  title: string;
  category: string;
  budget: number;
  status: string;
  created_at: string;
  assigned_agent_id?: string;
}

interface CreditTransaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  created_at: string;
}

interface UserCredits {
  balance: number;
}

export default function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const router = useRouter();
  const t = useTranslations('dashboard');
  const tTasks = useTranslations('tasks');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<UserCredits>({ balance: 0 });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);

  useEffect(() => {
    const supabase = createClient();

    // Check authentication
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) {
        router.push('/login');
        return;
      }
      
      setUser(user);
      fetchDashboardData(user.id);
    });
  }, [router]);

  const fetchDashboardData = async (userId: string) => {
    const supabase = createClient();
    
    try {
      // Fetch user credits
      const { data: creditsData } = await supabase
        .from('user_credits')
        .select('balance')
        .eq('user_id', userId)
        .single();

      setCredits(creditsData || { balance: 0 });

      // Fetch user tasks
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('id, title, category, budget, status, created_at, assigned_agent_id')
        .eq('poster_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      setTasks(tasksData || []);

      // Fetch recent transactions
      const { data: transactionsData } = await supabase
        .from('credit_transactions')
        .select('id, type, amount, description, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      setTransactions(transactionsData || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'assigned':
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'submitted':
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return '대기중';
      case 'assigned':
      case 'in_progress': return '진행중';
      case 'submitted':
      case 'delivered': return '납품완료';
      case 'completed': return '완료';
      default: return status;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    return `${diffDays}일 전`;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[var(--background)] pt-24 pb-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[var(--background)] pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-4"
            >
              ← {t('home')}
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              대시보드
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              안녕하세요, {user?.user_metadata?.name || user?.email}님!
            </p>
          </div>

          {/* AM$ 잔액 카드 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-8 mb-8 bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold mb-2 opacity-90">AM$ 잔액</h2>
                <div className="text-4xl font-bold mb-4">
                  💎 {credits.balance.toLocaleString()} AM$
                </div>
                <p className="text-indigo-100 text-sm">
                  1 AM$ = ₩10 • 다양한 AI 에이전트에게 작업을 맡기세요
                </p>
              </div>
              <Link
                href="/checkout"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
              >
                충전하기
              </Link>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* 내 태스크 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    📋 내 태스크
                  </h2>
                  <Link
                    href="/tasks"
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium"
                  >
                    전체 보기 →
                  </Link>
                </div>

                {tasks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">📋</div>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      아직 등록한 태스크가 없습니다
                    </p>
                    <Link
                      href="/tasks"
                      className="btn-primary inline-block px-6 py-2.5 text-sm"
                    >
                      첫 태스크 등록하기
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CategoryBadge category={task.category} />
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                {getStatusText(task.status)}
                              </span>
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
                              {task.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                              <span>💎 {task.budget.toLocaleString()} AM$</span>
                              <span>{formatTimeAgo(task.created_at)}</span>
                            </div>
                          </div>
                          <Link
                            href={`/dashboard/tasks/${task.id}`}
                            className="btn-secondary px-4 py-2 text-sm whitespace-nowrap"
                          >
                            보기
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* 최근 거래 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="card p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  💳 최근 거래
                </h2>

                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 dark:text-gray-500 text-3xl mb-3">💳</div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      거래 내역이 없습니다
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {tx.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimeAgo(tx.created_at)}
                          </p>
                        </div>
                        <div className={`text-sm font-bold ${
                          tx.type === 'charge' || tx.amount > 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} AM$
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}