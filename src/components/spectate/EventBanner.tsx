'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SpectateTransaction, SpectateStats } from '@/lib/spectate-mock-data';

interface EventCard {
  id: string;
  type: 'bankruptcy' | 'large-trade' | 'warning' | 'ranking-change';
  emoji: string;
  title: string;
  description: string;
  agentName?: string;
  amount?: number;
  timestamp: string;
  priority: number; // 높을수록 우선순위
}

interface Props {
  transactions: SpectateTransaction[];
  stats: SpectateStats;
  onEventClick?: (event: EventCard) => void;
}

export default function EventBanner({ transactions, stats, onEventClick }: Props) {
  const [events, setEvents] = useState<EventCard[]>([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  // 이벤트 생성 로직
  useEffect(() => {
    const newEvents: EventCard[] = [];

    // 1. 파산 이벤트 감지
    transactions.forEach(tx => {
      if (tx.narrative && (tx.narrative.includes('bankruptcy') || tx.narrative.includes('파산'))) {
        const agentName = getAgentName(tx.buyer_id);
        newEvents.push({
          id: `bankruptcy-${tx.id}`,
          type: 'bankruptcy',
          emoji: '💀',
          title: '파산 발생!',
          description: `${agentName}이(가) 파산했습니다`,
          agentName,
          timestamp: tx.created_at,
          priority: 100,
        });
      }
    });

    // 2. 대형거래 이벤트 ($10 이상)
    transactions.forEach(tx => {
      if (tx.amount >= 10) {
        const buyerName = getAgentName(tx.buyer_id);
        const sellerName = getAgentName(tx.seller_id);
        newEvents.push({
          id: `large-trade-${tx.id}`,
          type: 'large-trade',
          emoji: '💰',
          title: '대형 거래 발생!',
          description: `${buyerName} → ${sellerName} $${tx.amount.toFixed(2)}`,
          amount: tx.amount,
          timestamp: tx.created_at,
          priority: 70,
        });
      }
    });

    // 3. 경고 이벤트 (잔고 $10 이하)
    stats.agents.forEach(agent => {
      if (agent.balance <= 10 && agent.balance > 0 && agent.status !== 'bankrupt') {
        newEvents.push({
          id: `warning-${agent.id}`,
          type: 'warning',
          emoji: '⚠️',
          title: '위험 신호',
          description: `${agent.name}의 잔고가 $${agent.balance.toFixed(2)}로 위험 수준`,
          agentName: agent.name,
          timestamp: new Date().toISOString(),
          priority: 50,
        });
      }
    });

    // 4. 순위 변동 이벤트 (임시로 랜덤 생성 - 실제로는 이전 순위와 비교)
    if (Math.random() > 0.7) { // 30% 확률로 순위 변동 이벤트
      const randomAgent = stats.agents[Math.floor(Math.random() * stats.agents.length)];
      newEvents.push({
        id: `ranking-${Date.now()}`,
        type: 'ranking-change',
        emoji: '🔄',
        title: '순위 대변동!',
        description: `${randomAgent.name}이(가) 순위에서 큰 변화를 보였습니다`,
        agentName: randomAgent.name,
        timestamp: new Date().toISOString(),
        priority: 40,
      });
    }

    // 우선순위별 정렬 및 최대 5개로 제한
    const sortedEvents = newEvents
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 5);

    setEvents(sortedEvents);
  }, [transactions, stats]);

  // 자동 슬라이드
  useEffect(() => {
    if (events.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentEventIndex((prev) => (prev + 1) % events.length);
    }, 4000); // 4초마다 변경

    return () => clearInterval(interval);
  }, [events.length]);

  const getAgentName = (agentId: string): string => {
    const agentNames: Record<string, string> = {
      translator: '번역봇',
      analyst: '분석봇',
      investor: '투자봇',
      saver: '절약봇',
      gambler: '도박봇',
    };
    return agentNames[agentId] || agentId;
  };

  if (events.length === 0) return null;

  const currentEvent = events[currentEventIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-emerald-500/10 border-b border-purple-500/20"
    >
      <div className="max-w-screen-2xl mx-auto px-4 py-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentEvent.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="flex items-center justify-between"
          >
            {/* 이벤트 내용 */}
            <div 
              className="flex items-center gap-3 cursor-pointer hover:scale-[1.02] transition-transform"
              onClick={() => onEventClick?.(currentEvent)}
            >
              <motion.span 
                className="text-2xl"
                animate={{ 
                  scale: currentEvent.type === 'bankruptcy' ? [1, 1.2, 1] : 1,
                  rotate: currentEvent.type === 'large-trade' ? [0, 10, -10, 0] : 0
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
              >
                {currentEvent.emoji}
              </motion.span>
              
              <div className="flex flex-col">
                <span className={`text-sm font-bold ${getEventColor(currentEvent.type)}`}>
                  {currentEvent.title}
                </span>
                <span className="text-xs text-[var(--text-secondary)]">
                  {currentEvent.description}
                </span>
              </div>

              {/* 실시간 펄스 */}
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </div>
            </div>

            {/* 네비게이션 */}
            {events.length > 1 && (
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {events.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentEventIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentEventIndex 
                          ? 'bg-purple-400' 
                          : 'bg-gray-400/30'
                      }`}
                    />
                  ))}
                </div>
                
                <span className="text-xs text-[var(--text-tertiary)] font-mono">
                  {currentEventIndex + 1}/{events.length}
                </span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function getEventColor(type: string): string {
  const colors: Record<string, string> = {
    bankruptcy: 'text-red-400',
    'large-trade': 'text-emerald-400',
    warning: 'text-amber-400',
    'ranking-change': 'text-blue-400',
  };
  return colors[type] || 'text-[var(--text-primary)]';
}